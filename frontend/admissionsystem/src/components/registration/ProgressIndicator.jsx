export function ProgressIndicator({ currentStep }) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-3">
      {[1, 2, 3].map((step) => {
        const isActive = currentStep === step;
        const isCompleted = currentStep > step;

        return (
          <div key={step} className="flex items-center w-full md:w-auto">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold ${
                isCompleted
                  ? "bg-green-600 text-white"
                  : isActive
                  ? "bg-blue-900 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {step}
            </div>
            {step < 3 && <div className="flex-1 h-1 bg-gray-200 mx-2" />}
          </div>
        );
      })}
    </div>
  );
}