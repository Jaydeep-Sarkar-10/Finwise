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
]