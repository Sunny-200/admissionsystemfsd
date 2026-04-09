const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// Protect all admin routes
router.use(verifyToken, checkRole('ADMIN'));

router.get('/stats/branch', adminController.getBranchStats);
router.get('/stats/gender', adminController.getGenderStats);

router.get('/applications', adminController.getApplications);
router.get('/applications/with-assignments', adminController.getApplicationsWithAssignments);
router.get('/applications/:id', adminController.getApplication);

// Assignment endpoints
router.get('/assignments', adminController.getApplicationsWithAssignments);
router.post('/assignments/bulk', adminController.bulkAssign);
router.post('/assign-verifier', adminController.bulkAssign);

router.get('/verifiers', adminController.getVerifiers);

module.exports = router;