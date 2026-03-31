const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("../lib/s3");

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    // Bucket owner enforced: ACLs are disabled, so omit ACL settings
    key: function (req, file, cb) {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    },
  }),
});

module.exports = upload;