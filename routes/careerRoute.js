const express = require('express');
const router = express.Router();
const { generateCareerPlan,saveCareerPlan, getCareerPlan } = require('../controllers/careerController');
const { isAuthenticatedUser } = require('../middlewares/auth');

router.post('/getCareerPlan', generateCareerPlan);
router.post('/saveCareerPlan', isAuthenticatedUser, saveCareerPlan);
router.get('/getCareerPlan', isAuthenticatedUser, getCareerPlan);

module.exports = router;