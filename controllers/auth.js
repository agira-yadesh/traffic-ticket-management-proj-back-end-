const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");

const User = require("../models/users");
const Ticket = require("../models/tickets");

// const users = [];

const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "moviesreviewhub00@gmail.com",
    pass: "negv pcxq bmcs xret",
  },
});

exports.postSignup = async (req, res, next) => {
  const fullName = req.body.fullname;
  const email = req.body.email;
  const mobile = req.body.mobile;

  try {
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email: email }, { mobile: mobile }],
      },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "E-mail or mobile already exists" });
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

  

    const otpExpiration = new Date().getTime() + 5 * 60 * 1000;

    const newUser = await User.create({
      fullname: fullName,
      email,
      mobile,
      otp,
      otpExpiration: otpExpiration,
      verified: false,
    });

    // const newUser = { fullName, email, phone, otp, verified: false };
    // users.push(newUser);
    // console.log(newUser);

    return res
      .status(200)
      .json({ message: "Verify OTP & Set Password TO Activate Your Account.", user: newUser });
  } catch (error) {
    console.error(error);
    
    res.status(500).json({ error: "internal server error " });
  }
};


exports.setPassword = async (req, res, next) => {
  const email = req.body.email;
  const otp = req.body.otp;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  try {

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Password and Confirm Password do not match" });
    }
    // console.log(`email${email}hi`)


    const user = await User.findOne({
      where: {
        email: email,
        verified: false,
        // otpExpiration: {
        //   [Op.gte]: new Date(), // Check if otpExpiration is greater than or equal to current time
        // },
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ error: "Invalid email address" });
    }

    if (otp !== user.otp) {
      return res.status(400).json({ error: "Invalid Otp" });
    }


    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.verified = true;

    await user.save();

    setTimeout(async () => {
      user.otp = null;
      await user.save();
      console.log("OTP cleared after 5 minutes.");
    }, 5 * 60 * 1000);

    res.status(200).json({ message: "password set successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.loginPost = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({
    where: { email },
    include: [{ model: Ticket, as: "Tickets" }],
  })
    .then((user) => {
      if (!user) {
        return res
          .status(401)
          .json({ error: "Invalid credentials" });
      }
      bcrypt.compare(password, user.password, (err, match) => {
        if (err) {
          return res.status(500).json({ error: "internal server error" });
        }
        if (match) {
          const secretKey = "say_my_name_y_a_d_e_s_h";
          const token = jwt.sign(
            { id: user.id, email: user.email },
            secretKey,
            { expiresIn: "1h" }
          );
          res.status(200).json({ token, user,  message: 'LoggedIn' });
          // console.log('logged')
        } else {
          res.status(401).json({ error: "invalid credentials." });
        }
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Internal server error" });
    });
};

exports.forgetPasswordPost = async (req, res, next) => {
  const email = req.body.email;

  try {
    const existingUser = await User.findOne({
      where: {
        email: email,
      },
    });

    if (!existingUser) {
      return res.status(400).json({ error: "Not a registered user!" });
    }

    const otp = speakeasy.totp({
      secret: speakeasy.generateSecret().base32,
      encoding: "base32",
    });

    const mailOptions = {
      from: "moviesreviewhub00@gmail.com",
      to: email,
      subject: "Forgot passord",
      text: `Hi! Your OTP to reset your password is: ${otp}`,
    };

    emailTransporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res
          .status(500)
          .json({ error: "Failed to send OTP. Please try again." });
      }
    });

    const otpExpiration = new Date().getTime() + 5 * 60 * 1000;
    const secretKey = "say_my_name_y_a_d_e_s_h";
    const token = jwt.sign(
      { email: email }, 
      secretKey,       
      { expiresIn: '1h' } 
    );
    await User.update(
      {
        otp: otp,
        otpExpiration: otpExpiration,
      },
      { where: { email } }
    );

    res.status(200).json({ message: "Otp sent", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "internal server error " });
  }
};

exports.verifyOTP = async (req, res, next) => {
  const otp = req.body.otp;
  // const email = req.user.email;
  try {
    const user = await User.findOne({
      where: {
        otp: otp,
        verified: true,
        
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Not a registered user!" });
    }

    if (otp === user.otp) {
      res
        .status(200)
        .json({
          message: "OTP verified successfully. Redirect to set new password.",
        });
    } else {
      return res.status(400).json({ error: 'Invalid OTP or expired. Please try again.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.resetPassword = async(req,res,next)=>{
  const email = req.user.email;
  const password = req.body.password;


  try{
    const user = await User.findOne({
      where:{
        email: email,
        verified:true
      },
    });
    
    if(!user){
      return res.status(400).json({error: "Invalid email address"});
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.otp = null;
    console.log(user.password)

    await user.save();

    setTimeout(async () => {
      user.otp = null;
      await user.save();
      console.log("OTP cleared after 5 minutes.");
    }, 5 * 60 * 1000);

    res.status(200).json({ message: "password set successfully." });


  } catch (error){

    console.error(error);
    res.status(500).json({ error: "Internal server error" });

  }
}

// && user.password === password && user.verified
