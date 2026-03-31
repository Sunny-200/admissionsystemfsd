import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import API from "../api/axios";
import { BasicInfoForm } from "../components/registration/BasicInfoForm";
import { AcademicInfoForm } from "../components/registration/AcademicInfoForm";
import { DocumentUploadForm } from "../components/registration/DocumentUploadForm";

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
    <div className="min-h-screen bg-app-background">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-app-primary">
          Student Registration
        </h1>
        <p className="text-sm text-app-muted mt-1 mb-6">Step {step} of 3</p>

        {alert && <p className="text-green-600 text-sm mb-4">{alert}</p>}

        <div className="bg-app-card border border-app-border rounded-xl shadow-sm p-6">
          <div className="bg-gray-50 px-6 py-3 border-b border-app-border -mx-6 -mt-6 mb-4">
            <p className="text-sm font-semibold text-app-primary uppercase tracking-wide">
              Registration Form
            </p>
          </div>

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
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}