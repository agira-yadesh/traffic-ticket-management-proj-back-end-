const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const authController = require('../controllers/auth')
const userController = require('../controllers/user')

router.post('/signup', authController.postSignup);
router.post('/verify', authController.verifyOtp );
router.post('/login',authController.loginPost);
router.get('/profile',authMiddleware,userController.getUserProfile);
router.put('/editProfile',authMiddleware,userController.editUserProfile);
router.post('/createTicket',authMiddleware,userController.createTicket);
router.put('/editTicket/:ticketId',authMiddleware,userController.editTicket);




module.exports = router;