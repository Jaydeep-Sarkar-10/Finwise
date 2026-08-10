from django.urls import path

from .views import (
    CategoryListCreateView,
    CategoryDeleteView,
    TransactionListCreateView,
    TransactionDetailView,
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
]