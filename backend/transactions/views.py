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


# =========================
# FINANCIAL SUMMARY
# =========================

class FinancialSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        # =========================
        # TOTAL INCOME
        # =========================

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

        # =========================
        # TOTAL EXPENSES
        # =========================

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

        # =========================
        # TOTAL SAVINGS
        # =========================

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

        # =========================
        # TOTAL BALANCE
        # =========================

        total_balance = (
            income
            - expenses
            - savings
        )

        return Response({
            "total_balance": total_balance,
            "income": income,
            "expenses": expenses,
            "savings": savings,
        })


# =========================
# CATEGORY SPENDING SUMMARY
# =========================

class CategorySpendingSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        category_data = (
            Transaction.objects
            .filter(
                user=user,
                type=Transaction.TransactionType.EXPENSE
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

        spending_data = (
            Transaction.objects
            .filter(
                user=user,
                type=Transaction.TransactionType.EXPENSE
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

        # Delete all other savings records
        Savings.objects.filter(
            user=user
        ).exclude(
            id=savings.id
        ).delete()

        # Check notifications after editing savings
        check_all_notifications(user)

# =========================
# BUDGET LIST + CREATE
# =========================

class BudgetListCreateView(generics.ListCreateAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        budgets = Budget.objects.filter(
            user=user
        ).select_related(
            "category"
        ).order_by(
            "-month",
            "category__name"
        )

        return budgets

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user
        )

    def list(self, request, *args, **kwargs):
        user = request.user

        budgets = Budget.objects.filter(
            user=user
        ).select_related(
            "category"
        ).order_by(
            "-month",
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

        # =========================
        # OVERVIEW
        # =========================

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

        savings = (
            Savings.objects
            .filter(user=user)
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
        # MONTHLY REPORT
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

            month = item["month"].strftime("%Y-%m")

            if month not in monthly_map:
                monthly_map[month] = {
                    "month": month,
                    "income": 0,
                    "expenses": 0,
                }

            if item["type"] == Transaction.TransactionType.INCOME:
                monthly_map[month]["income"] = item["total"]

            else:
                monthly_map[month]["expenses"] = item["total"]

        # Add savings to monthly data
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

            month = item["month"].strftime("%Y-%m")

            if month not in monthly_map:
                monthly_map[month] = {
                    "month": month,
                    "income": 0,
                    "expenses": 0,
                }

            monthly_map[month]["savings"] = item["total"]

        monthly = []

        for month, data in sorted(monthly_map.items()):

            monthly.append({
                "month": month,
                "income": data.get("income", 0),
                "expenses": data.get("expenses", 0),
                "savings": data.get("savings", 0),
            })

        # =========================
        # CATEGORY SPENDING
        # =========================

        category_data = (
            Transaction.objects
            .filter(
                user=user,
                type=Transaction.TransactionType.EXPENSE
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

        categories = []

        for item in category_data:

            categories.append({
                "id": item["category__id"],
                "name": item["category__name"],
                "value": item["total"],
            })

        # =========================
        # BUDGET PERFORMANCE
        # =========================

        budgets = Budget.objects.filter(
            user=user
        ).order_by("-month")

        budget_result = []

        for budget in budgets:

            start_date = budget.month

            if start_date.month == 12:

                end_date = date(
                    start_date.year + 1,
                    1,
                    1
                )

            else:

                end_date = date(
                    start_date.year,
                    start_date.month + 1,
                    1
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

        total_savings = savings

        goal_result = []

        for goal in goals:

            target = goal.target_amount

            # Savings are shared globally.
            # For now, show the user's total
            # savings against each goal.
            saved_amount = min(
                total_savings,
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
            "overview": {
                "income": income,
                "expenses": expenses,
                "savings": savings,
                "balance": balance,
                "savings_rate": round(
                    savings_rate,
                    2
                ),
            },

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