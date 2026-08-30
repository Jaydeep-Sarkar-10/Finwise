from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.urls import reverse

User = get_user_model()

class TransactionAuthTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpassword"
        )
        self.other_user = User.objects.create_user(
            username="otheruser",
            email="other@example.com",
            password="testpassword"
        )
        self.url = "/api/transactions/"

    def test_unauthenticated_request(self):
        """Test that unauthenticated request returns 401."""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_request(self):
        """Test that authenticated request returns 200."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_isolation(self):
        """Test that a user only sees their own transactions."""
        from transactions.models import Transaction, Category
        category = Category.objects.create(name="Test", user=self.user)
        other_category = Category.objects.create(name="Other", user=self.other_user)
        
        Transaction.objects.create(
            user=self.user,
            amount=100,
            type="expense",
            category=category,
            date="2026-08-01"
        )
        Transaction.objects.create(
            user=self.other_user,
            amount=200,
            type="expense",
            category=other_category,
            date="2026-08-01"
        )
        
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(float(response.data[0]["amount"]), 100)
