const express = require('express');
const router = express.Router();

const {
	getProfile,
	getRemarks,
	submitApplicationController,
	getApplication,
	getDocuments,
} = require('../controllers/studentController');
const { verifyToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// Student routes (protected)
router.get('/profile', verifyToken, checkRole('STUDENT'), getProfile);
router.get('/remarks', verifyToken, checkRole('STUDENT'), getRemarks);

router.get('/application', verifyToken, checkRole('STUDENT'), getApplication);
router.post('/application', verifyToken, checkRole('STUDENT'), submitApplicationController);

router.get('/documents', verifyToken, checkRole('STUDENT'), getDocuments);
module.exports = router;