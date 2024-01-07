const express = require("express");
var pug = require("pug");

const router = express.Router();

const AuthController = require("./auth.controller");
const authController = new AuthController();

const authMiddleware = require("./auth.middlewares");
const middleware = new authMiddleware();
const isLogined = middleware.isLogined;

router
  .route("/register")
  .post(authController.register)
  .get(isLogined, (req, res) => {
    let html = pug.renderFile("public/auth/Register.pug");
    res.send(html);
  });

router
  .route("/login")
  .post(authController.login)
  .get(isLogined, (req, res) => {
    let html = pug.renderFile("public/auth/Login.pug");
    res.send(html);
  });

router.post("/refresh", authController.refreshToken);

module.exports = router;
