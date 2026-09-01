from django.conf import settings
from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50, default="circle")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="categories"
    )

    def __str__(self):
        return self.name


class Transaction(models.Model):

    class TransactionType(models.TextChoices):
        INCOME = "income", "Income"
        EXPENSE = "expense", "Expense"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="transactions"
    )

    amount = models.DecimalField(max_digits=12, decimal_places=2)

    type = models.CharField(
        max_length=10,
        choices=TransactionType.choices
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="transactions"
    )

    description = models.CharField(max_length=255, blank=True)

    date = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} - {self.amount}"



class Savings(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="savings"
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.user.username} - ₹{self.amount}"
    


class Budget(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="budgets"
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="budgets"
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    month = models.DateField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        unique_together = ('user', 'category', 'month')

    def __str__(self):
        return (
            f"{self.user.username} - "
            f"{self.category.name} - "
            f"₹{self.amount} - "
            f"{self.month}"
        )


class Goal(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="goals"
    )

    name = models.CharField(
        max_length=100
    )

    target_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    target_date = models.DateField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return (
            f"{self.user.username} - "
            f"{self.name} - "
            f"₹{self.target_amount}"
        )



class Notification(models.Model):

    class NotificationType(models.TextChoices):
        BUDGET_WARNING = "budget_warning", "Budget Warning"
        BUDGET_EXCEEDED = "budget_exceeded", "Budget Exceeded"

        GOAL_MILESTONE = "goal_milestone", "Goal Milestone"
        GOAL_COMPLETED = "goal_completed", "Goal Completed"
        GOAL_DEADLINE = "goal_deadline", "Goal Deadline"
        GOAL_OVERDUE = "goal_overdue", "Goal Overdue"

        SAVINGS_ADDED = "savings_added", "Savings Added"
        SPENDING_ALERT = "spending_alert", "Spending Alert"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications"
    )

    type = models.CharField(
        max_length=30,
        choices=NotificationType.choices
    )

    title = models.CharField(
        max_length=150
    )

    message = models.TextField()

    unique_key = models.CharField(
    max_length=255,
    null=True,
    blank=True,
    )

    is_read = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return (
            f"{self.user.username} - "
            f"{self.title}"
        )