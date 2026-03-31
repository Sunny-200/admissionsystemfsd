export function BasicInfoForm({ form, onSubmit }) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

      <h2 className="text-lg font-semibold">Personal Details</h2>

      <input
        placeholder="Full Name"
        {...form.register("name")}
        className="w-full border p-2 rounded"
      />

      <input
        type="date"
        {...form.register("dateOfBirth")}
        className="w-full border p-2 rounded"
      />

      <input
        placeholder="Contact Number"
        {...form.register("contactNumber")}
        className="w-full border p-2 rounded"
      />

      <input
        placeholder="Guardian Name"
        {...form.register("guardianName")}
        className="w-full border p-2 rounded"
      />

      <input
        placeholder="Guardian Number"
        {...form.register("guardianNumber")}
        className="w-full border p-2 rounded"
      />

      <input
        type="email"
        placeholder="Guardian Email"
        {...form.register("guardianEmail")}
        className="w-full border p-2 rounded"
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Next
      </button>

    </form>
  );
}