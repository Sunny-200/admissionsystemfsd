const service = require('../services/verifierService');
const { getSignedDocumentUrl } = require('../utils/s3Presign');

// Returns verifier assignments
const getAssignments = async (req, res) => {
  try {
    const data = await service.getAssignments(req.user.id);
    res.json({
      success: true,
      data: { applications: data },
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};

// Returns full application for an assigned verifier
const getApplication = async (req, res) => {
  try {
    const data = await service.getApplicationById(
      req.params.id,
      req.user.id
    );
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
  } catch (e) {
    if (e.message === 'NOT_ASSIGNED') {
      return res.status(403).json({
        success: false,
        message: 'Not assigned',
      });
    }
    if (e.message === 'NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'Not found',
      });
    }
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};

// Returns remarks for the assigned application
const getRemarks = async (req, res) => {
  try {
    const data = await service.getRemarks(req.params.id, req.user.id);
    res.json({
      success: true,
      data: { remarks: data },
    });
  } catch (e) {
    if (e.message === 'NOT_ASSIGNED') {
      return res.status(403).json({
        success: false,
        message: 'Not assigned',
      });
    }
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};

// Adds a remark to an assigned application
const addRemark = async (req, res) => {
  try {
    const data = await service.addRemark(
      req.params.id,
      req.user.id,
      req.body.text
    );

    res.json({
      success: true,
      data: { remark: data },
    });
  } catch (e) {
    if (e.message === 'EMPTY_TEXT') {
      return res.status(400).json({
        success: false,
        message: 'Text required',
      });
    }
    if (e.message === 'TEXT_TOO_LONG') {
      return res.status(400).json({
        success: false,
        message: 'Too long',
      });
    }
    if (e.message === 'NOT_ASSIGNED') {
      return res.status(403).json({
        success: false,
        message: 'Not assigned',
      });
    }
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};

// Updates application status for an assigned application
const updateStatus = async (req, res) => {
  try {
    const data = await service.updateStatus(
      req.params.id,
      req.user.id,
      req.body.status
    );

    res.json({
      success: true,
      data: { application: data },
    });
  } catch (e) {
    if (e.message === 'INVALID_STATUS') {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }
    if (e.message === 'FINAL_STATUS') {
      return res.status(400).json({
        success: false,
        message: 'Final already',
      });
    }
    if (e.message === 'NOT_ASSIGNED') {
      return res.status(403).json({
        success: false,
        message: 'Not assigned',
      });
    }
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};

// Updates status and optional remarks in a single request
const reviewApplication = async (req, res) => {
  try {
    const { applicationId, status, comments } = req.body;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: 'applicationId is required',
      });
    }

    const application = await service.updateStatus(
      applicationId,
      req.user.id,
      status
    );

    let remark = null;

    if (comments && comments.trim().length > 0) {
      remark = await service.addRemark(
        applicationId,
        req.user.id,
        comments
      );
    }

    return res.json({
      success: true,
      data: { application, remark },
    });
  } catch (e) {
    if (e.message === 'INVALID_STATUS') {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }
    if (e.message === 'FINAL_STATUS') {
      return res.status(400).json({
        success: false,
        message: 'Final already',
      });
    }
    if (e.message === 'NOT_ASSIGNED') {
      return res.status(403).json({
        success: false,
        message: 'Not assigned',
      });
    }
    if (e.message === 'EMPTY_TEXT') {
      return res.status(400).json({
        success: false,
        message: 'Text required',
      });
    }
    if (e.message === 'TEXT_TOO_LONG') {
      return res.status(400).json({
        success: false,
        message: 'Too long',
      });
    }
    return res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};

module.exports = {
  getAssignments,
  getApplication,
  getRemarks,
  addRemark,
  updateStatus,
  reviewApplication,
};