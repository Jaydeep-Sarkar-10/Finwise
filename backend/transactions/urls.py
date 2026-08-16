from django.urls import path

from .views import (
    CategoryListCreateView,
    CategoryDeleteView,
    TransactionListCreateView,
    TransactionDetailView,
    FinancialSummaryView,
    CategorySpendingSummaryView,
    SpendingSummaryView,
    SavingsListCreateView,
    BudgetListCreateView,
    BudgetDetailView,
    GoalListCreateView,
    GoalDetailView,
    ReportsView,
    NotificationListView,
    NotificationDetailView,
    MarkAllNotificationsReadView,
    MarkNotificationReadView,
    SavingsDetailView,
)


urlpatterns = [
    path(
        "categories/",
        CategoryListCreateView.as_view(),
        name="category-list-create",
    ),

    path(
        "categories/<int:pk>/",
        CategoryDeleteView.as_view(),
        name="category-delete",
    ),

    path(
        "",
        TransactionListCreateView.as_view(),
        name="transaction-list-create",
    ),

    path(
        "<int:pk>/",
        TransactionDetailView.as_view(),
        name="transaction-detail",
    ),

    path(
        "summary/",
        FinancialSummaryView.as_view(),
        name="financial-summary",
    ),

    path(
        "category-summary/",
        CategorySpendingSummaryView.as_view(),
        name="category-spending-summary",
    ),

    path(
        "spending-summary/",
        SpendingSummaryView.as_view(),
        name="spending-summary",
    ),

    path(
        "savings/",
        SavingsListCreateView.as_view(),
        name="savings-list-create",
    ),

    path(
    "savings/<int:pk>/",
    SavingsDetailView.as_view()
),

        path(
        "budgets/",
        BudgetListCreateView.as_view(),
        name="budget-list-create",
    ),

    path(
        "budgets/<int:pk>/",
        BudgetDetailView.as_view(),
        name="budget-detail",
    ),

    path(
    "goals/",
    GoalListCreateView.as_view(),
    name="goal-list-create",
    ),

    path(
    "goals/<int:pk>/",
    GoalDetailView.as_view(),
    name="goal-detail",
    ),

    path(
    "reports/",
    ReportsView.as_view(),
    ),

    path(
    "notifications/",
    NotificationListView.as_view(),
),

path(
    "notifications/<int:pk>/",
    NotificationDetailView.as_view(),
),

path(
    "notifications/mark-all-read/",
    MarkAllNotificationsReadView.as_view(),
),

path(
    "notifications/<int:pk>/read/",
    MarkNotificationReadView.as_view(),
    name="notification-read"
),
]