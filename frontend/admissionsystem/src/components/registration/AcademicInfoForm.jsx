export function AcademicInfoForm({ form, onSubmit, onBack }) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-sm font-semibold text-blue-900 uppercase tracking-wide border-b border-gray-200 pb-2">
        Academic Information
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Aadhar Number</label>
          <input
            placeholder="Aadhar Number"
            {...form.register("aadharNumber")}
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">Religion</label>
          <input
            placeholder="Religion"
            {...form.register("religion")}
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">Caste Category</label>
          <select {...form.register("casteCategory")} className="form-input">
            <option value="GENERAL">General</option>
            <option value="GENERAL_EWS">General (EWS)</option>
            <option value="OBC_NCL">OBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
          </select>
        </div>

        <div>
          <label className="form-label">Branch Allotted</label>
          <select {...form.register("branchAllotted")} className="form-input">
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="DSAI">DSAI</option>
          </select>
        </div>

        <div>
          <label className="form-label">Seat Allotment Source</label>
          <select {...form.register("seatAllotmentSource")} className="form-input">
            <option value="JOSSA">JOSSA</option>
            <option value="CSAB">CSAB</option>
          </select>
        </div>

        <div>
          <label className="form-label">Blood Group</label>
          <input
            placeholder="Blood Group"
            {...form.register("bloodGroup")}
            className="form-input"
          />
        </div>

        <div className="md:col-span-2">
          <label className="form-label">Address</label>
          <textarea
            placeholder="Address"
            {...form.register("permanentAddress")}
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">State</label>
          <input
            placeholder="State"
            {...form.register("state")}
            className="form-input"
          />
        </div>

        <div className="md:col-span-2">
          <label className="form-label">Remarks</label>
          <textarea
            placeholder="Remarks"
            {...form.register("remarksFromStudent")}
            className="form-input"
          />
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button type="button" onClick={onBack} className="btn-danger">
          Back
        </button>
        <button type="submit" className="btn-success">
          Next
        </button>
      </div>
    </form>
  );
}