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

const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const mapApplicationToFormValues = (application) => {
  const profile = application?.studentProfile || {};
  const data = { ...profile, ...application };

  return {
    name: data.name || "",
    dateOfBirth: toDateInputValue(data.dateOfBirth),
    contactNumber: data.contactNumber || "",
    guardianName: data.guardianName || "",
    guardianNumber: data.guardianNumber || "",
    guardianEmail: data.guardianEmail || "",

    aadharNumber: data.aadharNumber || "",
    religion: data.religion || "",
    casteCategory: data.casteCategory || "GENERAL",
    branchAllotted: data.branch?.code || data.branchAllotted || "",
    seatAllotmentSource: data.seatAllotmentSource || "",
    gender: data.gender || "",
    isPwd:
      data.isPwd === true
        ? "true"
        : data.isPwd === false
        ? "false"
        : undefined,
    pwdDisabilityType: data.pwdDisabilityType || "",
    jeeMainRank:
      data.jeeMainRank === null || data.jeeMainRank === undefined
        ? ""
        : String(data.jeeMainRank),
    jeeMainCategoryRank:
      data.jeeMainCategoryRank === null || data.jeeMainCategoryRank === undefined
        ? ""
        : String(data.jeeMainCategoryRank),
    jeeAdvancedRank:
      data.jeeAdvancedRank === null || data.jeeAdvancedRank === undefined
        ? ""
        : String(data.jeeAdvancedRank),
    jeeAdvancedCategoryRank:
      data.jeeAdvancedCategoryRank === null || data.jeeAdvancedCategoryRank === undefined
        ? ""
        : String(data.jeeAdvancedCategoryRank),
    bloodGroup: data.bloodGroup || "",
    permanentAddress: data.permanentAddress || "",
    state: data.state || "",
    remarksFromStudent: data.remarksFromStudent || "",
  };
};

export default function Register() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [basicInfo, setBasicInfo] = useState(null);
  const [existingData, setExistingData] = useState(null);
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
  const casteCategory = useWatch({ control: academicForm.control, name: "casteCategory" });

  useEffect(() => {
    if (!user) return;

    const loadExistingApplication = async () => {
      try {
        const res = await API.get("/student/application");
        const application = res?.data?.data?.application;
        if (!application) return;

        setExistingData(application);

        const mappedValues = mapApplicationToFormValues(application);

        basicForm.reset({
          name: mappedValues.name,
          dateOfBirth: mappedValues.dateOfBirth,
          contactNumber: mappedValues.contactNumber,
          guardianName: mappedValues.guardianName,
          guardianNumber: mappedValues.guardianNumber,
          guardianEmail: mappedValues.guardianEmail,
        });

        academicForm.reset({
          aadharNumber: mappedValues.aadharNumber,
          religion: mappedValues.religion,
          casteCategory: mappedValues.casteCategory,
          branchAllotted: mappedValues.branchAllotted,
          seatAllotmentSource: mappedValues.seatAllotmentSource,
          gender: mappedValues.gender,
          isPwd: mappedValues.isPwd,
          pwdDisabilityType: mappedValues.pwdDisabilityType,
          jeeMainRank: mappedValues.jeeMainRank,
          jeeMainCategoryRank: mappedValues.jeeMainCategoryRank,
          jeeAdvancedRank: mappedValues.jeeAdvancedRank,
          jeeAdvancedCategoryRank: mappedValues.jeeAdvancedCategoryRank,
          bloodGroup: mappedValues.bloodGroup,
          permanentAddress: mappedValues.permanentAddress,
          state: mappedValues.state,
          remarksFromStudent: mappedValues.remarksFromStudent,
        });

        setBasicInfo({
          name: mappedValues.name,
          dateOfBirth: mappedValues.dateOfBirth,
          contactNumber: mappedValues.contactNumber,
          guardianName: mappedValues.guardianName,
          guardianNumber: mappedValues.guardianNumber,
          guardianEmail: mappedValues.guardianEmail,
        });
      } catch (err) {
        if (err.response?.status !== 404) {
          setAlert(err.response?.data?.message || "Failed to load existing application");
        }
      }
    };

    loadExistingApplication();
  }, [user, basicForm, academicForm]);

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
      const finalBasicInfo = basicInfo || {
        name: basicForm.getValues("name"),
        dateOfBirth: basicForm.getValues("dateOfBirth"),
        contactNumber: basicForm.getValues("contactNumber"),
        guardianName: basicForm.getValues("guardianName"),
        guardianNumber: basicForm.getValues("guardianNumber"),
        guardianEmail: basicForm.getValues("guardianEmail"),
      };

      const payload = {
        ...finalBasicInfo,
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

        {existingData?.applicationStatus === "REJECTED" && (
          <p className="text-red-600 text-sm">
            Your application was rejected. Please update the required fields and resubmit.
          </p>
        )}

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
              {!!existingData?.documents?.length && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700">Already uploaded documents</p>
                  <div className="mt-2 space-y-1">
                    {existingData.documents.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.viewUrl || doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-sm text-blue-700 hover:underline"
                      >
                        {doc.documentType}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <DocumentUploadForm
                onBack={() => setStep(2)}
                onSubmit={handleSubmit}
                isPwd={isPwd === "true" || isPwd === true}
                casteCategory={casteCategory}
                existingDocuments={existingData?.documents || []}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}