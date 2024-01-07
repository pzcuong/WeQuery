require("dotenv").config();
const UserInfo = require("../users/user/user.models");
const QueryService = require("../query/query.service");

class AuthController {
  constructor(SALT_ROUNDS = 10) {
    this.userModel = new UserInfo();
    this.queryService = new QueryService();
    this.authMethod = require("../auth/auth.methods");
    this.randToken = require("rand-token");
    this.bcrypt = require("bcryptjs");
    this.SALT_ROUNDS = SALT_ROUNDS;
  }

  createToken = async (username, refreshToken) => {
    const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

    const dataForAccessToken = {
      username: username,
    };
    const accessToken = await this.authMethod.generateToken(
      dataForAccessToken,
      accessTokenSecret,
      accessTokenLife
    );
    if (!accessToken) {
      return {
        statusCode: 401,
        message: "Tạo access token không thành công, vui lòng thử lại.",
      };
    }

    if (refreshToken == null) {
      refreshToken = this.randToken.generate(24);
      await this.userModel.updateRefreshToken(username, refreshToken);
    }

    return {
      statusCode: 200,
      message: "Tạo access token thành công",
      accessToken: accessToken,
      refreshToken: refreshToken,
      username: username,
    };
  };

  register = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (
      !req.body.username ||
      !req.body.password ||
      !req.body.email ||
      !req.body.phoneNumber ||
      !req.body.fullname
    )
      return res.status(400).send({
        statusCode: 400,
        message: "Vui lòng nhập đầy đủ thông tin.",
        alert: "Vui lòng nhập đầy đủ thông tin.",
      });

    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!regex.test(password))
      return res.status(400).send({
        statusCode: 400,
        message:
          "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.",
        alert:
          "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.",
      });

    const user = await this.userModel.getUser(username);

    if (user.statusCode == 400 || user.statusCode == 500)
      return res.status(user.statusCode).send({
        statusCode: user.statusCode,
        message: user.message,
        alert: user.alert,
      });
    else if (user.statusCode == 404) {
      const hashPassword = this.bcrypt.hashSync(
        req.body.password,
        this.SALT_ROUNDS
      );
      let refreshToken = this.randToken.generate(24);

      let role;
      if (role == null) role = "SinhVien";
      else role = req.body.role;

      const data = {
        username: username,
        fullname: req.body.fullname,
        rawpassword: req.body.password,
        password: hashPassword,
        refreshToken: refreshToken,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        role: role,
      };

      const newUser = await this.userModel.createUser(data);
      const accessToken = await this.createToken(username, refreshToken);

      if (newUser.statusCode === 200 && accessToken.statusCode === 200)
        return res.status(200).send({
          statusCode: 200,
          message: "Tạo tài khoản thành công",
          username: username,
          accessToken: accessToken.accessToken,
          redirect: "/user/profile",
        });
      else
        return res.status(400).send({
          statusCode: 400,
          message: "Tạo tài khoản không thành công",
          alert: "Tạo tài khoản không thành công",
        });
    } else
      return res.status(400).send({
        statusCode: 400,
        message: "Username đã tồn tại",
        alert: "Username đã tồn tại",
      });
  };

  login = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username.length < 1 || password.length < 1)
      return res.status(400).send({
        statusCode: 400,
        message: "Vui lòng nhập đầy đủ thông tin.",
        alert: "Vui lòng nhập đầy đủ thông tin.",
      });

    const regex = /\w+/g;
    if (!regex.test(password))
      return res.status(400).send({
        statusCode: 400,
        message:
          "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.",
        alert:
          "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.",
      });

    let user = await this.userModel.getUser(username);
    console.log(user);

    if (user) {
      if (user.refreshToken == null) {
        const hashPassword = this.bcrypt.hashSync(
          user.rawpassword,
          this.SALT_ROUNDS
        );
        let SQLQueryInsert = `UPDATE Admin_Users 
                  SET password = @hashPassword, refreshToken = @refreshToken 
                  WHERE username = @username`;

        let parameters = {
          hashPassword: hashPassword,
          refreshToken: refreshToken,
          username: username,
        };

        result = await this.queryService.query(SQLQueryInsert, parameters);
        user = await this.userModel.getUser(username);
      }

      const isValid = this.bcrypt.compareSync(password, user.password);

      if (!isValid)
        return res.status(400).send({
          statusCode: 400,
          message: "Tài khoản hoặc Mật khẩu không đúng.",
          alert: "Tài khoản hoặc Mật khẩu không đúng",
        });

      let refreshToken = await this.createToken(username, user.refreshToken);

      if (refreshToken.statusCode === 200) {
        return res
          .header({
            "Keep-Alive": "true",
          })
          .send({
            accessToken: refreshToken.accessToken,
            message: "Đăng nhập thành công",
            username: user.username,
            redirect: "/user/profile",
          });
      } else
        return res.status(400).send({
          statusCode: 400,
          message: "Đăng nhập thất bại, vui lòng thử lại.",
          alert: "Đăng nhập thất bại, vui lòng thử lại.",
        });
    } else
      return res.status(400).send({
        statusCode: 400,
        message: "Tài khoản hoặc Mật khẩu không đúng.",
        alert: "Tài khoản hoặc Mật khẩu không đúng.",
      });
  };

  refreshToken = async (req, res) => {
    // Lấy access token từ header
    const accessTokenFromHeader = req.headers.x_authorization;
    if (!accessTokenFromHeader) {
      return res.status(400).send({ message: "Không tìm thấy access token" });
    }

    // Lấy refresh token từ body
    const refreshTokenFromBody = req.body.refreshToken;
    if (!refreshTokenFromBody) {
      return res.status(400).send({ message: "Không tìm thấy refresh token" });
    }

    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;

    // Decode access token đó
    const decoded = await this.authMethod.decodeToken(
      accessTokenFromHeader,
      accessTokenSecret
    );
    if (!decoded) {
      return res.status(400).send({ message: "Access token không hợp lệ" });
    }

    const username = decoded.payload.username; // Lấy username từ payload

    const user = await this.userModel.getUser(username);
    if (!user) {
      return res.status(401).send({ message: "Tài khoản không tồn tại" });
    }

    if (refreshTokenFromBody !== user.message.refreshToken) {
      return res.status(400).send({ message: "Refresh token không hợp lệ" });
    }

    // Tạo access token mới
    const dataForAccessToken = {
      username,
    };

    const accessToken = await this.authMethod.generateToken(
      dataForAccessToken,
      accessTokenSecret,
      accessTokenLife
    );
    if (!accessToken) {
      return res.status(400).send({
        message: "Tạo access token không thành công, vui lòng thử lại.",
      });
    }

    return res.json({
      accessToken,
    });
  };
}

// const authController = new AuthController();
module.exports = AuthController;
