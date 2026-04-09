const getDocumentSortValue = (document) => {
  const uploadedAt = document?.uploadedAt ? new Date(document.uploadedAt).getTime() : 0;
  const version = Number.isInteger(document?.version) ? document.version : 0;
  return [uploadedAt, version];
};

const compareDocumentsDesc = (left, right) => {
  const [leftUploadedAt, leftVersion] = getDocumentSortValue(left);
  const [rightUploadedAt, rightVersion] = getDocumentSortValue(right);

  if (leftUploadedAt !== rightUploadedAt) {
    return rightUploadedAt - leftUploadedAt;
  }

  if (leftVersion !== rightVersion) {
    return rightVersion - leftVersion;
  }

  return 0;
};

const getLatestDocumentsByType = (documents = []) => {
  const sorted = [...documents].sort(compareDocumentsDesc);
  const seen = new Set();

  return sorted.filter((document) => {
    const key = document?.documentType;
    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

module.exports = {
  getLatestDocumentsByType,
};
