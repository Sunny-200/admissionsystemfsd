const express = require('express');
const router = express.Router();

const { getProfile,getRemarks,submitApplicationController } = require('../controllers/studentController');
const { verifyToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

router.get('/profile',verifyToken,checkRole('STUDENT'),getProfile);
router.get('/remarks',verifyToken,checkRole('STUDENT'),getRemarks);
router.get('/application',verifyToken,checkRole('STUDENT'),submitApplicationController);
module.exports = router;