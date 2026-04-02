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
    <div className="page-center">
      <div className="card-container">
        <h1 className="page-title">
            Student Login
          </h1>
          <p className="page-subtitle">
            Sign in to access your admission dashboard
          </p>

          {message && <p className="text-green-600 text-sm mb-3">{message}</p>}
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
            <div className="space-y-1">
              <label className="form-label">Email</label>
              <input
                type="email"
                placeholder="name@example.com"
                {...form.register("email")}
                className="form-input"
              />
              <p className="text-red-600 text-xs">
                {form.formState.errors.email?.message}
              </p>
            </div>

            <div className="space-y-1">
              <label className="form-label">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                {...form.register("password")}
                className="form-input"
              />
              <p className="text-red-600 text-xs">
                {form.formState.errors.password?.message}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="form-link cursor-pointer"
            >
              Create one
            </span>
          </p>
      </div>
    </div>
  );
}