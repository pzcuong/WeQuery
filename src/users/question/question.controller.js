var pug = require("pug");
const NodeCache = require("node-cache");
const QuestionInfo = require("../../users/question/question.models");
const QueryService = require("../../query/query.service");
const ApiResponse = require("../../common/api.response");

class QuestionController {
  constructor() {
    this.questionModel = new QuestionInfo();
    this.queryService = new QueryService();
    this.myCache = new NodeCache({ stdTTL: 100, checkperiod: 60 });
  }

  TestSQL = async (req, res) => {
    const MaCH = req.params.MaCH;
    if (req.body.SQLQuery) {
      const result = await this.queryService.testQuery(
        MaCH,
        req.body.SQLQuery,
        req.user,
        req.body.randomString
      );
      return result
        ? res.send(ApiResponse.success("Kết quả so khớp: " + result + "%"))
        : res.send(ApiResponse.notFound());
    } else {
      return res.send(ApiResponse.notFound("Không có dữ liệu"));
    }
  };

  LayDanhSachCauHoi = async (req, res) => {
    let userCH = req.user.username + ":DSCH";
    let value = this.myCache.get(userCH);

    if (!value) {
      value = await this.questionModel.LayDanhSachCauHoi(req.user);
      this.myCache.set(userCH, value);
    }

    if (!Array.isArray(value)) value = [value];

    let html = pug.renderFile("public/user/LuyenTap.pug", {
      user: req.user,
      questionList: value,
    });

    return res.send(html);
  };

  LayCauHoi = async (req, res) => {
    const MaCH = req.params.MaCH;
    let result = await this.questionModel.LayCauHoi(MaCH, req.user);

    if (result) {
      let html = pug.renderFile("public/user/TestSQL.pug", {
        user: req.user,
        message: result.message,
        schemas: result.schemas,
        history: result?.history || [],
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

    if (!value) {
      value = await this.questionModel.LayDanhSachBaiTap(req.user);
      this.myCache.set(userCH, value);
    }

    let html = pug.renderFile("public/user/BaiTap.pug", {
      user: req.user,
      questionList: value,
    });

    return res.send(html);
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
      history: result?.history || [],
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
        req.user,
        req.body.randomString
      );
      return res.send(ApiResponse.success(result));
    } else return res.send(ApiResponse.notFound());
  };
}

module.exports = QuestionController;
