require("dotenv").config();
const UserInfo = require("../users/user/user.models");
const QueryService = require("../query/query.service");
const ApiResponse = require("../common/api.response");
const AuthModels = require("./auth.models");

class AuthController {
  constructor(SALT_ROUNDS = 10) {
    this.userModel = new UserInfo();
    this.queryService = new QueryService();
    this.authModels = new AuthModels();
    this.authMethod = require("../auth/auth.methods");
    this.randToken = require("rand-token");
    this.bcrypt = require("bcryptjs");
    this.SALT_ROUNDS = SALT_ROUNDS;
  }

  register = async (req, res) => {
    const username = req.body.username;
    const user = await this.userModel.getUser(username);

    if (user)
      return res.send(
        ApiResponse.badRequest("Username đã tồn tại, vui lòng thử lại.")
      );

    const hashPassword = this.bcrypt.hashSync(
      req.body.password,
      this.SALT_ROUNDS
    );
    let refreshToken = this.randToken.generate(24);

    const data = {
      username: username,
      fullname: req.body.fullname,
      rawpassword: req.body.password,
      password: hashPassword,
      refreshToken: refreshToken,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      role: "SinhVien",
    };

    const newUser = await this.userModel.createUser(data);
    const accessToken = await this.authModels.createToken(
      username,
      refreshToken
    );

    if (newUser && accessToken)
      return res.send(
        ApiResponse.success({
          username: username,
          accessToken: accessToken.accessToken,
          redirect: "/user/profile",
        })
      );
    else
      return res.send(ApiResponse.badRequest("Tạo tài khoản không thành công"));
  };

  login = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    let user = await this.userModel.getUser(username);
    if (user) {
      if (!user.refreshToken) {
        const hashPassword = this.bcrypt.hashSync(
          user.rawpassword,
          this.SALT_ROUNDS
        );

        await this.userModel.updateRefreshToken(
          username,
          hashPassword,
          refreshToken
        );

        user.password = hashPassword;
        user.refreshToken = refreshToken;
      }

      const isValid = this.bcrypt.compareSync(password, user.password);

      if (!isValid)
        return res.send(
          ApiResponse.badRequest("Tài khoản hoặc mật khẩu không đúng.")
        );

      let refreshToken = await this.authModels.createToken(
        username,
        user.refreshToken
      );

      if (refreshToken) {
        return res.send(
          ApiResponse.success({
            username: username,
            accessToken: refreshToken.accessToken,
            redirect: "/user/profile",
          })
        );
      } else
        return res.send(
          ApiResponse.badRequest("Đăng nhập không thành công, vui lòng thử lại")
        );
    } else
      return res.send(
        ApiResponse.badRequest("Tài khoản hoặc mật khẩu không đúng.")
      );
  };

  refreshToken = async (req, res) => {
    const accessTokenFromHeader = req.headers.x_authorization;
    if (!accessTokenFromHeader)
      return res.status(400).send({ message: "Không tìm thấy access token" });

    const refreshTokenFromBody = req.body.refreshToken;
    if (!refreshTokenFromBody)
      return res.status(400).send({ message: "Không tìm thấy refresh token" });

    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;

    const decoded = await this.authMethod.decodeToken(
      accessTokenFromHeader,
      accessTokenSecret
    );
    if (!decoded)
      return res.status(400).send({ message: "Access token không hợp lệ" });

    const username = decoded.payload.username;

    const user = await this.userModel.getUser(username);
    if (!user)
      return res.status(401).send({ message: "Tài khoản không tồn tại" });

    if (refreshTokenFromBody !== user.message.refreshToken)
      return res.status(400).send({ message: "Refresh token không hợp lệ" });

    const dataForAccessToken = {
      username,
    };

    const accessToken = await this.authMethod.generateToken(
      dataForAccessToken,
      accessTokenSecret,
      accessTokenLife
    );
    if (!accessToken)
      return res.send(
        ApiResponse.badRequest(
          "Tạo access token không thành công, vui lòng thử lại."
        )
      );

    return res.send(
      ApiResponse.success({
        accessToken: accessToken,
      })
    );
  };
}

module.exports = AuthController;
