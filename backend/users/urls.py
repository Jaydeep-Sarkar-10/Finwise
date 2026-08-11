from django.urls import path

from .views import (
    RegisterView,
    GoogleLoginView,
)

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [
    # Normal Signup
    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),

    # Normal Login
    path(
        "login/",
        TokenObtainPairView.as_view(),
        name="token_obtain_pair",
    ),

    # Google Login
    path(
        "google/",
        GoogleLoginView.as_view(),
        name="google-login",
    ),

    # Refresh Access Token
    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),
]