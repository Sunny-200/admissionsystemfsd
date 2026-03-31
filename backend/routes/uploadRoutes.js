const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { verifyToken } = require('../middleware/authMiddleware');

/**
 * POST /api/upload/document
 * Uploads a file to S3 bucket
 * Requires: authentication, file
 */
router.post('/document', verifyToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      fileUrl: req.file.location,
      fileName: req.file.key,
      originalName: req.file.originalname
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message
    });
  }
});

/**
 * POST /api/upload/multiple
 * Uploads multiple files to S3 bucket
 * Requires: authentication, files
 */
router.post('/multiple', verifyToken, upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = req.files.map(file => ({
      fileUrl: file.location,
      fileName: file.key,
      originalName: file.originalname,
      size: file.size
    }));

    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully',
      count: uploadedFiles.length,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Multiple file upload failed',
      error: error.message
    });
  }
});

module.exports = router;
