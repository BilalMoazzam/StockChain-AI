"use client";

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/Login.css";
import { useApp } from "../../context/AppContext";

// ✅ Update this to match your backend
const API_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";


const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { actions } = useApp();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");

  const successMessage = location.state?.message || "";

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setLoginError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store token & user
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      formData.rememberMe
        ? localStorage.setItem("rememberMe", "true")
        : localStorage.removeItem("rememberMe");

      actions.setUser(data.user);

      if (onLoginSuccess) onLoginSuccess();
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      setLoginError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="enhanced-auth-page">
      <div className="auth-background-overlay"></div>
      <div className="enhanced-auth-container">
        <div className="auth-form-box">
          <div className="auth-header">
            <h1>Login Page</h1>
            <p>Fill your information below</p>
          </div>

          {successMessage && (
            <div className="success-alert">{successMessage}</div>
          )}
          {loginError && <div className="error-alert">{loginError}</div>}

          <form className="enhanced-auth-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? "error" : ""}`}
              />
              {errors.email && (
                <span className="field-error">{errors.email}</span>
              )}
            </div>

            <div className="form-field">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? "error" : ""}`}
              />
              {errors.password && (
                <span className="field-error">{errors.password}</span>
              )}
              <div className="forgot-password-link">
                <Link to="/forgot-password">Forget password</Link>
              </div>
            </div>

            <div className="checkbox-section">
              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span className="checkbox-mark"></span>
                Remember me
              </label>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="auth-footer-link">
            <p>
              Don't have an account? <Link to="/signup">Signup now</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
