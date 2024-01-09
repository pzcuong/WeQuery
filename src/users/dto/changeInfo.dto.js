const { body } = require("express-validator");
const Validation = require("../../common/validation.middwares");

const changeInfoValidations = [
  body("email")
    .exists()
    .isEmail()
    .notEmpty()
    .withMessage("Email is required and must be a valid email address"),
  body("phoneNumber")
    .exists()
    .notEmpty()
    .withMessage("Phone number is required"),
  body("fullname").exists().notEmpty().withMessage("Full name is required"),
  body("SinhNhat")
    .exists()
    .isDate()
    .notEmpty()
    .withMessage("Birthday is required"),
  body("isChangePassword").exists().isBoolean(),
  body("password")
    .if(body("isChangePassword").equals(true))
    .exists()
    .isString()
    .notEmpty(),
  body("newPassword")
    .if(body("isChangePassword").equals(true))
    .exists()
    .isString()
    .notEmpty(),
  body("confirmPassword")
    .if(body("isChangePassword").equals(true))
    .exists()
    .isString()
    .notEmpty()
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Confirm password does not match");
      }
      return true;
    }),
];

module.exports = Validation.handleValidation(changeInfoValidations);
