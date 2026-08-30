from django.conf import settings
from django.db.models import Sum
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from google import genai
from google.genai.errors import APIError

from transactions.models import (
    Transaction,
    Savings,
    Budget,
    Goal,
)


class AIChatView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        message = request.data.get("message")

        if not message:
            return Response(
                {"error": "Message is required."},
                status=400
            )

        user = request.user

        try:

            # =====================================================
            # 1. TOTAL INCOME
            # =====================================================

            income = (
                Transaction.objects
                .filter(
                    user=user,
                    type=Transaction.TransactionType.INCOME
                )
                .aggregate(
                    total=Sum("amount")
                )["total"]
                or 0
            )


            # =====================================================
            # 2. TOTAL EXPENSES
            # =====================================================

            expenses = (
                Transaction.objects
                .filter(
                    user=user,
                    type=Transaction.TransactionType.EXPENSE
                )
                .aggregate(
                    total=Sum("amount")
                )["total"]
                or 0
            )


            # =====================================================
            # 3. TOTAL SAVINGS
            # =====================================================

            savings = (
                Savings.objects
                .filter(
                    user=user
                )
                .aggregate(
                    total=Sum("amount")
                )["total"]
                or 0
            )


            # =====================================================
            # 4. BALANCE
            # =====================================================

            balance = income - expenses - savings


            # =====================================================
            # 5. SAVINGS RATE
            # =====================================================

            if income > 0:
                savings_rate = (
                    float(savings) /
                    float(income)
                ) * 100
            else:
                savings_rate = 0


            # =====================================================
            # 6. CATEGORY SPENDING
            # =====================================================

            category_data = (
                Transaction.objects
                .filter(
                    user=user,
                    type=Transaction.TransactionType.EXPENSE
                )
                .values(
                    "category__name"
                )
                .annotate(
                    total=Sum("amount")
                )
                .order_by("-total")
            )

            category_spending = []

            for item in category_data:

                category_spending.append({
                    "category":
                        item["category__name"],
                    "amount":
                        float(item["total"]),
                })


            # =====================================================
            # 7. BUDGETS
            # =====================================================

            budgets = (
                Budget.objects
                .filter(
                    user=user
                )
                .select_related(
                    "category"
                )
                .order_by("-month")
            )

            budget_data = []

            for budget in budgets:

                start_date = budget.month

                if start_date.month == 12:

                    end_date = start_date.replace(
                        year=start_date.year + 1,
                        month=1,
                        day=1
                    )

                else:

                    end_date = start_date.replace(
                        month=start_date.month + 1,
                        day=1
                    )

                spent = (
                    Transaction.objects
                    .filter(
                        user=user,
                        category=budget.category,
                        type=Transaction.TransactionType.EXPENSE,
                        date__gte=start_date,
                        date__lt=end_date,
                    )
                    .aggregate(
                        total=Sum("amount")
                    )["total"]
                    or 0
                )

                percentage = (
                    float(spent) /
                    float(budget.amount) *
                    100
                    if budget.amount > 0
                    else 0
                )

                budget_data.append({
                    "category":
                        budget.category.name,

                    "budget":
                        float(budget.amount),

                    "spent":
                        float(spent),

                    "remaining":
                        float(
                            max(
                                budget.amount - spent,
                                0
                            )
                        ),

                    "percentage":
                        round(
                            percentage,
                            2
                        ),
                })


            # =====================================================
            # 8. GOALS
            # =====================================================

            goals = (
                Goal.objects
                .filter(
                    user=user
                )
                .order_by("target_date")
            )

            goal_data = []

            for goal in goals:

                target = goal.target_amount

                saved_amount = min(
                    savings,
                    target
                )

                remaining = max(
                    target - saved_amount,
                    0
                )

                percentage = (
                    float(saved_amount) /
                    float(target) *
                    100
                    if target > 0
                    else 0
                )

                days_remaining = (
                    goal.target_date -
                    timezone.localdate()
                ).days

                goal_data.append({

                    "name":
                        goal.name,

                    "target_amount":
                        float(target),

                    "saved_amount":
                        float(saved_amount),

                    "remaining_amount":
                        float(remaining),

                    "percentage":
                        round(
                            min(
                                percentage,
                                100
                            ),
                            2
                        ),

                    "target_date":
                        str(
                            goal.target_date
                        ),

                    "days_remaining":
                        max(
                            days_remaining,
                            0
                        ),

                    "completed":
                        saved_amount >= target,
                })


            # =====================================================
            # 9. RECENT TRANSACTIONS
            # =====================================================

            recent_transactions = (
                Transaction.objects
                .filter(
                    user=user
                )
                .select_related(
                    "category"
                )
                .order_by(
                    "-date",
                    "-created_at"
                )[:10]
            )

            transaction_data = []

            for transaction in recent_transactions:

                transaction_data.append({

                    "amount":
                        float(
                            transaction.amount
                        ),

                    "type":
                        transaction.type,

                    "category":
                        transaction.category.name,

                    "description":
                        transaction.description,

                    "date":
                        str(
                            transaction.date
                        ),
                })


            # =====================================================
            # 10. BUILD FINANCIAL CONTEXT
            # =====================================================

            financial_context = f"""
You are Finwise AI, a personal finance assistant.

You are answering questions using the user's actual
financial data from the Finwise application.

IMPORTANT RULES:

1. Never invent financial numbers.
2. Only use numbers provided in the financial data.
3. If information is unavailable, clearly say that it is unavailable.
4. Do not pretend to know information that is not provided.
5. Give practical and understandable financial advice.
6. Keep answers concise unless the user asks for details.
7. You are a financial assistant, not a financial advisor.
8. Do not recommend illegal or dangerous financial activities.
9. When discussing spending, budgets, savings or goals,
   use the user's actual numbers.

========================
USER FINANCIAL DATA
========================

Total Income:
₹{float(income)}

Total Expenses:
₹{float(expenses)}

Total Savings:
₹{float(savings)}

Current Balance:
₹{float(balance)}

Savings Rate:
{round(savings_rate, 2)}%

========================
CATEGORY SPENDING
========================

{category_spending}

========================
BUDGETS
========================

{budget_data}

========================
GOALS
========================

{goal_data}

========================
RECENT TRANSACTIONS
========================

{transaction_data}

========================
USER QUESTION
========================

{message}

Answer the user's question based strictly
on the financial data above.
"""


            # =====================================================
            # 11. CALL GEMINI
            # =====================================================

            client = genai.Client(
                api_key=settings.GEMINI_API_KEY
            )

            chat = client.chats.create(
                model="gemini-3.6-flash"
            )

            response = chat.send_message(
                message=financial_context
            )


            try:
                reply_text = response.text
            except ValueError:
                # This happens if the model response was blocked by safety filters
                # or if it unexpectedly returned a function call instead of text.
                reply_text = "I'm sorry, I cannot provide financial advice or an answer for this specific query."

            # =====================================================
            # 12. RETURN RESPONSE
            # =====================================================

            return Response({

                "reply":
                    reply_text,

                "financial_data": {

                    "income":
                        float(income),

                    "expenses":
                        float(expenses),

                    "savings":
                        float(savings),

                    "balance":
                        float(balance),

                    "savings_rate":
                        round(
                            savings_rate,
                            2
                        ),
                }
            })


        except APIError as e:
            err_msg = getattr(e, "message", str(e))
            err_code = getattr(e, "code", None)
            
            print("Gemini API Error:", err_msg)
            msg = "AI service is temporarily unavailable."
            
            if err_code in (401, 403):
                msg = "AI service configuration error."
            elif err_code == 429:
                msg = "AI service is currently busy. Please try again later."
            elif err_code == 400:
                msg = "Invalid AI request."
            elif err_code == 404:
                msg = "AI service configuration error (Model not found)."
            
            return Response({"error": msg}, status=500)

        except Exception as error:
            print("Gemini unexpected error:", error)
            return Response(
                {"error": "AI service is temporarily unavailable."},
                status=500
            )