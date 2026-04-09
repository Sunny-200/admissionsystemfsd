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

// Returns available batches for admin filters
const getBatches = async (req, res) => {
  try {
    const data = await adminService.getBatches();
    res.json({
      success: true,
      data: { batches: data },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Returns branch-wise stats for admin dashboards
const getBranchStats = async (req, res) => {
  try {
    const data = await adminService.getBranchStats(req.query.batch);
    res.json({
      success: true,
      data: { stats: data },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Returns branch-wise gender stats for admin dashboards
const getGenderStats = async (req, res) => {
  try {
    const data = await adminService.getGenderStats(req.query.batch);
    res.json({
      success: true,
      data: { stats: data },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Returns PWD vs non-PWD stats for admin dashboards
const getPwdStats = async (req, res) => {
  try {
    const data = await adminService.getPwdStats(req.query.batch);
    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Returns state-wise stats for admin dashboards
const getStateStats = async (req, res) => {
  try {
    const data = await adminService.getStateStats(req.query.batch);
    res.json({
      success: true,
      data: { stats: data },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Returns category-wise stats for admin dashboards
const getCategoryStats = async (req, res) => {
  try {
    const data = await adminService.getCategoryStats(req.query.batch);
    res.json({
      success: true,
      data: { stats: data },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Returns opening vs closing rank range by branch and category
const getRankRangeStats = async (req, res) => {
  try {
    const data = await adminService.getRankRangeStats(req.query.batch);
    res.json({
      success: true,
      data: { stats: data },
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
  getBatches,
  getVerifiers,
  getBranchStats,
  getGenderStats,
  getPwdStats,
  getStateStats,
  getCategoryStats,
  getRankRangeStats,
};