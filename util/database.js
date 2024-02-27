const Sequelize = require('sequelize');

const sequelize = new Sequelize('ticketManagement', 'root', 'password',{
    dialect: 'mysql',
    host: 'localhost',
    
})


module.exports.sequelize = sequelize;