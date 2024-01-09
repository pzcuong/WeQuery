const ExerciseController = require("./exercise/exercise.controller");
const QuestionController = require("./question/question.controller");
const UserController = require("./user/user.controller");
const UserGroupController = require("./userGroup/userGroup.controller");

class AdminController {
  constructor() {
    this.exerciseController = new ExerciseController();
    this.questionController = new QuestionController();
    this.userController = new UserController();
    this.userGroupController = new UserGroupController();
  }
}

module.exports = AdminController;
