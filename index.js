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


//registered routes
//create employee with contacts array
app.post('/create', async (req, res) => {
  await Employee.create({
    fullname: req.body.fullname,
    jobtitle: req.body.jobtitle,
    phonenumber: req.body.phonenumber,
    email: req.body.email,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state
  })
    .then((data) => {
      // console.log(data.id)
      let allContacts = []
      for (let i = 0; i < req.body.contacts.length; i++) {
        var getContact = {
          emergencyContact: req.body.contacts[i].emergencyContact,
          number: req.body.contacts[i].number,
          relationship: req.body.contacts[i].relationship,
          employeeId: data.id
        }
        allContacts.push(getContact)
        console.log(allContacts)
      }
      Contact.bulkCreate(allContacts, { returning: true })
        .then((contacts) =>
          res.status(200).send({ data, contacts })
        )
        .catch((error) => {
          console.log(error)
          res.status(400).send(error)
        })
    })
    .catch((error) => res.status(400).send(error))
})

//create only contact (one at a time)
app.post('/contact', async (req, res) => {
  await Contact.create({
    emergencyContact: req.body.emergencyContact,
    number: req.body.number,
    relationship: req.body.relationship,
    employeeId: req.body.employeeId
  })
    .then((data) => res.status(200).json(data))
    .catch((error) => res.status(400).send(error))
})

//find employee by id with its contacts
app.get('/employee/:id', async (req, res) => {
  const id = req.params.id
  await Employee.findByPk(id, { include: Contact })
    .then((data) => res.status(200).json(data))
    .catch((error) => res.status(400).send(error))
})

//find all employees with their contacts
app.get('/employees', async (req, res) => {
  let limit = parseInt(req.query.limit)
  let offset = parseInt(req.query.offset)
  // await Employee.findAll({ limit: 2, offset: 0, include: Contact })
  await Employee.findAll({
    subQuery: false,
    include: [{ model: Contact, as: 'contacts', separate: true }],
    limit: limit || 0,
    offset: offset || 0
  })
    .then((data) => res.status(200).json(data))
    .catch((error) => res.status(400).send(error))
})

//update employee
app.put('/update/:id', async (req, res) => {
  const id = req.params.id
  await Employee.update({
    fullname: req.body.fullname,
    jobtitle: req.body.jobtitle,
    phonenumber: req.body.phonenumber,
    email: req.body.email,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state
  },
    { where: { id: id } })
    .then((data) => res.status(200).json(data))
    .catch((error) => res.status(400).send(error))
})

//delete employee
app.delete('/delete/:id', async (req, res) => {
  const id = req.params.id
  await Employee.destroy({ where: { id: id } })
    .then((data) => res.status(200).send("employee deleted"))
    .catch((error) => res.status(400).send(error))
})

const PORT = process.env.PORT || 5050

app.listen(
  PORT,
  console.log(`Server running on port ${PORT}`)
)