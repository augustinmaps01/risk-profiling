import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../layouts";
import { TermsOfServiceModal, PrivacyPolicyModal } from "../components/Modals";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../config/constants";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    middleInitial: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "users", // Default role
    branchId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSymbol: false,
    score: 0,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);

  // Fetch branches on component mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.BRANCHES_DROPDOWN, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (response.data.success) {
          console.log("Branches fetched successfully:", response.data.data);
          const sortedBranches = (response.data.data || []).sort((a, b) => {
            if (a.brcode && b.brcode) {
              return a.brcode.localeCompare(b.brcode);
            }
            return 0;
          });
          setBranches(sortedBranches);
        } else {
          console.error("Failed to fetch branches:", response.data);
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
      } finally {
        setLoadingBranches(false);
      }
    };

    fetchBranches();
  }, []);

  // Password strength validation function
  const validatePasswordStrength = (password) => {
    const errors = [];

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (!/(?=.*[!@#$%^&*()_+=\-\[\]{};':"\\|,.<>/?])/.test(password)) {
      errors.push("Password must contain at least one symbol");
    }

    return errors;
  };

  // Real-time password strength checker
  const checkPasswordStrength = (password) => {
    const strength = {
      hasMinLength: password.length >= 8,
      hasUppercase: /(?=.*[A-Z])/.test(password),
      hasLowercase: /(?=.*[a-z])/.test(password),
      hasNumber: /(?=.*\d)/.test(password),
      hasSymbol: /(?=.*[!@#$%^&*()_+=\-\[\]{};':"\\|,.<>/?])/.test(password),
      score: 0,
    };

    // Calculate score
    strength.score =
      Object.values(strength).filter((val) => val === true).length - 1; // -1 to exclude score itself

    return strength;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Update password strength in real-time
    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const validateForm = () => {
    setError("");

    if (!formData.firstName.trim()) {
      setError("First name is required");
      return false;
    }

    if (!formData.lastName.trim()) {
      setError("Last name is required");
      return false;
    }

    if (!formData.username.trim()) {
      setError("Username is required");
      return false;
    }

    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters long");
      return false;
    }

    if (!formData.email.trim()) {
      setError("Email address is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!formData.password) {
      setError("Password is required");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    // Strong password validation
    const passwordErrors = validatePasswordStrength(formData.password);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join(". "));
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (!formData.role) {
      setError("Please select a role");
      return false;
    }

    if (!formData.branchId) {
      setError("Please select a branch");
      return false;
    }

    if (!agreedToTerms) {
      setError(
        "You must agree to the Terms of Service and Privacy Policy to continue"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userData = {
        first_name: formData.firstName,
        middle_initial: formData.middleInitial || null,
        last_name: formData.lastName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        role: formData.role,
        branch_id: formData.branchId,
      };

      const result = await register(userData);

      if (result.success) {
        // Registration successful
        navigate("/login", {
          state: {
            message:
              "Registration successful! Please sign in with your credentials.",
            type: "success",
          },
        });
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthLayout>
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-6">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Create Account
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Join our risk profiling system
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                    placeholder="First name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label
                    htmlFor="middleInitial"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    M.I.
                  </label>
                  <input
                    id="middleInitial"
                    name="middleInitial"
                    type="text"
                    maxLength="1"
                    value={formData.middleInitial}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white text-center"
                    placeholder="M"
                  />
                </div>

                <div className="col-span-3">
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                    placeholder="Choose a username"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none focus:text-slate-600 transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      // Eye Slash Icon (Hide)
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      // Eye Icon (Show)
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-3 space-y-2">
                    {/* Strength Bar */}
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-2 flex-1 rounded-full transition-all duration-200 ${
                            level <= passwordStrength.score
                              ? passwordStrength.score <= 2
                                ? "bg-red-500"
                                : passwordStrength.score <= 3
                                ? "bg-yellow-500"
                                : passwordStrength.score <= 4
                                ? "bg-blue-500"
                                : "bg-green-500"
                              : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Requirements Checklist */}
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      <div
                        className={`flex items-center space-x-2 ${
                          passwordStrength.hasMinLength
                            ? "text-green-600"
                            : "text-slate-500"
                        }`}
                      >
                        <span
                          className={`w-3 h-3 rounded-full flex items-center justify-center ${
                            passwordStrength.hasMinLength
                              ? "bg-green-100"
                              : "bg-slate-100"
                          }`}
                        >
                          {passwordStrength.hasMinLength ? "✓" : "○"}
                        </span>
                        <span>At least 8 characters</span>
                      </div>
                      <div
                        className={`flex items-center space-x-2 ${
                          passwordStrength.hasUppercase
                            ? "text-green-600"
                            : "text-slate-500"
                        }`}
                      >
                        <span
                          className={`w-3 h-3 rounded-full flex items-center justify-center ${
                            passwordStrength.hasUppercase
                              ? "bg-green-100"
                              : "bg-slate-100"
                          }`}
                        >
                          {passwordStrength.hasUppercase ? "✓" : "○"}
                        </span>
                        <span>One uppercase letter (A-Z)</span>
                      </div>
                      <div
                        className={`flex items-center space-x-2 ${
                          passwordStrength.hasLowercase
                            ? "text-green-600"
                            : "text-slate-500"
                        }`}
                      >
                        <span
                          className={`w-3 h-3 rounded-full flex items-center justify-center ${
                            passwordStrength.hasLowercase
                              ? "bg-green-100"
                              : "bg-slate-100"
                          }`}
                        >
                          {passwordStrength.hasLowercase ? "✓" : "○"}
                        </span>
                        <span>One lowercase letter (a-z)</span>
                      </div>
                      <div
                        className={`flex items-center space-x-2 ${
                          passwordStrength.hasNumber
                            ? "text-green-600"
                            : "text-slate-500"
                        }`}
                      >
                        <span
                          className={`w-3 h-3 rounded-full flex items-center justify-center ${
                            passwordStrength.hasNumber
                              ? "bg-green-100"
                              : "bg-slate-100"
                          }`}
                        >
                          {passwordStrength.hasNumber ? "✓" : "○"}
                        </span>
                        <span>One number (0-9)</span>
                      </div>
                      <div
                        className={`flex items-center space-x-2 ${
                          passwordStrength.hasSymbol
                            ? "text-green-600"
                            : "text-slate-500"
                        }`}
                      >
                        <span
                          className={`w-3 h-3 rounded-full flex items-center justify-center ${
                            passwordStrength.hasSymbol
                              ? "bg-green-100"
                              : "bg-slate-100"
                          }`}
                        >
                          {passwordStrength.hasSymbol ? "✓" : "○"}
                        </span>
                        <span>One symbol (!@#$%^&*)</span>
                      </div>
                    </div>

                    {/* Strength Label */}
                    <div className="text-xs font-medium">
                      Password strength:
                      <span
                        className={`ml-1 ${
                          passwordStrength.score <= 2
                            ? "text-red-600"
                            : passwordStrength.score <= 3
                            ? "text-yellow-600"
                            : passwordStrength.score <= 4
                            ? "text-blue-600"
                            : "text-green-600"
                        }`}
                      >
                        {passwordStrength.score <= 2
                          ? "Weak"
                          : passwordStrength.score <= 3
                          ? "Fair"
                          : passwordStrength.score <= 4
                          ? "Good"
                          : "Strong"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none focus:text-slate-600 transition-colors"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      // Eye Slash Icon (Hide)
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      // Eye Icon (Show)
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                >
                  <option value="">Select your role</option>
                  <option value="users">User</option>
                  <option value="manager">Manager</option>
                  <option value="compliance">Compliance Officer</option>
                  <option value="admin">System Administrator</option>
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  Choose your role in the organization
                </p>
              </div>

              <div>
                <label
                  htmlFor="branchId"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Branch
                </label>
                <select
                  id="branchId"
                  name="branchId"
                  required
                  value={formData.branchId}
                  onChange={handleChange}
                  disabled={loadingBranches}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white disabled:opacity-60"
                >
                  <option value="">
                    {loadingBranches
                      ? "Loading branches..."
                      : "Select your branch"}
                  </option>
                  {branches.map((branch) => (
                    <option key={branch.value} value={branch.value}>
                      {branch.branch_name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  Choose the branch you are assigned to
                </p>
              </div>

              <div
                className={`border rounded-lg p-4 ${
                  !agreedToTerms && error && error.includes("Terms")
                    ? "border-red-300 bg-red-50"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 rounded ${
                        !agreedToTerms && error && error.includes("Terms")
                          ? "border-red-300"
                          : "border-slate-300"
                      }`}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="terms" className="text-slate-700">
                      I agree to the{" "}
                      <button
                        type="button"
                        onClick={() => {
                          console.log("Terms modal clicked");
                          setShowTermsModal(true);
                        }}
                        className="font-medium text-blue-600 hover:text-blue-500 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                      >
                        Terms of Service
                      </button>{" "}
                      and{" "}
                      <button
                        type="button"
                        onClick={() => {
                          console.log("Privacy modal clicked");
                          setShowPrivacyModal(true);
                        }}
                        className="font-medium text-blue-600 hover:text-blue-500 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                      >
                        Privacy Policy
                      </button>
                    </label>
                    <p className="text-xs text-slate-500 mt-1">
                      By creating an account, you acknowledge that you have read
                      and understood our terms and policies.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || !agreedToTerms}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    loading || !agreedToTerms
                      ? "bg-slate-400 cursor-not-allowed opacity-60"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating account...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </button>
                {!agreedToTerms && (
                  <p className="mt-2 text-xs text-slate-500 text-center">
                    Please agree to the Terms of Service and Privacy Policy to
                    continue
                  </p>
                )}
              </div>

              <div className="text-center">
                <p className="text-sm text-slate-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>

          <div className="text-center">
            <p className="text-xs text-slate-500">
              Secure customer risk assessment and compliance management
            </p>
          </div>
        </div>
      </AuthLayout>

      {/* Modals */}
      <TermsOfServiceModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </>
  );
}
