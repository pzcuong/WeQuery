const { body } = require("express-validator");
const Validation = require("../../common/validation.middwares");

const loginValidations = [
  body("username").exists().withMessage("Username is required"),
  body("password").exists().withMessage("Password is required"),
];

module.exports = Validation.handleValidation(loginValidations);
