const express = require("express");
const pug = require("pug");
const router = express.Router();

const authMiddleware = require("../auth/auth.middlewares");
const AdminController = require("../admin/admin.controller");
const adminController = new AdminController();

const middleware = new authMiddleware();
const isAuthAdmin = middleware.isAuthAdmin;

const createExerciseValidations = require("./dto/createExercise.dto");
const createQuestionValidations = require("./dto/createQuestion.dto");

router
  .route("/QuanLyBaiTap/")
  .get(isAuthAdmin, adminController.exerciseController.DanhSachBaiTap)
  .post(
    isAuthAdmin,
    createExerciseValidations,
    adminController.exerciseController.ThemBaiTap
  );

router
  .route("/QuanLyBaiTap/:MaBT")
  .get(isAuthAdmin, adminController.exerciseController.LayBaiTap)
  .post(
    isAuthAdmin,
    createExerciseValidations,
    adminController.exerciseController.SuaBaiTap
  );

router
  .route("/QuanLyBaiTap/:MaBT/ThemCauHoi")
  .get(isAuthAdmin, (req, res) => {
    let html = pug.renderFile("public/admin/ThemMoiCauHoi.pug", {
      user: req.user,
    });
    res.send(html);
  })
  .post(
    isAuthAdmin,
    createQuestionValidations,
    adminController.exerciseController.ThemCauHoiTrongBaiTap
  );

router
  .route("/ChinhSua/:MaCH")
  .get(isAuthAdmin, adminController.questionController.LayCauHoi)
  .post(isAuthAdmin, adminController.questionController.ChinhSuaCauHoi);

router
  .route("/QuanLyCauHoi/")
  .get(isAuthAdmin, adminController.questionController.DanhSachCauHoi);

router
  .route("/ThemCauHoi")
  .get(isAuthAdmin, (req, res) => {
    let html = pug.renderFile("public/admin/ThemMoiCauHoi.pug", {
      user: req.user,
    });
    res.send(html);
  })
  .post(isAuthAdmin, adminController.questionController.ThemMoiCauHoi);

router
  .route("/QuanLySinhVien/")
  .get(isAuthAdmin, adminController.userController.DanhSachSinhVien)
  .post(isAuthAdmin, adminController.userController.ThemSinhVien)
  .patch(isAuthAdmin, adminController.userController.SuaThongTinSinhVien);

router
  .route("/QuanLyNhom/")
  .get(isAuthAdmin, adminController.userGroupController.DanhSachNhomSV)
  .post(isAuthAdmin, adminController.userGroupController.ThemNhom);

module.exports = router;
