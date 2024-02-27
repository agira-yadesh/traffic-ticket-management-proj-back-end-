const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth')

router.post('/signup', authController.postSignup);
router.post('/verify', authController.verifyOtp );
router.post('/login',authController.loginPost);




module.exports = router;