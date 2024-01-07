var pug = require("pug");
const NodeCache = require("node-cache");
const QuestionInfo = require("../users/question/question.models");
const QueryService = require("../query/query.service");
const UserInfo = require("../users/user/user.models");

class UserController {
  constructor(SALT_ROUNDS = 10) {
    this.questionModel = new QuestionInfo();
    this.usersModel = new UserInfo();
    this.queryService = new QueryService();
    this.bcrypt = require("bcryptjs");
    this.SALT_ROUNDS = SALT_ROUNDS;
    this.myCache = new NodeCache({ stdTTL: 100, checkperiod: 60 });
  }

  TestSQL = async (req, res) => {
    const MaCH = req.params.MaCH;
    if (req.body.SQLQuery) {
      const result = await this.queryService.testQuery(
        MaCH,
        req.body.SQLQuery,
        req.user
      );
      return res.status(200).json({
        statusCode: result === 100 ? 200 : 400,
        alert: "Kết quả so khớp: " + result + "%",
      });
    } else {
      return res.status(400).json({
        statusCode: 400,
        message: "Không có dữ liệu",
        alert: "Không có dữ liệu",
        result: "Vui lòng nhập câu lệnh SQL trước khi gửi yêu cầu",
      });
    }
  };

  LayDanhSachCauHoi = async (req, res) => {
    let userCH = req.user.username + ":DSCH";
    let value = myCache.get(userCH);

    if (value) {
      let html = pug.renderFile("public/user/LuyenTap.pug", {
        user: req.user,
        questionList: value,
      });
      return res.send(html);
    } else {
      let result = await this.questionModel.LayDanhSachCauHoi(req.user);
      myCache.set(userCH, result);
      let html = pug.renderFile("public/user/LuyenTap.pug", {
        user: req.user,
        questionList: result,
      });
      return res.send(html);
    }
  };

  LayCauHoi = async (req, res) => {
    const MaCH = req.params.MaCH;
    let result = await this.questionModel.LayCauHoi(MaCH, req.user);

    if (result) {
      let html = pug.renderFile("public/user/TestSQL.pug", {
        user: req.user,
        message: result.message,
        schemas: result.schemas,
        history: result.history,
      });

      res.send(html);
    } else {
      let html = pug.renderFile("public/404.pug", {
        message: result.message,
        redirect: "/user/TestSQL/",
        href: "Đi đến trang câu hỏi",
      });
      res.send(html);
    }
  };

  LayDanhSachBaiTap = async (req, res, next) => {
    let userCH = req.user.username + ":DSBT";
    let value = this.myCache.get(userCH);
    if (value) {
      let html = pug.renderFile("public/user/BaiTap.pug", {
        user: req.user,
        questionList: value,
      });
      return res.send(html);
    } else {
      let result = await this.questionModel.LayDanhSachBaiTap(req.user);
      this.myCache.set(userCH, result);
      let html = pug.renderFile("public/user/BaiTap.pug", {
        user: req.user,
        questionList: result,
      });
      res.send(html);
    }
  };

  LayNoiDungBaiTap = async (req, res) => {
    const MaBT = req.params.MaBT;
    const MaCH = req.params.MaCH;
    const result = await this.questionModel.LayNoiDungBaiTap(
      MaBT,
      MaCH,
      req.user
    );

    let html = pug.renderFile("public/user/NoiDungBaiTap.pug", {
      user: req.user,
      question: result?.currentQuestion,
      schemas: result?.schemas,
      history: result?.history,
      anotherQuestion: result?.anotherQuestion,
    });

    res.send(html);
  };

  NopBaiTap = async (req, res) => {
    const MaBT = req.params.MaBT;
    const MaCH = req.params.MaCH;
    if (req.body.SQLQuery) {
      const result = await this.questionModel.NopBaiTap(
        MaBT,
        MaCH,
        req.body.SQLQuery,
        req.user
      );

      return res.status(result.statusCode).json(result);
    } else {
      return res.status(400).json({
        statusCode: 400,
        message: "Không có dữ liệu",
        alert: "Không có dữ liệu",
        result: "Vui lòng nhập câu lệnh SQL trước khi gửi yêu cầu",
      });
    }
  };

  DoiThongTin = async (req, res) => {
    const username = req.user.username;
    const user = await this.usersModel.getUser(username);

    await this.usersModel.changeInfoUser(username, req.body);

    if (req.body.isChangePassword) {
      const password = req.body.password;
      const newPassword = req.body.newPassword;
      const confirmNewPassword = req.body.confirmPassword;

      if (user.statusCode == 200) {
        const isValid = this.bcrypt.compareSync(password, user.password);

        if (!isValid)
          return res.status(400).send({
            statusCode: 400,
            message: "Mật khẩu cũ không đúng",
            alert: "Mật khẩu cũ không đúng",
          });

        if (newPassword !== confirmNewPassword)
          return res.status(400).send({
            statusCode: 400,
            message: "Mật khẩu mới không khớp",
            alert: "Mật khẩu mới không khớp",
          });

        const hashPassword = this.bcrypt.hashSync(newPassword, 10);
        const updatePassword = await this.usersModel.updatePassword(
          username,
          hashPassword,
          password
        );

        if (updatePassword)
          return res.status(200).send({
            statusCode: 200,
            message: "Đổi thông tin thành công",
            alert: "Đổi thông tin thành công",
          });
        else
          return res.status(400).send({
            statusCode: 400,
            message: "Đổi mật khẩu thất bại",
            alert: "Đổi mật khẩu thất bại",
          });
      }
    } else {
      return res.status(200).send({
        statusCode: 200,
        message: "Đổi thông tin thành công",
        alert: "Đổi thông tin thành công",
      });
    }
  };
}

module.exports = UserController;
