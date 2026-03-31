import { useState } from "react";
import API from "../../api/axios";

export function DocumentUploadForm({ onBack, onSubmit }) {

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
  ];

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
      if (Object.keys(files).length === 0) {
        throw new Error("Please select at least one document to upload");
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
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Documents</h2>
        <p className="text-sm text-gray-600">
          Upload the required documents to complete your application.
        </p>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="space-y-3">
        {documentFields.map((doc) => (
          <div key={doc.key} className="space-y-1">
            <label className="text-sm font-medium">{doc.label}</label>
            <input
              type="file"
              onChange={(e) => handleFileChange(doc.key, e.target.files[0])}
              className="w-full border p-2 rounded"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="border px-4 py-2 rounded"
        >
          Back
        </button>

        <button
          onClick={handleSubmit}
          disabled={uploading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
        >
          {uploading ? "Uploading..." : "Submit"}
        </button>
      </div>
    </div>
  );
}