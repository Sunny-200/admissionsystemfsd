const service = require('../services/verifierService');

// GET assignments
const getAssignments = async (req, res) => {
  try {
    const data = await service.getAssignments(req.user.id);
    res.json({ applications: data });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET application
const getApplication = async (req, res) => {
  try {
    const data = await service.getApplicationById(
      req.params.id,
      req.user.id
    );
    res.json({ application: data });
  } catch (e) {
    if (e.message === 'NOT_ASSIGNED') return res.status(403).json({ message: 'Not assigned' });
    if (e.message === 'NOT_FOUND') return res.status(404).json({ message: 'Not found' });
    res.status(500).json({ message: e.message });
  }
};

// GET remarks
const getRemarks = async (req, res) => {
  try {
    const data = await service.getRemarks(req.params.id, req.user.id);
    res.json({ remarks: data });
  } catch (e) {
    if (e.message === 'NOT_ASSIGNED') return res.status(403).json({ message: 'Not assigned' });
    res.status(500).json({ message: e.message });
  }
};

// POST remark
const addRemark = async (req, res) => {
  try {
    const data = await service.addRemark(
      req.params.id,
      req.user.id,
      req.body.text
    );

    res.json({ message: 'Remark added', remark: data });
  } catch (e) {
    if (e.message === 'EMPTY_TEXT') return res.status(400).json({ message: 'Text required' });
    if (e.message === 'TEXT_TOO_LONG') return res.status(400).json({ message: 'Too long' });
    if (e.message === 'NOT_ASSIGNED') return res.status(403).json({ message: 'Not assigned' });
    res.status(500).json({ message: e.message });
  }
};

// PATCH status
const updateStatus = async (req, res) => {
  try {
    const data = await service.updateStatus(
      req.params.id,
      req.user.id,
      req.body.status
    );

    res.json({
      message: `Application marked as ${data.applicationStatus}`,
      application: data,
    });
  } catch (e) {
    if (e.message === 'INVALID_STATUS') return res.status(400).json({ message: 'Invalid status' });
    if (e.message === 'FINAL_STATUS') return res.status(400).json({ message: 'Final already' });
    if (e.message === 'NOT_ASSIGNED') return res.status(403).json({ message: 'Not assigned' });
    res.status(500).json({ message: e.message });
  }
};

module.exports = {
  getAssignments,
  getApplication,
  getRemarks,
  addRemark,
  updateStatus,
};