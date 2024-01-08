const express = require("express");
var pug = require("pug");

const router = express.Router();

const AuthController = require("./auth.controller");
const authController = new AuthController();

const authMiddleware = require("./auth.middlewares");
const middleware = new authMiddleware();
const isLogined = middleware.isLogined;

const loginValidations = require("./dto/login.dto");
const registerValidations = require("./dto/register.dto");

router
  .route("/register")
  .post(registerValidations, authController.register)
  .get(isLogined, (req, res) => {
    let html = pug.renderFile("public/auth/Register.pug");
    res.send(html);
  });

router
  .route("/login")
  .post(loginValidations, authController.login)
  .get(isLogined, (req, res) => {
    let html = pug.renderFile("public/auth/Login.pug");
    res.send(html);
  });

router.post("/refresh", authController.refreshToken);

module.exports = router;
