from django.urls import path

from .views import (
    CategoryListCreateView,
    CategoryDeleteView,
    TransactionListCreateView,
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
]