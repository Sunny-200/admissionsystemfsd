const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/verifierController');
const { verifyToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

router.use(verifyToken, checkRole('VERIFIER'));

// Assignment endpoints
router.get('/assignments', ctrl.getAssignments);
router.get('/assigned', ctrl.getAssignments);
router.get('/applications/:id', ctrl.getApplication);

router.get('/applications/:id/remarks', ctrl.getRemarks);
router.post('/applications/:id/remarks', ctrl.addRemark);

router.patch('/applications/:id/status', ctrl.updateStatus);

// Review endpoint (status + optional remarks)
router.post('/review', ctrl.reviewApplication);
router.post('/applications/:id/verify', (req, res, next) => {
	req.body.applicationId = req.params.id;
	return ctrl.reviewApplication(req, res, next);
});

module.exports = router;