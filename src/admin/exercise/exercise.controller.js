const pug = require("pug");
const ExerciseModel = require("./exercise.models");
const ApiResponse = require("../../common/api.response");
const UserGroupModel = require("../userGroup/userGroup.models");
const QuestionModel = require("../question/question.models");

class ExerciseController {
  constructor() {
    this.exerciseModel = new ExerciseModel();
    this.questionModel = new QuestionModel();
    this.userGroupModel = new UserGroupModel();
  }

  handleTaoQuanHe = async (data, res) => {
    const result = await this.questionModel.TaoQuanHe(data);
    if (result) return res.send(ApiResponse.success({ MaCH: result.MaCH }));
    else return res.send(ApiResponse.error("Thêm câu hỏi thất bại"));
  };

  handleTaoCauHoi = async (MaBT, data, res) => {
    const createQuestion = await this.questionModel.ThemCauHoi(data);
    const addQuestionToExercise = this.exerciseModel.ThemCauHoiVaoBaiTap(
      MaBT,
      createQuestion.MaCH
    );
    if (createQuestion && addQuestionToExercise)
      return res.send(ApiResponse.success({ MaCH: createQuestion.MaCH }));
    else return res.send(ApiResponse.error("Thêm câu hỏi thất bại"));
  };

  handleKiemThuTestCase = async (data, res) => {
    return await this.questionModel.KiemThuTestCase(data.SQLQuery);
  };

  ThemCauHoiTrongBaiTap = async (req, res) => {
    const data = req.body;
    const MaBT = req.params.MaBT;

    switch (data.type) {
      case "TaoQuanHe":
        return this.handleTaoQuanHe(data, res);
      case "TaoCauHoi":
        return this.handleTaoCauHoi(MaBT, data, res);
      case "KiemThuTestCase":
        return this.handleKiemThuTestCase(data, res);
      default:
        return res.send(
          ApiResponse.badRequest("Không xác định được loại câu hỏi")
        );
    }
  };

  DanhSachBaiTap = async (req, res) => {
    let questionList = await this.exerciseModel.DanhSachBaiTap();
    let dsNhom = await this.userGroupModel.DanhSachNhom();
    let html;

    if (questionList)
      html = pug.renderFile("public/admin/QuanLyBaiTap.pug", {
        user: req.user,
        questionList: questionList,
        dsNhom: dsNhom,
      });
    else
      html = pug.renderFile("public/404.pug", {
        message: result,
        redirect: "/admin/QuanLyBaiTap",
      });

    res.send(html);
  };

  ThemBaiTap = async (req, res) => {
    const data = req.body;

    const result = await this.exerciseModel.ThemBaiTap(data);
    if (result) return res.send(ApiResponse.success(result));
    else return res.send(ApiResponse.error("Thêm bài tập thất bại"));
  };

  SuaBaiTap = async (req, res) => {
    const data = req.body;
    const MaBT = req.params.MaBT;

    const result = await this.exerciseModel.SuaBaiTap(data, MaBT);
    if (result) return res.send(ApiResponse.success(result));
    else return res.send(ApiResponse.error("Sửa bài tập thất bại"));
  };

  LayBaiTap = async (req, res) => {
    const MaBT = req.params.MaBT;
    let exercise = await this.exerciseModel.LayBaiTap(MaBT);
    let dsNhom = await this.userGroupModel.DanhSachNhom();
    let BXH = await this.questionModel.BangXepHang(MaBT);

    let html;
    if (exercise)
      html = pug.renderFile("public/admin/QuanLyCauHoiTrongBaiTap.pug", {
        user: req.user,
        TieuDeBaiTap: exercise[0].TieuDeBaiTap,
        questionList: exercise,
        dsNhom: dsNhom,
        BXH: BXH,
      });
    else
      html = pug.renderFile("public/404.pug", {
        message: result,
        redirect: "/admin/QuanLyBaiTap",
      });

    res.send(html);
  };
}

module.exports = ExerciseController;
