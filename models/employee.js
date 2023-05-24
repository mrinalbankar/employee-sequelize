const { Sequelize } = require("sequelize");

module.exports = (sequelize) => {
  const Employee = sequelize.define("employee", {
    fullname: {
      type: Sequelize.STRING
    },
    jobtitle: {
      type: Sequelize.STRING
    },
    phonenumber: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    address: {
      type: Sequelize.STRING
    },
    city: {
      type: Sequelize.STRING
    },
    state: {
      type: Sequelize.STRING
    }
  });
  return Employee;
};