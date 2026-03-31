import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import API from "../api/axios";

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
      // 🔥 call backend
      const res = await API.post("/auth/register", values);

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
    <div className="flex min-h-screen items-center justify-center bg-[#f2f4f8] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">

        <h1 className="text-2xl font-semibold text-center mb-4">
          Create Account
        </h1>

        {error && <p className="text-red-500 text-center">{error}</p>}
        {success && <p className="text-green-500 text-center">{success}</p>}

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

          <input
            type="text"
            placeholder="Name (optional)"
            {...form.register("name")}
            className="w-full border p-2 rounded"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center mt-4">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-600 cursor-pointer"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}