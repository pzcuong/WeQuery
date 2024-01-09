const { body } = require("express-validator");
const Validation = require("../../common/validation.middwares");

const createExerciseValidations = [
  body("TieuDe")
    .exists()
    .isString()
    .notEmpty()
    .withMessage("TieuDe is required"),
  body("MaNhom")
    .exists()
    .isString()
    .notEmpty()
    .withMessage("MaNhom is required"),
  body("TgianBD").exists().notEmpty().withMessage("TgianBD is required"),
  body("TgianKT")
    .exists()
    .notEmpty()
    .withMessage("TgianKT is required")
    .custom((value, { req }) => {
      if (value <= req.body.TgianBD) {
        throw new Error("TgianKT must be greater than TgianBD");
      }
      return true;
    }),
  body("TrangThai")
    .exists()
    .isBoolean()
    .notEmpty()
    .withMessage("TrangThai is required"),
];

module.exports = Validation.handleValidation(createExerciseValidations);
