const adminService = require('../services/adminService');
const { getSignedDocumentUrl } = require('../utils/s3Presign');

// Returns all applications for admin
const getApplications = async (req, res) => {
  try {
    const data = await adminService.getAllApplications();
    res.json({
      success: true,
      data: { applications: data },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Returns one application by id
const getApplication = async (req, res) => {
  try {
    const data = await adminService.getApplicationById(req.params.id);
    const documents = await Promise.all(
      (data.documents || []).map(async (doc) => ({
        ...doc,
        viewUrl: await getSignedDocumentUrl(doc.fileName || doc.fileUrl),
      }))
    );
    res.json({
      success: true,
      data: { application: { ...data, documents } },
    });
  } catch (err) {
    if (err.message === 'Application Not Found') {
      return res.status(404).json({
        success: false,
        message: err.message,
      });
    }
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Returns applications with assignment info
const getApplicationsWithAssignments = async (req, res) => {
  try {
    const data = await adminService.getApplicationsWithAssignments();
    res.json({
      success: true,
      data: { applications: data },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Assigns one or more applications to a verifier
const bulkAssign = async (req, res) => {
  try {
    const { applicationIds, verifierId } = req.body;

    const result = await adminService.bulkAssign(
      applicationIds,
      verifierId,
      req.user.id
    );

    res.json({
      success: true,
      data: {
        ...result,
        message: 'Assigned successfully',
      },
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Returns all verifiers for admin assignment
const getVerifiers = async (req, res) => {
  try {
    const data = await adminService.getVerifiers();
    res.json({
      success: true,
      data: { verifiers: data },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  getApplications,
  getApplication,
  getApplicationsWithAssignments,
  bulkAssign,
  getVerifiers,
};