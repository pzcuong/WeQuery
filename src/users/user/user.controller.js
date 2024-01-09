const NodeCache = require("node-cache");
const UserInfo = require("../../users/user/user.models");
const ApiResponse = require("../../common/api.response");

class UserController {
  constructor(SALT_ROUNDS = 10) {
    this.usersModel = new UserInfo();
    this.bcrypt = require("bcryptjs");
    this.SALT_ROUNDS = SALT_ROUNDS;
    this.myCache = new NodeCache({ stdTTL: 100, checkperiod: 60 });
  }

  DoiThongTin = async (req, res) => {
    try {
      const username = req.user.username;
      const user = await this.usersModel.getUser(username);

      await this.usersModel.changeInfoUser(username, req.body);

      if (req.body.isChangePassword) {
        const password = req.body.password;
        const newPassword = req.body.newPassword;

        const isValid = this.bcrypt.compareSync(password, user.password);

        if (!isValid)
          return res.send(ApiResponse.badRequest("Mật khẩu cũ không đúng"));

        const hashPassword = this.bcrypt.hashSync(newPassword, 10);
        await this.usersModel.updatePassword(username, hashPassword, password);
      }

      return res.send(ApiResponse.success("Đổi thông tin thành công"));
    } catch (error) {
      return res.send(ApiResponse.badRequest(error.message));
    }
  };
}

module.exports = UserController;
