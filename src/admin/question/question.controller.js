const pug = require("pug");
const ApiResponse = require("../../common/api.response");
const QuestionModel = require("./question.models");

class QuestionController {
  constructor() {
    this.questionModel = new QuestionModel();
  }

  handleTaoQuanHe = async (data, res) => {
    const result = await this.questionModel.TaoQuanHe(data);
    if (result) return res.send(ApiResponse.success({ MaCH: result.MaCH }));
    else return res.send(ApiResponse.error("Thêm câu hỏi thất bại"));
  };

  handleTaoCauHoi = async (data, res) => {
    const result = await this.questionModel.ThemCauHoi(data);
    if (result) return res.send(ApiResponse.success(result));
    else return res.send(ApiResponse.badRequest("Thêm câu hỏi thất bại"));
  };

  handleSuaCauHoi = async (MaCH, data, res) => {
    const result = await this.questionModel.ChinhSuaCauHoi(MaCH, data);

    if (result.updateResult && result.updateTestCase)
      return res.send(ApiResponse.success(result));
    else return res.send(ApiResponse.badRequest("Sửa câu hỏi thất bại"));
  };

  handleKiemThuTestCase = async (data, res) => {
    const result = await this.questionModel.KiemThuTestCase(data);

    return res.send(ApiResponse.success(result));
  };

  handleXoaCauHoi = async (MaCH, res) => {
    const result = await this.questionModel.XoaCauHoi(MaCH);
    return res.send(ApiResponse.success({ MaCH: result.MaCH }));
  };

  ThemMoiCauHoi = async (req, res) => {
    const data = req.body;
    switch (req.body.type) {
      case "TaoCauHoi":
        return this.handleTaoCauHoi(data, res);
      case "TaoQuanHe":
        return this.handleTaoQuanHe(data, res);
      case "KiemThuTestCase":
        return this.handleKiemThuTestCase(data, res);
      default:
        return res.send(
          ApiResponse.badRequest("Không xác định được loại câu hỏi")
        );
    }
  };

  LayCauHoi = async (req, res) => {
    const MaCH = req.params.MaCH;
    let result = await this.questionModel.LayCauHoi(MaCH);
    let html;
    if (result)
      html = pug.renderFile("public/admin/ChinhSuaCauHoi.pug", {
        user: req.user,
        data: result,
      });
    else
      html = pug.renderFile("public/404.pug", {
        message: result,
        redirect: "/admin/ThemTestCase/1",
      });
    res.send(html);
  };

  ChinhSuaCauHoi = async (req, res) => {
    const data = req.body;
    const MaCH = req.params.MaCH;

    switch (data.type) {
      case "TaoQuanHe":
        return this.handleTaoQuanHe(data, res);
      case "SuaCauHoi":
        return this.handleSuaCauHoi(MaCH, data, res);
      case "KiemThuTestCase":
        return this.handleKiemThuTestCase(data, res);
      case "XoaCauHoi":
        return this.handleXoaCauHoi(MaCH, res);
      default:
        return res
          .status(400)
          .send({ message: "Không xác định được loại câu hỏi" });
    }
  };

  DanhSachCauHoi = async (req, res) => {
    let result = await this.questionModel.DanhSachCauHoi();
    if (!Array.isArray(result)) result = [result];
    let html = pug.renderFile("public/admin/QuanLyCauHoi.pug", {
      user: req.user,
      questionList: result || [],
    });

    res.send(html);
  };
}

module.exports = QuestionController;
