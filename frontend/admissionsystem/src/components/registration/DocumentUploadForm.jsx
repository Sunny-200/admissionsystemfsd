import { useState } from "react";
import API from "../../api/axios";

export function DocumentUploadForm({
  onBack,
  onSubmit,
  isPwd,
  casteCategory,
  existingDocuments = [],
}) {

  const [files, setFiles] = useState({});
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (type, file) => {
    setFiles(prev => ({ ...prev, [type]: file }));
  };

  const documentFields = [
    { key: "PASSPORT_PHOTO", label: "Passport Photo" },
    { key: "PROVISIONAL_LETTER", label: "Provisional Letter" },
    { key: "CLASS_10_MARKSHEET", label: "Class 10 Marksheet" },
    { key: "CLASS_12_MARKSHEET", label: "Class 12 Marksheet" },
    { key: "JEE_RANK_CARD", label: "JEE Rank Card" },
    { key: "CASTE_CERTIFICATE", label: "Caste Certificate" },
    { key: "MEDICAL_CERTIFICATE", label: "Medical Certificate" },
    { key: "INSTITUTE_FEE_RECEIPT", label: "Institute Fee Receipt" },
    { key: "HOSTEL_FEE_RECEIPT", label: "Hostel Fee Receipt" },
    { key: "UNDERTAKING", label: "Undertaking" },
    { key: "CLASS_12_PERFORMANCE", label: "Class 12 Performance" },
    { key: "AADHAR_CARD", label: "Aadhar Card" },
    ...(isPwd ? [{ key: "PWD_CERTIFICATE", label: "PWD Certificate" }] : []),
  ];

  const requiredDocumentKeys = [
    "PASSPORT_PHOTO",
    "PROVISIONAL_LETTER",
    "CLASS_10_MARKSHEET",
    "CLASS_12_MARKSHEET",
    "JEE_RANK_CARD",
    "AADHAR_CARD",
    ...(casteCategory && casteCategory !== "GENERAL" ? ["CASTE_CERTIFICATE"] : []),
    ...(isPwd ? ["PWD_CERTIFICATE"] : []),
  ];

  const documentLabelMap = documentFields.reduce((acc, doc) => {
    acc[doc.key] = doc.label;
    return acc;
  }, {});

  // 🔥 S3 UPLOAD
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await API.post("/upload/document", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data.data.fileUrl; // FULL S3 URL
    } catch (err) {
      const message = err.response?.data?.message || "Upload failed";
      throw new Error(message);
    }
  };

  const handleSubmit = async () => {
    setUploading(true);
    setError("");

    const uploadedUrls = {};

    try {
      const existingDocumentKeys = new Set(
        (existingDocuments || []).map((doc) => doc.documentType)
      );

      const missingDocs = requiredDocumentKeys.filter(
        (docKey) => !files[docKey] && !existingDocumentKeys.has(docKey)
      );

      if (missingDocs.length > 0) {
        const missingLabels = missingDocs.map((docKey) => documentLabelMap[docKey] || docKey);
        throw new Error(
          `Please upload all required documents before submitting. Missing: ${missingLabels.join(", ")}`
        );
      }

      for (const key of Object.keys(files)) {
        const url = await uploadFile(files[key]);
        uploadedUrls[key] = url;
      }

      onSubmit(uploadedUrls);

    } catch (err) {
      console.error(err);
      setError(err.message || "Upload failed");
    }

    setUploading(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-sm font-semibold text-blue-900 uppercase tracking-wide border-b border-gray-200 pb-2">
        Document Uploads
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documentFields.map((doc) => {
          const selectedFile = files[doc.key];

          return (
            <label
              key={doc.key}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition cursor-pointer ${
                selectedFile
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 hover:border-blue-400"
              }`}
            >
              <input
                type="file"
                onChange={(e) => handleFileChange(doc.key, e.target.files[0])}
                className="hidden"
              />
              <p className="text-sm font-medium text-blue-900">{doc.label}</p>
              {selectedFile ? (
                <p className="text-xs text-green-700 mt-1">
                  Uploaded: {selectedFile.name}
                </p>
              ) : (
                <p className="text-xs text-gray-600 mt-1">Click to upload</p>
              )}
            </label>
          );
        })}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="btn-danger"
        >
          Back
        </button>

        <button
          onClick={handleSubmit}
          disabled={uploading}
          className="bg-blue-900 text-white hover:bg-blue-800 px-5 py-2 rounded-md font-medium transition disabled:opacity-60"
        >
          {uploading ? "Uploading..." : "Submit"}
        </button>
      </div>
    </div>
  );
}