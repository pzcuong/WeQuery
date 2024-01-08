const { validationResult } = require("express-validator");
const ApiResponse = require("./api.response");

class Validation {
  static handleValidation(validations) {
    return async (req, res, next) => {
      await Promise.all(validations.map((validation) => validation.run(req)));

      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.send(ApiResponse.badRequest(errors.array()[0].msg));

      next();
    };
  }
}

module.exports = Validation;
