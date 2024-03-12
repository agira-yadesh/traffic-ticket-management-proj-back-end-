const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const { sequelize } = require("./util/database");
const User = require("./models/users");
const Ticket = require("./models/tickets");

const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


User.hasMany(Ticket, { as: "Tickets", foreignKey: "userId" });

app.use(authRoutes);


sequelize.sync()
.then(()=>{
    app.listen(3000, '0.0.0.0');
}).catch(err=>{
    console.log(err);
})

