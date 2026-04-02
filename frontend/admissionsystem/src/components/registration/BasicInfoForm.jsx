export function BasicInfoForm({ form, onSubmit }) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-sm font-semibold text-blue-900 uppercase tracking-wide border-b border-gray-200 pb-2">
        Basic Information
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="form-label">Full Name</label>
          <input
            placeholder="Full Name"
            {...form.register("name")}
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">Date of Birth</label>
          <input
            type="date"
            {...form.register("dateOfBirth")}
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">Contact Number</label>
          <input
            placeholder="Contact Number"
            {...form.register("contactNumber")}
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">Guardian Name</label>
          <input
            placeholder="Guardian Name"
            {...form.register("guardianName")}
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">Guardian Number</label>
          <input
            placeholder="Guardian Number"
            {...form.register("guardianNumber")}
            className="form-input"
          />
        </div>

        <div className="md:col-span-2">
          <label className="form-label">Guardian Email</label>
          <input
            type="email"
            placeholder="Guardian Email"
            {...form.register("guardianEmail")}
            className="form-input"
          />
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button type="submit" className="btn-success">
          Next
        </button>
      </div>
    </form>
  );
}