const {
  getStudentProfile,
  getStudentRemarks,
  submitApplication,
} = require('../services/studentService');
const { getSignedDocumentUrl } = require('../utils/s3Presign');

// Returns the authenticated student's profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT

    const profile = await getStudentProfile(userId);

    return res.status(200).json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);

    if (error.message === 'No application found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
    });
  }
};

// Returns verifier remarks for the authenticated student
const getRemarks = async (req, res) => {
  try {
    const userId = req.user.id;

    const remarks = await getStudentRemarks(userId);

    return res.status(200).json({
      success: true,
      data: { remarks },
    });
  } catch (error) {
    console.error('Error fetching student remarks:', error);

    if (error.message === 'Student profile not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch remarks',
    });
  }
};

// Submits a new application for the authenticated student
const submitApplicationController = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = req.body;

    const result = await submitApplication(userId, data);

    return res.status(201).json({
      success: true,
      data: {
        profileId: result.id,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (
      error.message === 'Missing required fields' ||
      error.message === 'Application already submitted'
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to submit application',
    });
  }
};

// Returns application details for the authenticated student
const getApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await getStudentProfile(userId);
    const documents = await Promise.all(
      (profile.documents || []).map(async (doc) => ({
        ...doc,
        viewUrl: await getSignedDocumentUrl(doc.fileName || doc.fileUrl),
      }))
    );

    return res.status(200).json({
      success: true,
      data: { application: { ...profile, documents } },
    });
  } catch (error) {
    console.error('Application fetch error:', error);

    if (error.message === 'No application found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch application',
    });
  }
};

// Returns only the documents for the authenticated student
const getDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await getStudentProfile(userId);
    const documents = await Promise.all(
      (profile.documents || []).map(async (doc) => ({
        ...doc,
        viewUrl: await getSignedDocumentUrl(doc.fileName || doc.fileUrl),
      }))
    );

    return res.status(200).json({
      success: true,
      data: { documents },
    });
  } catch (error) {
    console.error('Documents fetch error:', error);

    if (error.message === 'No application found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
    });
  }
};

module.exports = {
  getProfile,
  getRemarks,
  submitApplicationController,
  getApplication,
  getDocuments,
};