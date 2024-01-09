const { body } = require("express-validator");
const Validation = require("../../common/validation.middwares");

const TaoQuanHeValidations = [
  body("SQLSchema")
    .exists()
    .isString()
    .notEmpty()
    .withMessage("SQLSchema is required"),
];

const TaoCauHoiValidations = [
  body("TieuDe")
    .exists()
    .isString()
    .notEmpty()
    .withMessage("TieuDe is required"),
  body("NoiDung")
    .exists()
    .isString()
    .notEmpty()
    .withMessage("NoiDung is required"),
  body("SQLQuery")
    .exists()
    .isString()
    .notEmpty()
    .withMessage("SQLQuery is required"),
];

const KiemThuTestCaseValidations = [
  body("SQLQuery")
    .exists()
    .isString()
    .notEmpty()
    .withMessage("SQLQuery is required"),
];

const getValidations = (type) => {
  switch (type) {
    case "TaoQuanHe":
      return TaoQuanHeValidations;
    case "TaoCauHoi":
      return TaoCauHoiValidations;
    case "KiemThuTestCase":
      return KiemThuTestCaseValidations;
    default:
      return [];
  }
};

module.exports = (req, res, next) => {
  const validations = getValidations(req.body.type);
  return Validation.handleValidation(validations)(req, res, next);
};
