const express = require('express');
const router = express.Router();
const { login, signup, verifyOTP, logout, deleteUsersWithExpiredOTP } = require('../controllers/userController');

router.post('/login', login);
router.post('/signup', signup);
router.post('/verifyOTP', verifyOTP);
router.get('/logout', logout);
setInterval(deleteUsersWithExpiredOTP, 3 * 60 * 1000);

module.exports = router;