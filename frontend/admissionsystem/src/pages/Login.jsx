import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

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
      login(res.data);

      const role = res.data.user.role;

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
    <div className="flex min-h-screen items-center justify-center bg-[#f2f4f8] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">

        <h1 className="text-2xl font-semibold text-center mb-4">
          Welcome Back
        </h1>

        {message && <p className="text-green-500 text-center">{message}</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            {...form.register("email")}
            className="w-full border p-2 rounded"
          />
          <p className="text-red-500 text-sm">
            {form.formState.errors.email?.message}
          </p>

          <input
            type="password"
            placeholder="Password"
            {...form.register("password")}
            className="w-full border p-2 rounded"
          />
          <p className="text-red-500 text-sm">
            {form.formState.errors.password?.message}
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center mt-4">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-blue-600 cursor-pointer"
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}