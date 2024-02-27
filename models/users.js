const Sequelize = require('sequelize');

const {Sequelize} = require('../util/database');

const Users = sequelize.define('User',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    fullname:{
        type: Sequelize.STRING,
        required: true,
        allowNull: false
    },
    email:{
        type: Sequelize.STRING,
        required: true,
        allowNull: false,
        unique: true

    },
    mobile:{
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,

    },
    phone:{
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,

    },
    contactFax:{
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
        
    },
    DOB:{
        
    }


})