from rest_framework import serializers
from .models import Category, Transaction, Savings


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