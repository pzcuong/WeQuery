const getUserValidations = [
  body("username").exists().isString().notEmpty(),
  body("email").exists().isEmail(),
  body("password").exists().isString().notEmpty(),
];
