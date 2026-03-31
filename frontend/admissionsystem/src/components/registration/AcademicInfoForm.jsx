export function AcademicInfoForm({ form, onSubmit, onBack }) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

      <h2 className="text-lg font-semibold">Academic Details</h2>

      <input
        placeholder="Aadhar Number"
        {...form.register("aadharNumber")}
        className="w-full border p-2 rounded"
      />

      <input
        placeholder="Religion"
        {...form.register("religion")}
        className="w-full border p-2 rounded"
      />

      <select {...form.register("casteCategory")} className="w-full border p-2 rounded">
        <option value="GENERAL">General</option>
        <option value="GENERAL_EWS">General (EWS)</option>
        <option value="OBC_NCL">OBC</option>
        <option value="SC">SC</option>
        <option value="ST">ST</option>
      </select>

      <select {...form.register("branchAllotted")} className="w-full border p-2 rounded">
        <option value="CSE">CSE</option>
        <option value="ECE">ECE</option>
        <option value="DSAI">DSAI</option>
      </select>

      <select {...form.register("seatAllotmentSource")} className="w-full border p-2 rounded">
        <option value="JOSSA">JOSSA</option>
        <option value="CSAB">CSAB</option>
      </select>

      <input
        placeholder="Blood Group"
        {...form.register("bloodGroup")}
        className="w-full border p-2 rounded"
      />

      <textarea
        placeholder="Address"
        {...form.register("permanentAddress")}
        className="w-full border p-2 rounded"
      />

      <input
        placeholder="State"
        {...form.register("state")}
        className="w-full border p-2 rounded"
      />

      <textarea
        placeholder="Remarks"
        {...form.register("remarksFromStudent")}
        className="w-full border p-2 rounded"
      />

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="border px-4 py-2 rounded"
        >
          Back
        </button>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Next
        </button>
      </div>

    </form>
  );
}