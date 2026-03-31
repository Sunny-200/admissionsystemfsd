import React, { useState } from "react";

export function PasswordInput(props) {
  const [show, setShow] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        {...props}
        className="border p-2 w-full"
      />

      <button
        type="button"
        onClick={() => setShow(!show)}
        style={{ position: "absolute", right: 10, top: 5 }}
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}