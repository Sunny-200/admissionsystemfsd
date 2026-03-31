import { useState } from "react";

export function DocumentUploadForm({ onBack, onSubmit }) {

  const [files, setFiles] = useState({});
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (type, file) => {
    setFiles(prev => ({ ...prev, [type]: file }));
  };

  // 🔥 S3 UPLOAD
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:5000/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    return data.fileUrl; // FULL S3 URL
  };

  const handleSubmit = async () => {
    setUploading(true);

    const uploadedUrls = {};

    try {
      for (const key of Object.keys(files)) {
        const url = await uploadFile(files[key]);
        uploadedUrls[key] = url;
      }

      onSubmit(uploadedUrls);

    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }

    setUploading(false);
  };

  return (
    <div>

      <h2>DOCUMENTS</h2>

      <input type="file" onChange={(e) => handleFileChange("AADHAR", e.target.files[0])} />
      <input type="file" onChange={(e) => handleFileChange("MARKSHEET", e.target.files[0])} />

      <button onClick={onBack}>Back</button>

      <button onClick={handleSubmit} disabled={uploading}>
        {uploading ? "Uploading..." : "Submit"}
      </button>

    </div>
  );
}