from django.contrib.auth import get_user_model

from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken

from firebase_admin import auth

from .serializers import RegisterSerializer
from . import firebase_admin


User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        id_token = request.data.get("idToken")

        if not id_token:
            return Response(
                {"error": "Firebase ID token is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Verify Firebase ID token
            decoded_token = auth.verify_id_token(id_token)

            firebase_uid = decoded_token["uid"]
            email = decoded_token.get("email")
            name = decoded_token.get("name")

            if not email:
                return Response(
                    {"error": "Google account email not found."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Find existing user or create a new one
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": email.split("@")[0],
                }
            )

            # Generate Django JWT tokens
            refresh = RefreshToken.for_user(user)

            return Response(
                {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "name": name,
                    }
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {
                    "error": "Invalid Firebase token.",
                    "details": str(e)
                },
                status=status.HTTP_401_UNAUTHORIZED
            )