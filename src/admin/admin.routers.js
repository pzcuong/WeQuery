const express = require("express");
const pug = require("pug");
const router = express.Router();

const authMiddleware = require("../auth/auth.middlewares");

const isAuthAdmin = authMiddleware.isAuthAdmin;
const adminController = require("../admin/admin.controller");

router
  .route("/QuanLyBaiTap/")
  .get(isAuthAdmin, adminController.DanhSachBaiTap)
  .post(isAuthAdmin, adminController.ThemBaiTap);

router
  .route("/QuanLyBaiTap/:MaBT")
  .get(isAuthAdmin, adminController.LayBaiTap)
  .post(isAuthAdmin, adminController.SuaBaiTap);

router
  .route("/QuanLyBaiTap/:MaBT/ThemCauHoi")
  .get(isAuthAdmin, (req, res) => {
    let html = pug.renderFile("public/admin/ThemMoiCauHoi.pug", {
      user: req.user.result,
    });
    res.send(html);
  })
  .post(isAuthAdmin, adminController.ThemCauHoiTrongBaiTap);

router
  .route("/ChinhSua/:MaCH")
  .get(isAuthAdmin, adminController.LayCauHoi)
  .post(isAuthAdmin, adminController.ChinhSuaCauHoi);

router.route("/QuanLyCauHoi/").get(isAuthAdmin, adminController.DanhSachCauHoi);

router
  .route("/ThemCauHoi")
  .get(isAuthAdmin, (req, res) => {
    let html = pug.renderFile("public/admin/ThemMoiCauHoi.pug", {
      user: req.user.result,
    });
    res.send(html);
  })
  .post(isAuthAdmin, adminController.ThemMoiCauHoi);

router
  .route("/QuanLySinhVien/")
  .get(isAuthAdmin, adminController.DanhSachSinhVien)
  .post(isAuthAdmin, adminController.ThemSinhVien);

router
  .route("/QuanLyNhom/")
  .get(isAuthAdmin, adminController.DanhSachNhomSV)
  .post(isAuthAdmin, adminController.ThemNhom);

module.exports = router;
