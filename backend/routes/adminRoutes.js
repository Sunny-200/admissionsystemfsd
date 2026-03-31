const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// protect all admin routes
router.use(verifyToken, checkRole('ADMIN'));

router.get('/applications', adminController.getApplications);
router.get('/applications/with-assignments', adminController.getApplicationsWithAssignments);
router.get('/applications/:id', adminController.getApplication);

router.post('/assignments/bulk', adminController.bulkAssign);

router.get('/verifiers', adminController.getVerifiers);

module.exports = router;