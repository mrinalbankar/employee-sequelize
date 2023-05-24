const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
const Sequelize = require("sequelize");

app.use(
  cors(),
  express.urlencoded({ extended: true }),
  express.json()
)

dotenv.config({ path: __dirname + '/config/.env' });

const sequelize = new Sequelize(
  process.env.DB,
  process.env.USER,
  process.env.PASSWORD,
  {
    host: process.env.HOST,
    dialect: 'mysql'
  }
);

const Employee = require(`${__dirname}/models/employee`)(sequelize)
const Contact = require(`${__dirname}/models/contact`)(sequelize)

Employee.hasMany(Contact, {
  foreignKey: 'employeeId',
  targetKey: 'id'
});
Contact.belongsTo(Employee);

sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.');
}).catch((error) => {
  console.error('Unable to connect to the database: ', error);
});

sequelize.sync()
  .then(() => {
    console.log("Tables created successfully")
  })
  .catch((error) => {
    console.log('Unable to create table : ', error);
  })

//routes
app.post('/create', async (req, res) => {
  await Employee.create(req.body)
    .then((data) => res.json(data))
    .catch((error) => res.status(400).send(error))
})

app.post('/contact', async (req, res) => {
  await Contact.create({
    emergencyContact: req.body.emergencyContact,
    number: req.body.number,
    relationship: req.body.relationship,
    employeeId: req.body.employeeId
  })
    .then((data) => res.json(data))
    .catch((error) => res.status(400).send(error))
})

const PORT = process.env.PORT || 5050

app.listen(
  PORT,
  console.log(`Server running on port ${PORT}`)
)