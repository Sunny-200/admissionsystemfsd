import { Input } from "../ui/input";

export function BasicInfoForm({ form, onSubmit }) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>

      <h2>PERSONAL DETAILS</h2>

      <input placeholder="Full Name" {...form.register("name")} />

      <input type="date" {...form.register("dateOfBirth")} />

      <input placeholder="Contact Number" {...form.register("contactNumber")} />

      <input placeholder="Guardian Name" {...form.register("guardianName")} />

      <input placeholder="Guardian Number" {...form.register("guardianNumber")} />

      <input type="email" placeholder="Guardian Email" {...form.register("guardianEmail")} />

      <button type="submit">Next</button>

    </form>
  );
}