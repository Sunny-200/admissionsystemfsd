import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import API from "../api/axios";
import { BasicInfoForm } from "../components/registration/BasicInfoForm";
import { AcademicInfoForm } from "../components/registration/AcademicInfoForm";
import { DocumentUploadForm } from "../components/registration/DocumentUploadForm";
import { ProgressIndicator } from "../components/registration/ProgressIndicator";

import { useForm, useWatch } from "react-hook-form";
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
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Step 1
  const basicForm = useForm({
    resolver: zodResolver(basicInfoSchema),
  });

  // Step 2
  const academicForm = useForm({
    resolver: zodResolver(academicInfoSchema),
  });
  const isPwd = useWatch({ control: academicForm.control, name: "isPwd" });

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
      await API.post("/student/application", payload);

      setAlert("Application submitted successfully");

      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setAlert(err.response?.data?.message || "Submission failed");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6 md:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-blue-900">
            Student Registration
          </h1>
          <p className="text-gray-600 text-sm mt-1">Complete your admission form</p>
        </div>

        <ProgressIndicator currentStep={step} />

        {alert && <p className="text-green-600 text-sm">{alert}</p>}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8">

          {/* Step 1 */}
          {step === 1 && (
            <BasicInfoForm form={basicForm} onSubmit={handleBasic} />
          )}

          {/* Step 2 */}
          {step === 2 && (
            <AcademicInfoForm
              form={academicForm}
              onSubmit={handleAcademic}
              onBack={() => setStep(1)}
            />
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="mt-4">
              <DocumentUploadForm
                onBack={() => setStep(2)}
                onSubmit={handleSubmit}
                isPwd={isPwd === "true" || isPwd === true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}