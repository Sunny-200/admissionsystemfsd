import React from "react";
import { cn } from "../../lib/utils";

export function Card({ children, className }) {
  return <div className={cn("border rounded p-4 shadow", className)}>{children}</div>;
}

export function CardHeader({ children }) {
  return <div className="mb-2 font-bold">{children}</div>;
}

export function CardContent({ children }) {
  return <div>{children}</div>;
}

export function CardTitle({ children }) {
  return <h3 className="text-lg font-semibold">{children}</h3>;
}