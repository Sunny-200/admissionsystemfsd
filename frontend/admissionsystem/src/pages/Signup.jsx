import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useAuth } from "../context/authContext";

// validation
const schema = z.object({
  email: z.string().email("Enter valid email"),
  password: z.string().min(6, "Minimum 6 characters"),
  name: z.string().optional(),
});

export default function Signup() {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const onSubmit = async (values) => {
    setError("");
    setLoading(true);

    try {
      // 🔥 call backend with expected fields
      await signup({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      setSuccess("Account created successfully!");

      setTimeout(() => {
        navigate("/login?message=Account created! Please login");
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-background">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        <div className="max-w-md mx-auto bg-app-card border border-app-border rounded-xl shadow-lg p-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-app-primary">
            Create Student Account
          </h1>
          <p className="text-sm text-app-muted mt-1 mb-6">
            Register to start your admission application
          </p>

          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          {success && <p className="text-green-600 text-sm mb-3">{success}</p>}

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
                placeholder="Minimum 6 characters"
                {...form.register("password")}
                className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 w-full"
              />
              <p className="text-red-600 text-xs">
                {form.formState.errors.password?.message}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                placeholder="Your name"
                {...form.register("name")}
                className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 w-full"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1e3a8a] text-white hover:bg-[#172554] rounded-md px-4 py-2 text-sm font-medium"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p className="text-sm text-center mt-6 text-app-muted">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-app-primary cursor-pointer font-medium"
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}