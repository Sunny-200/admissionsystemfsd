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
    <div className="page-center">
      <div className="card-container">
        <h1 className="page-title">
            Create Student Account
          </h1>
          <p className="page-subtitle">
            Register to start your admission application
          </p>

          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          {success && <p className="text-green-600 text-sm mb-3">{success}</p>}

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
                placeholder="Minimum 6 characters"
                {...form.register("password")}
                className="form-input"
              />
              <p className="text-red-600 text-xs">
                {form.formState.errors.password?.message}
              </p>
            </div>

            <div className="space-y-1">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                placeholder="Your name"
                {...form.register("name")}
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="form-link cursor-pointer"
            >
              Login
            </span>
          </p>
      </div>
    </div>
  );
}