import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  basicInfoSchema,
  academicInfoSchema,
} from "../validations/student-registration";

export default function Register() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [basicInfo, setBasicInfo] = useState(null);
  const [alert, setAlert] = useState("");

  // 🔐 redirect if not logged in
  if (!user) {
    navigate("/login");
    return null;
  }

  // Step 1
  const basicForm = useForm({
    resolver: zodResolver(basicInfoSchema),
  });

  // Step 2
  const academicForm = useForm({
    resolver: zodResolver(academicInfoSchema),
  });

  const handleBasic = (data) => {
    setBasicInfo(data);
    setStep(2);
  };

  const handleAcademic = () => {
    setStep(3);
  };

  const handleSubmit = async (documentUrls) => {
    try {
      const academicData = academicForm.getValues();

      const payload = {
        ...basicInfo,
        ...academicData,
        documentUrls,
      };

      // 🔥 API call
      const res = await API.post("/student/application", payload);

      setAlert("Application submitted successfully");

      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setAlert(err.response?.data?.message || "Submission failed");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <h1>Student Registration</h1>
      <p>Step {step} of 3</p>

      {alert && <p>{alert}</p>}

      {/* Step 1 */}
      {step === 1 && (
        <form onSubmit={basicForm.handleSubmit(handleBasic)}>
          <input {...basicForm.register("name")} placeholder="Name" />
          <button type="submit">Next</button>
        </form>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <form onSubmit={academicForm.handleSubmit(handleAcademic)}>
          <input {...academicForm.register("aadharNumber")} placeholder="Aadhar" />
          <button type="button" onClick={() => setStep(1)}>Back</button>
          <button type="submit">Next</button>
        </form>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div>
          {/* You plug your DocumentUploadForm here */}
          <button onClick={() => handleSubmit({ AADHAR_CARD: "file-url" })}>
            Submit Application
          </button>
        </div>
      )}
    </div>
  );
}