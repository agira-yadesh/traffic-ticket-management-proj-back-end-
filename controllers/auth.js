const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {Op} = require("sequelize");

const User = require("../models/users");
const Ticket = require("../models/tickets");

const users = [];

const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "moviesreviewhub00@gmail.com",
    pass: "negv pcxq bmcs xret",
  },
});

exports.postSignup = async (req, res, next) => {
  const fullName = req.body.fullName;
  const email = req.body.email;
  const mobile = req.body.mobile;

  try {
    const existingUser = await User.findOne({
      where: {
        [Op.or]:[{ email: email},{ mobile: mobile}],
      },

    });

  if (existingUser) {
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

  const otpExpiration = new Date().getTime()+ 5 * 60 * 1000

  const newUser = await User.create({
    fullname:fullName,
    email,
    mobile,
    otp,
    otpExpiration: otpExpiration,
    verified:false
    
  });

  // const newUser = { fullName, email, phone, otp, verified: false };
  // users.push(newUser);
  // console.log(newUser);

  res.status(201).json({ message: "User created successfully", user: newUser });
} catch(error){
  console.error(error);
  res.status(500).json({ error: "internal server error "});

}
};

exports.verifyOtp = async (req, res, next) => {
  const email = req.body.email;
  const otp = req.body.otp;
  const password = req.body.password;

  try{
    const user = await User.findOne({
      where: {
        email: email,
        verified: false,
        otpExpiration: {
          [Op.gte]: new Date(), // Check if otpExpiration is greater than or equal to current time
        },
      },
    });

    if (!user){
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

  const hashedPassword = await bcrypt.hash(password, 12);
  user.password = hashedPassword;
  user.verified = true;

  await user.save();

  setTimeout(async () => {
    user.otp = null;
    await user.save();
    console.log('OTP cleared after 5 minutes.');
  }, 5 * 60 * 1000);


  res.status(200).json({ message: "password set successfully." });
} catch(error){
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
}

};

exports.loginPost = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({
    where: { email },
    include: [{ model: Ticket, as: 'Tickets' }] // Assuming you've set the alias 'Tickets' in the association
  })
  .then(user =>{

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
      const secretKey = "say_my_name_y_a_d_e_s_h"
      const token = jwt.sign({ id: user.id, email: user.email }, secretKey, { expiresIn: "1h" });
        res.status(200).json({ token,user, tickets: user.Tickets});

    } else {
        res.status(401).json({error: "invalid credentials."});
    }
});
})
.catch(err=>{
  console.log(err);
  res.status(500).json({ error: 'Internal server error' });
  
});
};


// && user.password === password && user.verified