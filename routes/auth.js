const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const authController = require('../controllers/auth')
const userController = require('../controllers/user')

router.post('/signup', authController.postSignup);
router.post('/setPassword', authController.setPassword );
router.post('/login',authController.loginPost);
router.get('/profile',authMiddleware,userController.getUserProfile);
router.put('/editProfile',authMiddleware,userController.editUserProfile);
router.post('/createTicket',authMiddleware,userController.createTicket);
router.put('/editTicket/:ticketId',authMiddleware,userController.editTicket);
router.post('/forgetPassword',authController.forgetPasswordPost);
router.put('/verifyOTP',authMiddleware,authController.verifyOTP);
router.put('/resetPassword',authMiddleware,authController.resetPassword);
router.put('/changePassword',authMiddleware,userController.changePassword);




module.exports = router;