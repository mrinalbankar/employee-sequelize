const { Sequelize } = require("sequelize");

module.exports = (sequelize) => {
  const Contact = sequelize.define("contact", {
    emergencyContact: {
      type: Sequelize.STRING
    },
    number: {
      type: Sequelize.STRING
    },
    relationship: {
      type: Sequelize.STRING
    }
  });
  return Contact;
};