const { body } = require("express-validator");
const Validation = require("../../common/validation.middwares");

const loginValidations = [
  body("username")
    .exists()
    .isString()
    .notEmpty()
    .withMessage("Username is required"),
  body("password")
    .exists()
    .isString()
    .notEmpty()
    .withMessage(
      "Password must be at least 8 characters, including uppercase letters, lowercase letters and numbers."
    ),
];

module.exports = Validation.handleValidation(loginValidations);
