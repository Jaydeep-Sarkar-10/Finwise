from datetime import date, timedelta

from django.db.models import Sum

from .models import (
    Budget,
    Goal,
    Savings,
    Transaction,
    Notification,
)


# =========================================================
# CREATE NOTIFICATION SAFELY
# =========================================================

def create_notification(
    user,
    notification_type,
    title,
    message,
    unique_key=None,
):
    """
    Creates a notification only if the same event
    has not already been created.
    """

    if unique_key:
        existing = Notification.objects.filter(
            user=user,
            type=notification_type,
            unique_key=unique_key,
        ).exists()

        if existing:
            return None

    return Notification.objects.create(
        user=user,
        type=notification_type,
        title=title,
        message=message,
        unique_key=unique_key,
    )
# =========================================================
# BUDGET NOTIFICATIONS
# =========================================================

def check_budget_notifications(user):

    budgets = Budget.objects.filter(
        user=user
    ).select_related("category")

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

        if budget.amount <= 0:
            continue

        percentage = (
            float(spent) /
            float(budget.amount)
        ) * 100

        # -----------------------------------------
        # BUDGET EXCEEDED
        # -----------------------------------------

        if percentage > 100:

            exceeded_by = float(
                spent - budget.amount
            )

            message = (
                f"You have exceeded your "
                f"{budget.category.name} budget by "
                f"₹{exceeded_by:,.0f}."
            )

            create_notification(
                user=user,
                notification_type=(
                    Notification.NotificationType
                    .BUDGET_EXCEEDED
                ),
                title="Budget exceeded",
                message=message,
                unique_key=f"budget-exceeded-{budget.id}",
            )

        # -----------------------------------------
        # 80% WARNING
        # -----------------------------------------

        elif percentage >= 80:

            message = (
                f"You have used "
                f"{percentage:.0f}% of your "
                f"{budget.category.name} budget."
            )

            create_notification(
                user=user,
                notification_type=(
                    Notification.NotificationType
                    .BUDGET_WARNING
                ),
                title="Budget almost reached",
                message=message,
                unique_key=f"budget-warning-{budget.id}",
            )


# =========================================================
# GOAL NOTIFICATIONS
# =========================================================

def check_goal_notifications(user):

    goals = Goal.objects.filter(
        user=user
    )

    total_savings = (
        Savings.objects
        .filter(user=user)
        .aggregate(
            total=Sum("amount")
        )["total"]
        or 0
    )

    today = date.today()

    for goal in goals:

        if goal.target_amount <= 0:
            continue

        percentage = (
            float(total_savings) /
            float(goal.target_amount)
        ) * 100

        percentage = min(
            percentage,
            100
        )

        # -----------------------------------------
        # COMPLETED
        # -----------------------------------------

        if percentage >= 100:

            message = (
                f"Congratulations! You have "
                f"reached your {goal.name} goal."
            )

            create_notification(
                user=user,
                notification_type=(
                    Notification.NotificationType
                    .GOAL_COMPLETED
                ),
                title="Goal completed",
                message=message,
                unique_key=f"goal-completed-{goal.id}",
            )

        # -----------------------------------------
        # 75% MILESTONE
        # -----------------------------------------

        elif percentage >= 75:

            message = (
                f"You're {percentage:.0f}% "
                f"towards your {goal.name} goal."
            )

            create_notification(
                user=user,
                notification_type=(
                    Notification.NotificationType
                    .GOAL_MILESTONE
                ),
                title="Almost there!",
                message=message,
                unique_key=f"goal-75-{goal.id}",
            )

        # -----------------------------------------
        # 50% MILESTONE
        # -----------------------------------------

        elif percentage >= 50:

            message = (
                f"You're halfway towards "
                f"your {goal.name} goal."
            )

            create_notification(
                user=user,
                notification_type=(
                    Notification.NotificationType
                    .GOAL_MILESTONE
                ),
                title="Halfway there!",
                message=message,
                unique_key=f"goal-50-{goal.id}",
            )

        # -----------------------------------------
        # 25% MILESTONE
        # -----------------------------------------

        elif percentage >= 25:

            message = (
                f"You're 25% towards "
                f"your {goal.name} goal."
            )

            create_notification(
                user=user,
                notification_type=(
                    Notification.NotificationType
                    .GOAL_MILESTONE
                ),
                title="Goal progress",
                message=message,
                unique_key=f"goal-25-{goal.id}",
            )

        # -----------------------------------------
        # DEADLINE
        # -----------------------------------------

        if not percentage >= 100:

            days_remaining = (
                goal.target_date - today
            ).days

            # 7 days
            if days_remaining == 7:

                message = (
                    f"Your {goal.name} goal "
                    f"is due in 7 days."
                )

                create_notification(
                    user=user,
                    notification_type=(
                        Notification.NotificationType
                        .GOAL_DEADLINE
                    ),
                    title="Goal deadline approaching",
                    message=message,
                    unique_key=f"goal-7days-{goal.id}",
                )

            # 3 days
            elif days_remaining == 3:

                message = (
                    f"Your {goal.name} goal "
                    f"is due in 3 days."
                )

                create_notification(
                    user=user,
                    notification_type=(
                        Notification.NotificationType
                        .GOAL_DEADLINE
                    ),
                    title="Only 3 days left",
                    message=message,
                    unique_key=f"goal-3days-{goal.id}",
                )

            # overdue
            elif days_remaining < 0:

                message = (
                    f"Your {goal.name} goal "
                    f"has passed its target date."
                )

                create_notification(
                    user=user,
                    notification_type=(
                        Notification.NotificationType
                        .GOAL_OVERDUE
                    ),
                    title="Goal overdue",
                    message=message,
                    unique_key=f"goal-overdue-{goal.id}",
                )


# =========================================================
# RUN ALL CHECKS
# =========================================================

def check_all_notifications(user):

    check_budget_notifications(user)

    check_goal_notifications(user)