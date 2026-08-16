from rest_framework import serializers
from .models import Category, Transaction, Savings, Budget, Goal, Notification


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "icon", "user"]
        read_only_fields = ["id", "user"]


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            "id",
            "amount",
            "type",
            "category",
            "description",
            "date",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class SavingsSerializer(serializers.ModelSerializer):

    class Meta:
        model = Savings
        fields = [
            "id",
            "amount",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]


class BudgetSerializer(serializers.ModelSerializer):

    spent = serializers.SerializerMethodField()
    remaining = serializers.SerializerMethodField()
    percentage = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = [
            "id",
            "category",
            "amount",
            "month",
            "spent",
            "remaining",
            "percentage",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "spent",
            "remaining",
            "percentage",
            "created_at",
        ]

    def get_spent(self, budget):
        from django.db.models import Sum
        from datetime import date

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

        spent = Transaction.objects.filter(
            user=budget.user,
            category=budget.category,
            type=Transaction.TransactionType.EXPENSE,
            date__gte=start_date,
            date__lt=end_date,
        ).aggregate(
            total=Sum("amount")
        )["total"]

        return spent or 0

    def get_remaining(self, budget):
        spent = self.get_spent(budget)

        remaining = budget.amount - spent

        return max(remaining, 0)

    def get_percentage(self, budget):
        if budget.amount == 0:
            return 0

        spent = self.get_spent(budget)

        percentage = (
            float(spent) /
            float(budget.amount)
        ) * 100

        return round(percentage, 2)


class GoalSerializer(serializers.ModelSerializer):

    saved_amount = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()
    percentage = serializers.SerializerMethodField()
    completed = serializers.SerializerMethodField()
    days_remaining = serializers.SerializerMethodField()

    class Meta:
        model = Goal

        fields = [
            "id",
            "name",
            "target_amount",
            "target_date",
            "saved_amount",
            "remaining_amount",
            "percentage",
            "completed",
            "days_remaining",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "saved_amount",
            "remaining_amount",
            "percentage",
            "completed",
            "days_remaining",
            "created_at",
        ]

    # =========================
    # TOTAL SAVINGS
    # =========================

    def get_saved_amount(self, goal):

        from django.db.models import Sum
        from .models import Savings

        total_savings = (
            Savings.objects
            .filter(
                user=goal.user
            )
            .aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )

        return total_savings

    # =========================
    # REMAINING AMOUNT
    # =========================

    def get_remaining_amount(self, goal):

        saved_amount = self.get_saved_amount(goal)

        remaining = (
            goal.target_amount -
            saved_amount
        )

        return max(remaining, 0)

    # =========================
    # PROGRESS PERCENTAGE
    # =========================

    def get_percentage(self, goal):

        if goal.target_amount == 0:
            return 0

        saved_amount = self.get_saved_amount(goal)

        percentage = (
            float(saved_amount) /
            float(goal.target_amount)
        ) * 100

        return min(round(percentage, 2), 100)

    # =========================
    # COMPLETED
    # =========================

    def get_completed(self, goal):

        saved_amount = self.get_saved_amount(goal)

        return saved_amount >= goal.target_amount

    # =========================
    # DAYS REMAINING
    # =========================

    def get_days_remaining(self, goal):

        from datetime import date

        today = date.today()

        difference = (
            goal.target_date -
            today
        ).days

        return max(difference, 0)


class NotificationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Notification

        fields = [
            "id",
            "type",
            "title",
            "message",
            "is_read",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]