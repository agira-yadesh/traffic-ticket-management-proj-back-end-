const Sequelize = require("sequelize");

const { sequelize } = require("../util/database");

const Users = sequelize.define("user", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  fullname: {
    type: Sequelize.STRING,
    required: true,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    required: true,
    allowNull: false,
    unique: true,
  },
  mobile: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  phone: {
    type: Sequelize.STRING,
    allowNull: true,
    unique: true,
  },
  contactFax: {
    type: Sequelize.STRING,
    allowNull: true,
    unique: true,
  },
  DOB: {
    type: Sequelize.STRING,
    allowNull: true,
    
  },
  drivingLicense:{
    type: Sequelize.STRING,
    allowNull: true,
    unique: true,

  },
  company:{
    type: Sequelize.STRING,
    allowNull: true,
    
  },
  otp:{
    type: Sequelize.STRING,
    allowNull: true, 


  },
  otpExpiration: {
    type: Sequelize.DATE,
    allowNull: true, // Allow null as OTP expiration might not be set yet
  },
  verified: {
    type: Sequelize.BOOLEAN,
    defaultValue: false, // Default value is false
  },
  password:{
    type:Sequelize.STRING,
    allowNull: true

},


});

module.exports = Users;
