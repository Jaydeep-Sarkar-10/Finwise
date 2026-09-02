from django.db import models
from django.db.models import Sum
from django.db.models.functions import TruncDate, TruncMonth
from datetime import date

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Transaction, Savings, Budget, Goal, Notification
from .serializers import (
    CategorySerializer,
    TransactionSerializer,
    SavingsSerializer,
    BudgetSerializer,
    GoalSerializer,
    NotificationSerializer,
)

from .notification_service import (
    check_all_notifications,
)



# =========================
# CATEGORY LIST + CREATE
# =========================

class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(
            models.Q(user=self.request.user) |
            models.Q(user__isnull=True)
        ).order_by("name")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# =========================
# CATEGORY DELETE
# =========================

class CategoryDeleteView(generics.DestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(
            user=self.request.user
        )


# =========================
# TRANSACTION LIST + CREATE
# =========================

class TransactionListCreateView(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(
            user=self.request.user
        ).order_by("-date", "-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# =========================
# TRANSACTION DETAIL
# =========================

class TransactionDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(
            user=self.request.user
        )


def parse_month_param(month_param):
    """
    Parses a 'YYYY-MM' string or defaults to current year and month.
    Returns (year, month, month_str, start_date, end_date)
    """
    today = date.today()
    if month_param:
        try:
            parts = str(month_param).strip().split("-")
            year = int(parts[0])
            month = int(parts[1])
            if 1 <= month <= 12 and 1900 <= year <= 2100:
                month_str = f"{year:04d}-{month:02d}"
            else:
                year, month = today.year, today.month
                month_str = f"{year:04d}-{month:02d}"
        except Exception:
            year, month = today.year, today.month
            month_str = f"{year:04d}-{month:02d}"
    else:
        year, month = today.year, today.month
        month_str = f"{year:04d}-{month:02d}"

    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year + 1, 1, 1)
    else:
        end_date = date(year, month + 1, 1)

    return year, month, month_str, start_date, end_date


def get_prev_month_range(year, month):
    """
    Returns (prev_year, prev_month, prev_month_str, prev_start_date, prev_end_date)
    """
    if month == 1:
        prev_year = year - 1
        prev_month = 12
    else:
        prev_year = year
        prev_month = month - 1

    prev_month_str = f"{prev_year:04d}-{prev_month:02d}"
    prev_start_date = date(prev_year, prev_month, 1)
    if prev_month == 12:
        prev_end_date = date(prev_year + 1, 1, 1)
    else:
        prev_end_date = date(prev_year, prev_month + 1, 1)

    return prev_year, prev_month, prev_month_str, prev_start_date, prev_end_date


# =========================
# FINANCIAL SUMMARY
# =========================

class FinancialSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        month_param = request.query_params.get("month")
        year, month, month_str, start_date, end_date = parse_month_param(month_param)

        # =========================
        # MONTHLY INCOME (Selected Month)
        # =========================
        monthly_income = (
            Transaction.objects
            .filter(
                user=user,
                type=Transaction.TransactionType.INCOME,
                date__gte=start_date,
                date__lt=end_date
            )
            .aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )

        # =========================
        # MONTHLY EXPENSES (Selected Month)
        # =========================
        monthly_expenses = (
            Transaction.objects
            .filter(
                user=user,
                type=Transaction.TransactionType.EXPENSE,
                date__gte=start_date,
                date__lt=end_date
            )
            .aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )

        # =========================
        # MONTHLY SAVINGS (Selected Month)
        # =========================
        monthly_savings = (
            Savings.objects
            .filter(
                user=user,
                created_at__gte=start_date,
                created_at__lt=end_date
            )
            .aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )

        # =========================
        # ALL-TIME TOTALS (Cumulative Balance)
        # =========================
        all_time_income = (
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

        all_time_expenses = (
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

        total_savings = (
            Savings.objects
            .filter(user=user)
            .aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )

        total_balance = (
            all_time_income
            - all_time_expenses
            - total_savings
        )

        monthly_balance = (
            monthly_income
            - monthly_expenses
            - monthly_savings
        )

        # =========================
        # AVAILABLE MONTHS (ALL 12 MONTHS OF THE YEAR)
        # =========================
        # Generate 12 months for the selected year (e.g., 2026-12, 2026-11, ... 2026-01)
        available_months = [f"{year:04d}-{m:02d}" for m in range(12, 0, -1)]

        return Response({
            "month": month_str,
            "total_balance": total_balance,
            "income": monthly_income,
            "expenses": monthly_expenses,
            "savings": monthly_savings,
            "monthly_balance": monthly_balance,
            "all_time_income": all_time_income,
            "all_time_expenses": all_time_expenses,
            "total_savings": total_savings,
            "available_months": available_months,
        })


# =========================
# CATEGORY SPENDING SUMMARY
# =========================

class CategorySpendingSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        month_param = request.query_params.get("month")
        year, month, month_str, start_date, end_date = parse_month_param(month_param)

        category_data = (
            Transaction.objects
            .filter(
                user=user,
                type=Transaction.TransactionType.EXPENSE,
                date__gte=start_date,
                date__lt=end_date
            )
            .values(
                "category__id",
                "category__name"
            )
            .annotate(
                total=Sum("amount")
            )
            .order_by("-total")
        )

        result = []

        for item in category_data:
            result.append({
                "id": item["category__id"],
                "name": item["category__name"],
                "value": item["total"],
            })

        return Response(result)


# =========================
# SPENDING SUMMARY
# =========================

class SpendingSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        month_param = request.query_params.get("month")
        year, month, month_str, start_date, end_date = parse_month_param(month_param)

        spending_data = (
            Transaction.objects
            .filter(
                user=user,
                type=Transaction.TransactionType.EXPENSE,
                date__gte=start_date,
                date__lt=end_date
            )
            .annotate(
                spending_date=TruncDate("date")
            )
            .values("spending_date")
            .annotate(
                total=Sum("amount")
            )
            .order_by("spending_date")
        )

        result = []

        for item in spending_data:
            result.append({
                "date": item["spending_date"],
                "value": item["total"],
            })

        return Response(result)


# =========================
# SAVINGS
# =========================

class SavingsListCreateView(generics.ListCreateAPIView):
    serializer_class = SavingsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Savings.objects.filter(
            user=self.request.user
        ).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user
        )

        # Check notifications after savings are added
        check_all_notifications(
            self.request.user
        )


# =========================
# SAVINGS DETAIL / UPDATE
# =========================

class SavingsDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = SavingsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Savings.objects.filter(
            user=self.request.user
        )

    def perform_update(self, serializer):

        user = self.request.user

        # New amount entered by the user
        new_amount = serializer.validated_data.get("amount")

        # Save the record being edited
        savings = serializer.save()

        # Check notifications after editing savings
        check_all_notifications(user)

# =========================
# BUDGET LIST + CREATE
# =========================

def rollover_budgets(user):
    today = date.today()
    current_month = date(today.year, today.month, 1)

    last_budget = Budget.objects.filter(user=user, month__lt=current_month).order_by('-month').first()
    if not last_budget:
        return

    prev_month = last_budget.month
    prev_budgets = Budget.objects.filter(user=user, month=prev_month)
    
    for pb in prev_budgets:
        Budget.objects.get_or_create(
            user=user,
            category=pb.category,
            month=current_month,
            defaults={'amount': pb.amount}
        )

class BudgetListCreateView(generics.ListCreateAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        rollover_budgets(user)
        today = date.today()
        current_month = date(today.year, today.month, 1)

        budgets = Budget.objects.filter(
            user=user,
            month=current_month
        ).select_related(
            "category"
        ).order_by(
            "category__name"
        )

        return budgets

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user
        )

    def list(self, request, *args, **kwargs):
        user = request.user
        rollover_budgets(user)
        today = date.today()
        current_month = date(today.year, today.month, 1)

        budgets = Budget.objects.filter(
            user=user,
            month=current_month
        ).select_related(
            "category"
        ).order_by(
            "category__name"
        )

        result = []

        for budget in budgets:

            # =========================
            # MONTH RANGE
            # =========================

            month_start = budget.month

            if month_start.month == 12:
                next_month = month_start.replace(
                    year=month_start.year + 1,
                    month=1,
                    day=1
                )
            else:
                next_month = month_start.replace(
                    month=month_start.month + 1,
                    day=1
                )

            # =========================
            # TOTAL SPENDING
            # =========================

            spent = (
                Transaction.objects
                .filter(
                    user=user,
                    category=budget.category,
                    type=Transaction.TransactionType.EXPENSE,
                    date__gte=month_start,
                    date__lt=next_month
                )
                .aggregate(
                    total=Sum("amount")
                )["total"]
                or 0
            )

            # =========================
            # REMAINING
            # =========================

            remaining = (
                budget.amount - spent
            )

            # =========================
            # PERCENTAGE
            # =========================

            if budget.amount > 0:
                percentage = (
                    float(spent) /
                    float(budget.amount)
                ) * 100
            else:
                percentage = 0

            # Don't let the visual progress
            # bar go beyond 100%.

            progress_percentage = min(
                percentage,
                100
            )

            # =========================
            # STATUS
            # =========================

            if spent > budget.amount:

                status = "exceeded"

            elif percentage >= 80:

                status = "warning"

            else:

                status = "safe"

            # =========================
            # RESPONSE
            # =========================

            result.append({

                "id": budget.id,

                "category": budget.category.id,

                "category_name":
                    budget.category.name,

                "amount": budget.amount,

                "month": budget.month,

                "spent": spent,

                "remaining": remaining,

                "percentage": round(
                    percentage,
                    2
                ),

                "progress_percentage":
                    round(
                        progress_percentage,
                        2
                    ),

                "status": status,

                "created_at":
                    budget.created_at,
            })

        return Response(result)


# =========================
# BUDGET DETAIL
# =========================

class BudgetDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = BudgetSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return Budget.objects.filter(
            user=self.request.user
        )


# =========================
# GOAL LIST + CREATE
# =========================

class GoalListCreateView(generics.ListCreateAPIView):
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Goal.objects.filter(
            user=self.request.user
        ).order_by(
            "target_date",
            "-created_at"
        )

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user
        )


# =========================
# GOAL DETAIL
# =========================

class GoalDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Goal.objects.filter(
            user=self.request.user
        )


# =========================
# REPORTS
# =========================

class ReportsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        rollover_budgets(user)
        month_param = request.query_params.get("month")
        year, month, month_str, start_date, end_date = parse_month_param(month_param)
        prev_year, prev_month, prev_month_str, prev_start_date, prev_end_date = get_prev_month_range(year, month)

        # =========================
        # SELECTED MONTH METRICS
        # =========================
        income = (
            Transaction.objects
            .filter(
                user=user,
                type=Transaction.TransactionType.INCOME,
                date__gte=start_date,
                date__lt=end_date
            )
            .aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )

        expenses = (
            Transaction.objects
            .filter(
                user=user,
                type=Transaction.TransactionType.EXPENSE,
                date__gte=start_date,
                date__lt=end_date
            )
            .aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )

        savings = (
            Savings.objects
            .filter(
                user=user,
                created_at__gte=start_date,
                created_at__lt=end_date
            )
            .aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )

        balance = income - expenses - savings

        savings_rate = (
            (float(savings) / float(income)) * 100
            if income > 0
            else 0
        )

        # =========================
        # PREVIOUS MONTH METRICS
        # =========================
        prev_income = (
            Transaction.objects
            .filter(
                user=user,
                type=Transaction.TransactionType.INCOME,
                date__gte=prev_start_date,
                date__lt=prev_end_date
            )
            .aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )

        prev_expenses = (
            Transaction.objects
            .filter(
                user=user,
                type=Transaction.TransactionType.EXPENSE,
                date__gte=prev_start_date,
                date__lt=prev_end_date
            )
            .aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )

        prev_savings = (
            Savings.objects
            .filter(
                user=user,
                created_at__gte=prev_start_date,
                created_at__lt=prev_end_date
            )
            .aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )

        prev_balance = prev_income - prev_expenses - prev_savings

        prev_savings_rate = (
            (float(prev_savings) / float(prev_income)) * 100
            if prev_income > 0
            else 0
        )

        # =========================
        # MONTH-OVER-MONTH COMPARISON
        # =========================
        income_diff = income - prev_income
        income_pct_change = (
            ((float(income) - float(prev_income)) / float(prev_income) * 100)
            if prev_income > 0
            else (100.0 if income > 0 else 0.0)
        )

        expense_diff = expenses - prev_expenses
        expense_pct_change = (
            ((float(expenses) - float(prev_expenses)) / float(prev_expenses) * 100)
            if prev_expenses > 0
            else (100.0 if expenses > 0 else 0.0)
        )

        savings_diff = savings - prev_savings
        savings_pct_change = (
            ((float(savings) - float(prev_savings)) / float(prev_savings) * 100)
            if prev_savings > 0
            else (100.0 if savings > 0 else 0.0)
        )

        comparison = {
            "prev_month": prev_month_str,
            "income": {
                "current": income,
                "previous": prev_income,
                "diff": income_diff,
                "pct_change": round(income_pct_change, 2),
            },
            "expenses": {
                "current": expenses,
                "previous": prev_expenses,
                "diff": expense_diff,
                "pct_change": round(expense_pct_change, 2),
            },
            "savings": {
                "current": savings,
                "previous": prev_savings,
                "diff": savings_diff,
                "pct_change": round(savings_pct_change, 2),
            },
            "savings_rate": {
                "current": round(savings_rate, 2),
                "previous": round(prev_savings_rate, 2),
                "diff": round(savings_rate - prev_savings_rate, 2),
            },
            "balance": {
                "current": balance,
                "previous": prev_balance,
                "diff": balance - prev_balance,
            },
        }

        # =========================
        # ALL-TIME TOTALS
        # =========================
        all_time_income = (
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
        all_time_expenses = (
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
        all_time_savings = (
            Savings.objects
            .filter(user=user)
            .aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )
        all_time_balance = all_time_income - all_time_expenses - all_time_savings

        # =========================
        # CATEGORY SPENDING COMPARISON
        # =========================
        curr_category_qs = (
            Transaction.objects
            .filter(
                user=user,
                type=Transaction.TransactionType.EXPENSE,
                date__gte=start_date,
                date__lt=end_date
            )
            .values("category__id", "category__name")
            .annotate(total=Sum("amount"))
        )
        curr_cat_map = {
            item["category__id"]: {
                "name": item["category__name"],
                "total": item["total"]
            }
            for item in curr_category_qs
        }

        prev_category_qs = (
            Transaction.objects
            .filter(
                user=user,
                type=Transaction.TransactionType.EXPENSE,
                date__gte=prev_start_date,
                date__lt=prev_end_date
            )
            .values("category__id", "category__name")
            .annotate(total=Sum("amount"))
        )
        prev_cat_map = {
            item["category__id"]: {
                "name": item["category__name"],
                "total": item["total"]
            }
            for item in prev_category_qs
        }

        all_cat_ids = set(curr_cat_map.keys()).union(set(prev_cat_map.keys()))
        categories = []
        for cat_id in all_cat_ids:
            name = (
                curr_cat_map.get(cat_id, {}).get("name") or
                prev_cat_map.get(cat_id, {}).get("name")
            )
            c_val = curr_cat_map.get(cat_id, {}).get("total", 0)
            p_val = prev_cat_map.get(cat_id, {}).get("total", 0)
            diff = c_val - p_val
            pct = (
                ((float(c_val) - float(p_val)) / float(p_val) * 100)
                if p_val > 0
                else (100.0 if c_val > 0 else 0.0)
            )
            categories.append({
                "id": cat_id,
                "name": name,
                "value": c_val,
                "prev_value": p_val,
                "diff": diff,
                "pct_change": round(pct, 2),
            })
        categories.sort(key=lambda x: x["value"], reverse=True)

        # =========================
        # MULTI-MONTH HISTORICAL TRENDS
        # =========================
        monthly_data = (
            Transaction.objects
            .filter(user=user)
            .annotate(
                month=TruncMonth("date")
            )
            .values("month", "type")
            .annotate(
                total=Sum("amount")
            )
            .order_by("month")
        )

        monthly_map = {}
        for item in monthly_data:
            if item["month"]:
                m_str = item["month"].strftime("%Y-%m")
                if m_str not in monthly_map:
                    monthly_map[m_str] = {
                        "month": m_str,
                        "income": 0,
                        "expenses": 0,
                        "savings": 0
                    }

                if item["type"] == Transaction.TransactionType.INCOME:
                    monthly_map[m_str]["income"] = item["total"]
                else:
                    monthly_map[m_str]["expenses"] = item["total"]

        monthly_savings = (
            Savings.objects
            .filter(user=user)
            .annotate(
                month=TruncMonth("created_at")
            )
            .values("month")
            .annotate(
                total=Sum("amount")
            )
            .order_by("month")
        )

        for item in monthly_savings:
            if item["month"]:
                m_str = item["month"].strftime("%Y-%m")
                if m_str not in monthly_map:
                    monthly_map[m_str] = {
                        "month": m_str,
                        "income": 0,
                        "expenses": 0,
                        "savings": 0
                    }
                monthly_map[m_str]["savings"] = item["total"]

        # Ensure current and selected months are in monthly_map
        if month_str not in monthly_map:
            monthly_map[month_str] = {
                "month": month_str,
                "income": income,
                "expenses": expenses,
                "savings": savings
            }

        if prev_month_str not in monthly_map:
            monthly_map[prev_month_str] = {
                "month": prev_month_str,
                "income": prev_income,
                "expenses": prev_expenses,
                "savings": prev_savings
            }

        today_month_str = date.today().strftime("%Y-%m")
        if today_month_str not in monthly_map:
            monthly_map[today_month_str] = {
                "month": today_month_str,
                "income": 0,
                "expenses": 0,
                "savings": 0
            }

        monthly = []
        for m_key, data in sorted(monthly_map.items()):
            monthly.append({
                "month": m_key,
                "income": data.get("income", 0),
                "expenses": data.get("expenses", 0),
                "savings": data.get("savings", 0),
                "net": data.get("income", 0) - data.get("expenses", 0) - data.get("savings", 0),
            })

        available_months = sorted(list(monthly_map.keys()), reverse=True)

        # =========================
        # BUDGET PERFORMANCE (for selected month)
        # =========================
        budgets = Budget.objects.filter(
            user=user,
            month__gte=start_date,
            month__lt=end_date
        ).order_by("category__name")

        if not budgets.exists():
            budgets = Budget.objects.filter(user=user).order_by("-month")

        budget_result = []
        for budget in budgets:
            b_start = budget.month
            if b_start.month == 12:
                b_end = date(b_start.year + 1, 1, 1)
            else:
                b_end = date(b_start.year, b_start.month + 1, 1)

            spent = (
                Transaction.objects
                .filter(
                    user=user,
                    category=budget.category,
                    type=Transaction.TransactionType.EXPENSE,
                    date__gte=b_start,
                    date__lt=b_end,
                )
                .aggregate(
                    total=Sum("amount")
                )["total"]
                or 0
            )

            percentage = (
                float(spent) / float(budget.amount) * 100
                if budget.amount > 0
                else 0
            )

            if percentage >= 100:
                status = "exceeded"
            elif percentage >= 80:
                status = "near_limit"
            else:
                status = "healthy"

            remaining = max(
                budget.amount - spent,
                0
            )

            budget_result.append({
                "id": budget.id,
                "category": budget.category.name,
                "amount": budget.amount,
                "spent": spent,
                "remaining": remaining,
                "percentage": round(
                    percentage,
                    2
                ),
                "status": status,
                "month": budget.month,
            })

        # =========================
        # GOALS
        # =========================
        goals = Goal.objects.filter(
            user=user
        ).order_by("target_date")

        total_savings = all_time_savings

        goal_result = []
        for goal in goals:
            target = goal.target_amount
            saved_amount = min(
                total_savings,
                target
            )
            remaining = max(
                target - saved_amount,
                0
            )
            percentage = (
                float(saved_amount) / float(target) * 100
                if target > 0
                else 0
            )
            completed = (
                saved_amount >= target
            )
            goal_result.append({
                "id": goal.id,
                "name": goal.name,
                "target_amount": target,
                "target_date": goal.target_date,
                "saved_amount": saved_amount,
                "remaining_amount": remaining,
                "percentage": round(
                    min(percentage, 100),
                    2
                ),
                "completed": completed,
            })

        # =========================
        # RESPONSE
        # =========================
        return Response({
            "selected_month": month_str,
            "available_months": available_months,
            "overview": {
                "income": income,
                "expenses": expenses,
                "savings": savings,
                "balance": balance,
                "savings_rate": round(
                    savings_rate,
                    2
                ),
                "all_time_income": all_time_income,
                "all_time_expenses": all_time_expenses,
                "all_time_savings": all_time_savings,
                "all_time_balance": all_time_balance,
            },
            "comparison": comparison,
            "monthly": monthly,
            "categories": categories,
            "budgets": budget_result,
            "goals": goal_result,
        })



# =========================================================
# NOTIFICATIONS
# =========================================================

class NotificationListView(
    generics.ListAPIView
):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Notification.objects.filter(
            user=self.request.user
        ).order_by("-created_at")


# =========================================================
# NOTIFICATION DETAIL
# =========================================================

class NotificationDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Notification.objects.filter(
            user=self.request.user
        )


# =========================================================
# MARK ALL NOTIFICATIONS AS READ
# =========================================================

# =========================================================
# MARK ALL NOTIFICATIONS AS READ
# =========================================================

class MarkAllNotificationsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(
            is_read=True
        )

        return Response({
            "message": "All notifications marked as read."
        })


# =========================================================
# MARK ONE NOTIFICATION AS READ
# =========================================================

class MarkNotificationReadView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):

        try:
            notification = Notification.objects.get(
                id=pk,
                user=request.user
            )

        except Notification.DoesNotExist:

            return Response(
                {
                    "error": "Notification not found."
                },
                status=404
            )

        notification.is_read = True
        notification.save(
            update_fields=["is_read"]
        )

        return Response({
            "message": "Notification marked as read."
        })