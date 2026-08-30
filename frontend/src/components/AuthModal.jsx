import { X } from "lucide-react";
import { useState } from "react";

import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { auth } from "../firebase";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://finwise-utv7.onrender.com";


function AuthModal({ onClose, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState("");


  // =========================
  // NORMAL LOGIN / SIGNUP
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {

      // =========================
      // SIGNUP
      // =========================

      if (!isLogin) {

        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        const registerResponse = await fetch(
          `${API_BASE_URL}/api/auth/register/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username,
              email,
              password,
            }),
          }
        );

        const registerData = await registerResponse.json();

        if (!registerResponse.ok) {
          throw new Error(
            registerData.username?.[0] ||
            registerData.email?.[0] ||
            registerData.password?.[0] ||
            registerData.detail ||
            "Signup failed."
          );
        }


        // Automatically login after signup

        const loginResponse = await fetch(
          `${API_BASE_URL}/api/auth/login/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username,
              password,
            }),
          }
        );

        const loginData = await loginResponse.json();

        if (!loginResponse.ok) {
          throw new Error(
            loginData.detail ||
            "Account created, but automatic login failed."
          );
        }


        // Save JWT

        localStorage.setItem(
          "access",
          loginData.access
        );

        localStorage.setItem(
          "refresh",
          loginData.refresh
        );


        // Save user

        const userData = {
          username,
          email,
        };

        localStorage.setItem(
          "user",
          JSON.stringify(userData)
        );


        // Tell App.jsx

        onLoginSuccess(userData);

        onClose();

        return;
      }


      // =========================
      // LOGIN
      // =========================

      const loginResponse = await fetch(
        `${API_BASE_URL}/api/auth/login/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(
          loginData.detail ||
          "Invalid username or password."
        );
      }


      // Save JWT

      localStorage.setItem(
        "access",
        loginData.access
      );

      localStorage.setItem(
        "refresh",
        loginData.refresh
      );


      // Save user

      const userData = {
        username,
        email,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(userData)
      );


      // Tell App.jsx

      onLoginSuccess(userData);

      onClose();

    } catch (error) {

      console.error(
        "Authentication error:",
        error
      );

      setError(
        error.message ||
        "Something went wrong. Please try again."
      );

    } finally {

      setLoading(false);

    }
  };


  // =========================
  // GOOGLE LOGIN
  // =========================

  const handleGoogleLogin = async () => {

    try {

      setError("");
      setLoadingGoogle(true);

      const provider =
        new GoogleAuthProvider();


      // Firebase Google popup

      const result =
        await signInWithPopup(
          auth,
          provider
        );


      // Firebase ID token

      const firebaseToken =
        await result.user.getIdToken();


      // Send token to Django

      const response = await fetch(
        `${API_BASE_URL}/api/auth/google/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idToken: firebaseToken,
          }),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data.error ||
          data.detail ||
          "Google authentication failed."
        );
      }


      // Save JWT

      localStorage.setItem(
        "access",
        data.access
      );

      localStorage.setItem(
        "refresh",
        data.refresh
      );


      // User returned by Django

      const userData = data.user;


      localStorage.setItem(
        "user",
        JSON.stringify(userData)
      );


      // Tell App.jsx

      onLoginSuccess(userData);

      onClose();

    } catch (error) {

      console.error(
        "Google Login Error:",
        error
      );

      setError(
        error.message ||
        "Google login failed. Please try again."
      );

    } finally {

      setLoadingGoogle(false);

    }
  };


  // =========================
  // SWITCH LOGIN / SIGNUP
  // =========================

  const switchMode = (loginMode) => {

    setIsLogin(loginMode);

    setError("");

    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };


  return (
    <div className="modal-overlay">

      <div className="auth-modal">

        {/* Header */}

        <div className="auth-header">

          <div>

            <h2>
              {isLogin
                ? "Welcome back"
                : "Create your account"}
            </h2>

            <p>
              {isLogin
                ? "Login to continue managing your finances."
                : "Start managing your finances with FinWise."}
            </p>

          </div>


          <button
            className="close-btn"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>

        </div>


        {/* Login / Signup Tabs */}

        <div className="auth-tabs">

          <button
            type="button"
            className={
              isLogin
                ? "auth-tab active"
                : "auth-tab"
            }
            onClick={() => switchMode(true)}
          >
            Login
          </button>


          <button
            type="button"
            className={
              !isLogin
                ? "auth-tab active"
                : "auth-tab"
            }
            onClick={() => switchMode(false)}
          >
            Sign Up
          </button>

        </div>


        {/* Error */}

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}


        {/* Form */}

        <form onSubmit={handleSubmit}>

          {/* Username */}

          <div className="form-group">

            <label>Username</label>

            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              required
            />

          </div>


          {/* Email */}

          {!isLogin && (

            <div className="form-group">

              <label>Email</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />

            </div>

          )}


          {/* Password */}

          <div className="form-group">

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

          </div>


          {/* Confirm Password */}

          {!isLogin && (

            <div className="form-group">

              <label>
                Confirm Password
              </label>

              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                required
              />

            </div>

          )}


          {/* Login / Signup button */}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Login"
              : "Create Account"}
          </button>


          {/* Divider */}

          <div className="auth-divider">

            <span></span>

            <p>OR</p>

            <span></span>

          </div>


          {/* Google */}

          <button
            type="button"
            className="google-btn"
            onClick={handleGoogleLogin}
            disabled={loadingGoogle}
          >
            {loadingGoogle ? (
              "Connecting..."
            ) : (
              <>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ flexShrink: 0 }}
                >
                  <path
                    d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                    fill="#4285F4"
                  />
                  <path
                    d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                    fill="#34A853"
                  />
                  <path
                    d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>

        </form>


        {/* Bottom switch */}

        <p className="auth-switch-text">

          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            type="button"
            onClick={() =>
              switchMode(!isLogin)
            }
          >
            {isLogin
              ? "Sign Up"
              : "Login"}
          </button>

        </p>

      </div>

    </div>
  );
}


export default AuthModal;