import React from "react";
import { cn } from "../../lib/utils";

export function Input(props) {
  return (
    <input
      {...props}
      className={cn("border p-2 rounded w-full", props.className)}
    />
  );
}