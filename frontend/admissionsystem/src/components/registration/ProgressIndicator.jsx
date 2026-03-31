export function ProgressIndicator({ currentStep }) {
  return (
    <div style={{ display: "flex", gap: "10px" }}>
      {[1, 2, 3].map((step) => (
        <div key={step}>
          {currentStep === step ? `[${step}]` : step}
        </div>
      ))}
    </div>
  );
}