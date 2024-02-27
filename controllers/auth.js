const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const users = [];

const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "moviesreviewhub00@gmail.com",
    pass: "negv pcxq bmcs xret",
  },
});

exports.postSignup = (req, res, next) => {
  const fullName = req.body.fullName;
  const email = req.body.email;
  const phone = req.body.phone;

  if (!fullName || !email || !phone) {
    return res.status(400).json({ error: "Please provide username, email" });
  }

  if (users.some((user) => user.email === email || user.phone === phone)) {
    return res.status(400).json({ error: "Username or email already exists" });
  }


  const otp = speakeasy.totp({
    secret: speakeasy.generateSecret().base32,
    encoding: "base32",
  });

  const mailOptions = {
    from: "moviesreviewhub00@gmail.com",
    to: email,
    subject: "Email Verification OTP",
    text: `Hi ${fullName}! Your OTP for email verification is ${otp}`,
  };

  emailTransporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res
        .status(500)
        .json({ error: "Failed to send OTP. Please try again." });
    }
  });

  const newUser = { fullName, email, phone, otp, verified: false };
  users.push(newUser);
  console.log(newUser);

  res.status(201).json({ message: "User created successfully", user: newUser });
};

exports.verifyOtp = (req, res, next) => {
  const email = req.body.email;
  const otp = req.body.otp;
  const password = req.body.password;

  const user = users.find(
    (user) => user.email === email && user.verified === false
  );

  if (!user) {
    return res
      .status(400)
      .json({ error: "Invalid email address or alreay verified" });
  }

  if(otp !== user.otp){
    return res.status(400).json({ error: "Invalid Otp" });


  }

  // console.log("Received OTP:", otp);
  // console.log("User OTP Secret:", user.otpSecret.base32);

  // const isOTPValid = speakeasy.totp.verify({
  //   secret: user.otpSecret.base32,
  //   encoding: "base32",
  //   token: otp,
  //   window: 3,
  // });

  // console.log("Is OTP Valid:", isOTPValid);

  bcrypt.hash(password, 12).then((hashedPassword) => {
    user.password = hashedPassword;
    user.verified = true;
  });

  res.status(200).json({ message: "password set successfully." });
};
exports.loginPost = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = users.find(
    (user) =>
      user.email === email 
  );

  if (!user) {
    return res
      .status(401)
      .json({ error: "Invalid credentials or email not verified." });
  }
  bcrypt.compare(password,user.password,(err,match)=>{
    if(err){
        return res.status(500).json({error: "internal server error"});
    }
    if(match){
        const token = jwt.sign({ email }, "your-secret-key", { expiresIn: "1h" });
        res.status(200).json({ token });

    } else {
        res.status(401).json({error: "invalid credentials."});
    }
});
};


// && user.password === password && user.verified