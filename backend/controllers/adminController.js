const adminService = require('../services/adminService');

// GET all
const getApplications = async (req, res) => {
  try {
    const data = await adminService.getAllApplications();
    res.json({ applications: data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET one
const getApplication = async (req, res) => {
  try {
    const data = await adminService.getApplicationById(req.params.id);
    res.json({ application: data });
  } catch (err) {
    if (err.message === 'Application Not Found') {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

// GET with assignments
const getApplicationsWithAssignments = async (req, res) => {
  try {
    const data = await adminService.getApplicationsWithAssignments();
    res.json({ applications: data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST bulk assign
const bulkAssign = async (req, res) => {
  try {
    const { applicationIds, verifierId } = req.body;

    const result = await adminService.bulkAssign(
      applicationIds,
      verifierId,
      req.user.id
    );

    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET verifiers
const getVerifiers = async (req, res) => {
  try {
    const data = await adminService.getVerifiers();
    res.json({ verifiers: data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getApplications,
  getApplication,
  getApplicationsWithAssignments,
  bulkAssign,
  getVerifiers,
};