class ApiResponse {
  constructor(statusCode, message, data) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  static success(data) {
    return new ApiResponse(200, "Thành công", data);
  }

  static notFound(message) {
    message ? message : "Không có dữ liệu";
    return new ApiResponse(404, message, null);
  }

  static error(message) {
    return new ApiResponse(500, message, null);
  }

  static badRequest(message) {
    return new ApiResponse(400, message, null);
  }
}

module.exports = ApiResponse;
