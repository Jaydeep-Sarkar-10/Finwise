from unittest.mock import patch, MagicMock, PropertyMock
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from google.genai.errors import APIError

User = get_user_model()

class AIAssistantTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpassword",
            first_name="Test",
            last_name="User"
        )
        self.other_user = User.objects.create_user(
            username="otheruser",
            email="other@example.com",
            password="testpassword",
            first_name="Other",
            last_name="User"
        )
        self.url = reverse('ai-chat')

    def test_unauthenticated_request(self):
        """Test that unauthenticated users cannot access the AI."""
        response = self.client.post(self.url, {"message": "Hello"})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_missing_message(self):
        """Test that missing message returns 400."""
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    @patch("ai.views.genai.Client")
    def test_successful_ai_request(self, MockClient):
        """Test a successful AI request with mocked Gemini."""
        # Setup mock
        mock_client_instance = MagicMock()
        MockClient.return_value = mock_client_instance
        mock_chat_instance = MagicMock()
        mock_client_instance.chats.create.return_value = mock_chat_instance
        mock_response = MagicMock()
        mock_response.text = "This is a mocked AI response."
        mock_chat_instance.send_message.return_value = mock_response

        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, {"message": "What is my balance?"})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["reply"], "This is a mocked AI response.")
        self.assertIn("financial_data", response.data)
        
        # Verify the model used
        mock_client_instance.chats.create.assert_called_once()
        call_kwargs = mock_client_instance.chats.create.call_args.kwargs
        self.assertEqual(call_kwargs["model"], "gemini-3.6-flash")
        mock_chat_instance.send_message.assert_called_once()

    @patch("ai.views.genai.Client")
    def test_gemini_api_key_invalid(self, MockClient):
        """Test handling of 400 API_KEY_INVALID error."""
        mock_client_instance = MagicMock()
        MockClient.return_value = mock_client_instance
        
        mock_chat_instance = MagicMock()
        mock_client_instance.chats.create.return_value = mock_chat_instance
        error = APIError(400, {"error": {"message": "API key not valid"}})
        mock_chat_instance.send_message.side_effect = error
        
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, {"message": "Hello"})
        
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertEqual(response.data["error"], "Invalid AI request.")

    @patch("ai.views.genai.Client")
    def test_gemini_quota_exceeded(self, MockClient):
        """Test handling of 429 quota exceeded error."""
        mock_client_instance = MagicMock()
        MockClient.return_value = mock_client_instance
        
        mock_chat_instance = MagicMock()
        mock_client_instance.chats.create.return_value = mock_chat_instance
        # Simulate 429 error
        error = APIError(429, {"error": {"message": "Quota exceeded"}})
        mock_chat_instance.send_message.side_effect = error
        
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, {"message": "Hello"})
        
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertEqual(response.data["error"], "AI service is currently busy. Please try again later.")

    @patch("ai.views.genai.Client")
    def test_gemini_unexpected_error(self, MockClient):
        """Test handling of unexpected generic exception."""
        mock_client_instance = MagicMock()
        MockClient.return_value = mock_client_instance
        
        mock_chat_instance = MagicMock()
        mock_client_instance.chats.create.return_value = mock_chat_instance
        # Simulate generic exception
        mock_chat_instance.send_message.side_effect = Exception("Some weird error")
        
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, {"message": "Hello"})
        
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertEqual(response.data["error"], "AI service is temporarily unavailable.")

    @patch("ai.views.genai.Client")
    def test_gemini_value_error(self, MockClient):
        """Test handling of ValueError when response.text is accessed (e.g. safety block)."""
        mock_client_instance = MagicMock()
        MockClient.return_value = mock_client_instance
        
        mock_chat_instance = MagicMock()
        mock_client_instance.chats.create.return_value = mock_chat_instance
        
        mock_response = MagicMock()
        # Simulate ValueError when accessing .text
        type(mock_response).text = PropertyMock(side_effect=ValueError("Content has no text"))
        mock_chat_instance.send_message.return_value = mock_response
        
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, {"message": "Can I buy a keyboard?"})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["reply"],
            "I'm sorry, I cannot provide financial advice or an answer for this specific query."
        )
