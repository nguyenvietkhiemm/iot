const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

const checkToken = (socket, next) => {
    const token = socket.handshake.headers['token']; // Lấy token từ headers

    // Nếu không có token, cho phép tiếp tục kết nối mà không lưu thông tin người dùng
    if (!token) {
        return next(); // Không có token, vẫn cho phép kết nối
    }

    // Nếu có token, kiểm tra tính hợp lệ của token
    jwt.verify(token, 'alittledaisy_token', async (err, decoded) => {
        if (err) {
            return next(); // Nếu token không hợp lệ, vẫn cho phép kết nối (không chặn kết nối)
        }

        // Lưu thông tin người dùng vào socket.user nếu token hợp lệ
        socket.user = await User.findByPk(decoded.id); // Tìm người dùng theo ID trong token
        next(); // Cho phép tiếp tục kết nối
    });
};

module.exports = checkToken;
