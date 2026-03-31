export function AcademicInfoForm({ form, onSubmit, onBack }) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>

      <h2>ACADEMIC DETAILS</h2>

      <input placeholder="Aadhar Number" {...form.register("aadharNumber")} />

      <input placeholder="Religion" {...form.register("religion")} />

      <select {...form.register("casteCategory")}>
        <option value="GENERAL">General</option>
        <option value="OBC_NCL">OBC</option>
        <option value="SC">SC</option>
        <option value="ST">ST</option>
      </select>

      <select {...form.register("branchAllotted")}>
        <option value="CSE">CSE</option>
        <option value="ECE">ECE</option>
        <option value="DSAI">DSAI</option>
      </select>

      <select {...form.register("seatAllotmentSource")}>
        <option value="JOSSA">JOSSA</option>
        <option value="CSAB">CSAB</option>
      </select>

      <input placeholder="Blood Group" {...form.register("bloodGroup")} />

      <textarea placeholder="Address" {...form.register("permanentAddress")} />

      <input placeholder="State" {...form.register("state")} />

      <textarea placeholder="Remarks" {...form.register("remarksFromStudent")} />

      <button type="button" onClick={onBack}>Back</button>
      <button type="submit">Next</button>

    </form>
  );
}