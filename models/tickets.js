const Sequelize = require("sequelize");

const { sequelize } = require("../util/database");

const Ticket = sequelize.define('ticket',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        alowNull: false,
        primaryKey: true
    },
    ticketType:{
        type: Sequelize.STRING,
        alowNull: false,


    },
    subject:{
        type:Sequelize.STRING,
        alowNull:false
    },
    priority:{
        type: Sequelize.STRING,
        alowNull: false,
    },
    country:{
        type:Sequelize.STRING,
        alowNull:false

    },
    policeOfficerName:{
        type: Sequelize.STRING,
        alowNull: false,

    },
    VIN:{
        type:Sequelize.STRING,
        alowNull:false

    },
    date:{
        type:Sequelize.STRING,
        alowNull:false
    },
    imageUrl: {
        type:Sequelize.STRING,
        alowNull:false

    },
    ticketStatus:{
        type:Sequelize.STRING,
        defaultValue: 'In Progress',

    },
    ticketId:{
        type:Sequelize.INTEGER(7),
        alowNull: false,
        unique: true
    }

},{
    hooks: {
      beforeCreate: async (ticket) => {
        const generatedTicketNumber = await generateUniqueTicketNumber();
        ticket.ticketId = generatedTicketNumber;
      }
    }

});

async function generateUniqueTicketNumber() {
    // Generate a random 7-digit number
    const randomTicketNumber = Math.floor(1000000 + Math.random() * 9000000);
  

    const isUnique = await isTicketNumberUnique(randomTicketNumber);
  

    if (!isUnique) {
      return generateUniqueTicketNumber();
    }
  
    return randomTicketNumber;
  }
  
  async function isTicketNumberUnique(ticketNumber) {

    const existingTicket = await Ticket.findOne({
      where: {
        ticketId: ticketNumber
      }
    });
  

    return !existingTicket;
  }


module.exports = Ticket;
