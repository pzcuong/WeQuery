const { check } = require("express-validator");

const getQuestionValidations = [check("MaCH").exists().isString().notEmpty()];
module.exports = getQuestionValidations;
