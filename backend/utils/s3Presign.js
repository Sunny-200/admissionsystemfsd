const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3 = require("../lib/s3");

const normalizeS3Key = (value) => {
  if (!value) return null;

  const raw = String(value).trim();
  if (!raw) return null;

  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    try {
      const parsed = new URL(raw);
      return decodeURIComponent(parsed.pathname.replace(/^\//, '')) || null;
    } catch {
      return raw;
    }
  }

  if (raw.includes('%')) {
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }

  return raw;
};

// Generates a short-lived signed URL for private S3 objects
const getSignedDocumentUrl = async (keyOrUrl, expiresInSeconds = 300) => {
  const key = normalizeS3Key(keyOrUrl);
  if (!key) return null;

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
};

module.exports = { getSignedDocumentUrl };
