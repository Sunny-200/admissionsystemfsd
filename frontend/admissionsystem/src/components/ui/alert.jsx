import React, { useEffect, useState, useRef } from "react";
import { cn } from "../../lib/utils";

export function Alert({ message, type, duration = 2500, onClose }) {
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!message) return;

    const start = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        clearInterval(intervalRef.current);
        onClose && onClose();
      }
    }, 50);

    return () => clearInterval(intervalRef.current);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={cn("p-4 rounded", type === "error" ? "bg-red-100" : "bg-green-100")}>
      <p>{message}</p>
      <div
        className={cn("h-1 mt-2", type === "error" ? "bg-red-400" : "bg-green-400")}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}