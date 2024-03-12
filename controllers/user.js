const User = require("../models/users");
const Ticket = require("../models/tickets");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");

exports.getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(userId);

    const userProfile = await User.findByPk(userId, {
      attributes: {
        exclude: [
          "id",
          "password",
          "otp",
          "verified",
          "otpExpiration",
          "createdAt",
          "updatedAt",
        ],
      },
    });

    if (!userProfile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    res.status(200).json({ userProfile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.editUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    user.DOB = req.body.dateOfBirth || user.DOB;
    user.drivingLicense = req.body.drivingLicense || user.drivingLicense;
    user.company = req.body.company || user.company;
    user.phone = req.body.phone || user.phone;
    user.contactFax = req.body.fax || user.contactFax;

    await user.save();
    return res
      .status(200)
      .json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.createTicket = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(userId);
    const ticketType = req.body.ticketType;
    const subject = req.body.subject;
    const priority = req.body.priority;
    const country = req.body.country;
    const policeOfficerName = req.body.policeOfficerName;
    const VIN = req.body.VIN;
    const date = req.body.date;
    const imageUrl = req.body.imageUrl;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newTicket = await Ticket.create({
      ticketType,
      subject,
      priority,
      country,
      policeOfficerName,
      VIN,
      date,
      imageUrl,
      userId,
    });
    res
      .status(201)
      .json({ message: "Ticket created successfully", ticket: newTicket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.editTicket = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const ticketId = req.params.ticketId;

    const ticket = await Ticket.findOne({
      where: {
        ticketId: ticketId,
        userId: userId,
      },
    });

    if (!ticket) {
      return res
        .status(404)
        .json({ error: "Ticket not found or unauthorized" });
    }

    ticket.ticketType = req.body.ticketType || ticket.ticketType;
    ticket.subject = req.body.subject || ticket.subject;
    ticket.priority = req.body.priority || ticket.priority;
    ticket.country = req.body.country || ticket.country;
    ticket.policeOfficerName =
      req.body.policeOfficerName || ticket.policeOfficerName;
    ticket.VIN = req.body.VIN || ticket.VIN;
    ticket.date = req.body.date || ticket.date;
    ticket.imageUrl = req.body.imageUrl || ticket.imageUrl;

    await ticket.save();

    return res
      .status(200)
      .json({ message: "Ticket updated successfully", ticket });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.changePassword = async (req, res, next) => {
  email = req.user.email;
  oldPassword = req.body.oldPassword;
  newPassword = req.body.newPassword;

  try {
    const user = await User.findOne({
      where: {
        email: email,
        verified: true,
      },
    });

    bcrypt.compare(oldPassword, user.password, async (err, match) => {
      if (err) {
        return res.send(500).json({ error: "Old password is not correct" });
      }
      if (match) {
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedPassword;
        await user.save();
      }
    });

    res.status(200).json({ message: "password changed successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.ticketHistory = async (req, res, next) => {
  const userId = req.user.id;

  const ticket = await Ticket.findAll({
    where: {
      userId: userId,
    },
    attributes: ["ticketId", "ticketType", "ticketStatus", "date"],
  });

  if (!ticket) {
    return res.status(404).json({ error: "Ticket not found" });
  }

  res.status(200).json({ ticket });
};

exports.ticketDetails = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const ticketId = req.params.ticketId;
    const ticket = await Ticket.findOne({
      where: {
        userId: userId,
        ticketId: ticketId,
      },
    });

    if (!ticket) {
      return res.status(400).json({ error: "Ticket not found" });
    }

    res.status(200).json({ ticket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.homePage = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const tickets = await Ticket.findAll({
      where: {
        userId:userId,
        submittedDate: {
          [Op.gte]: sevenDaysAgo,
          [Op.lte]: new Date(),
        },
      },
    });

    res.status(200).json({ recentTickets: tickets });
  } catch (error) {}
};
