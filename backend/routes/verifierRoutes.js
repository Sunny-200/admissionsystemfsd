const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/verifierController');
const { verifyToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

router.use(verifyToken, checkRole('VERIFIER'));

router.get('/assignments', ctrl.getAssignments);
router.get('/applications/:id', ctrl.getApplication);

router.get('/applications/:id/remarks', ctrl.getRemarks);
router.post('/applications/:id/remarks', ctrl.addRemark);

router.patch('/applications/:id/status', ctrl.updateStatus);

module.exports = router;