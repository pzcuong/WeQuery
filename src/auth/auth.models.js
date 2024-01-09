const UserInfo = require("../users/user/user.models");

class AuthModels {
  constructor() {
    this.userModel = new UserInfo();
    this.authMethod = require("../auth/auth.methods");
    this.randToken = require("rand-token");
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

    if (!accessToken) return null;

    if (!refreshToken) {
      refreshToken = this.randToken.generate(24);
      await this.userModel.updateRefreshToken(username, refreshToken);
    }

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      username: username,
    };
  };
}

module.exports = AuthModels;
