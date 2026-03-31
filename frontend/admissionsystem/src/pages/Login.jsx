import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import API from "../api/axios";
import { useAuth } from "../context/authContext";

// Validation
const schema = z.object({
  email: z.string().email("Enter valid email"),
  password: z.string().min(1, "Password required"),
});

export default function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const message = searchParams.get("message");

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values) => {
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/login", values);

      // 🔐 store token + user
      const token = res.data.data.token;
      const user = res.data.data.user;
      login({ token, user });

      const role = user.role;

      // 🔁 redirect
      if (role === "ADMIN") navigate("/admin");
      else if (role === "VERIFIER") navigate("/verifier");
      else navigate("/dashboard");

    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-background">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        <div className="max-w-md mx-auto bg-app-card border border-app-border rounded-xl shadow-lg p-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-app-primary">
            Student Login
          </h1>
          <p className="text-sm text-app-muted mt-1 mb-6">
            Sign in to access your admission dashboard
          </p>

          {message && <p className="text-green-600 text-sm mb-3">{message}</p>}
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                placeholder="name@example.com"
                {...form.register("email")}
                className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 w-full"
              />
              <p className="text-red-600 text-xs">
                {form.formState.errors.email?.message}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                {...form.register("password")}
                className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 w-full"
              />
              <p className="text-red-600 text-xs">
                {form.formState.errors.password?.message}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1e3a8a] text-white hover:bg-[#172554] rounded-md px-4 py-2 text-sm font-medium"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-sm text-center mt-6 text-app-muted">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="text-app-primary cursor-pointer font-medium"
            >
              Create one
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}