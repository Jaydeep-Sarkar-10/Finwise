from django.db import models
from django.db.models import Sum
from django.db.models.functions import TruncDate

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Transaction, Savings, Budget, Goal
from .serializers import (
    CategorySerializer,
    TransactionSerializer,
    SavingsSerializer,
    BudgetSerializer,
    GoalSerializer,
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