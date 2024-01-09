const QuestionController = require("../users/question/question.controller");
const UserController = require("../users/user/user.controller");

class UsersController {
  constructor() {
    this.questionController = new QuestionController();
    this.userController = new UserController();
  }
}

module.exports = UsersController;
