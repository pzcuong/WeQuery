const { body } = require("express-validator");
const Validation = require("../../common/validation.middwares");

const registerValidations = [
  body("username").exists().withMessage("Username is required"),
  body("password").exists().withMessage("Password is required"),
  body("email")
    .exists()
    .isEmail()
    .withMessage("Email is required and must be a valid email address"),
  body("phoneNumber").exists().withMessage("Phone number is required"),
  body("fullname").exists().withMessage("Full name is required"),
];

module.exports = Validation.handleValidation(registerValidations);
