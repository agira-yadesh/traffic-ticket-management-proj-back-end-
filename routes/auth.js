const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const authController = require("../controllers/auth");
const userController = require("../controllers/user");
const User = require("../models/users");
const jwt = require("jsonwebtoken");

router.post("/signup", authController.postSignup);
router.post("/setPassword", authController.setPassword);
router.post("/login", authController.loginPost);
router.post("/forgetPassword", authController.forgetPasswordPost);
router.put("/verifyOTP", authMiddleware, authController.verifyOTP);

router.get("/profile", authMiddleware, userController.getUserProfile);
router.put("/editProfile", authMiddleware, userController.editUserProfile);
router.post("/createTicket", authMiddleware, userController.createTicket);
router.put("/editTicket/:ticketId", authMiddleware, userController.editTicket);
router.put("/resetPassword", authMiddleware, authController.resetPassword);
router.put("/changePassword", authMiddleware, userController.changePassword);
router.get("/ticketHistory", authMiddleware, userController.ticketHistory);
router.get(
  "/ticketHistory/:ticketId",
  authMiddleware,
  userController.ticketDetails
);
router.get('/homePage', authMiddleware,userController.homePage);



// to maintain the state in flutter (after login)

router.post("/tokenIsValid", async (req, res) => {
  try {
    const token = req.header("x-auth-token");

    if (!token) return res.json(false);

    const secretKey = "say_my_name_y_a_d_e_s_h";
    const verified = jwt.verify(token, secretKey);
    if (!verified) return res.json(false);

    const user = await User.findByPk(verified.id);
    if (!user) return res.json(false);

    res.json(true);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  const user = await User.findByPk(req.user.id);
  res.json({ user, token: req.token });
});

module.exports = router;
