import React from "react";

export function Select({ options, value, onChange }) {
  return (
    <select value={value} onChange={onChange} className="border p-2 w-full">
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}