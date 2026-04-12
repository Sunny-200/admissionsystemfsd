export function AcademicInfoForm({ form, onSubmit, onBack }) {
  const religionOptions = [
    "Hindu",
    "Muslim",
    "Christian",
    "Sikh",
    "Buddhist",
    "Jain",
    "Parsi",
    "Other",
  ];

  const stateOptions = [
    "Andaman and Nicobar Islands",
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chandigarh",
    "Chhattisgarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jammu and Kashmir",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Ladakh",
    "Lakshadweep",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Puducherry",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];

  const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const isPwd = form.watch("isPwd");
  const casteCategory = form.watch("casteCategory");

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
          <select {...form.register("religion")} className="form-input">
            <option value="">Select Religion</option>
            {religionOptions.map((religion) => (
              <option key={religion} value={religion}>
                {religion}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">Caste Category</label>
          <select {...form.register("casteCategory")} className="form-input">
            <option value="GENERAL">General</option>
            <option value="GENERAL_EWS">General (EWS)</option>
            <option value="OBC_NCL">OBC-NCL</option>
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
            <option value="">Select Source</option>
            <option value="JOSSA">JOSAA</option>
            <option value="CSAB">CSAB</option>
          </select>
        </div>

        <div>
          <label className="form-label">Gender</label>
          <select {...form.register("gender")} className="form-input">
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="form-label">Person with Disability (PWD)</label>
          <div className="flex gap-6 pt-2">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                value="false"
                {...form.register("isPwd")}
                className="h-4 w-4"
              />
              No
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                value="true"
                {...form.register("isPwd")}
                className="h-4 w-4"
              />
              Yes
            </label>
          </div>
        </div>

        {isPwd === "true" && (
          <div>
            <label className="form-label">PWD Disability Type</label>
            <input
              placeholder="Disability Type"
              {...form.register("pwdDisabilityType")}
              className="form-input"
            />
          </div>
        )}

        <div>
          <label className="form-label">JEE Main Rank</label>
          <input
            type="number"
            min="0"
            placeholder="JEE Main Rank"
            {...form.register("jeeMainRank")}
            className="form-input"
          />
        </div>

        {(isPwd === "true" || casteCategory !== "GENERAL") && (
          <>
            <div>
              <label className="form-label">JEE Main Category Rank</label>
              <input
                type="number"
                min="0"
                placeholder="JEE Main Category Rank"
                {...form.register("jeeMainCategoryRank")}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">JEE Advanced Category Rank (optional)</label>
              <input
                type="number"
                min="0"
                placeholder="JEE Advanced Category Rank"
                {...form.register("jeeAdvancedCategoryRank")}
                className="form-input"
              />
            </div>
          </>
        )}

        <div>
          <label className="form-label">JEE Advanced Rank (optional)</label>
          <input
            type="number"
            min="0"
            placeholder="JEE Advanced Rank"
            {...form.register("jeeAdvancedRank")}
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">Blood Group</label>
          <select {...form.register("bloodGroup")} className="form-input">
            <option value="">Select Blood Group</option>
            {bloodGroupOptions.map((bloodGroup) => (
              <option key={bloodGroup} value={bloodGroup}>
                {bloodGroup}
              </option>
            ))}
          </select>
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
          <select {...form.register("state")} className="form-input">
            <option value="">Select State / Union Territory</option>
            {stateOptions.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
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