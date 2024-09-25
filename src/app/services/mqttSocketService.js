const Data_Sensor = require('../models/Data_Sensor');
const Data_Device = require('../models/Data_Device');
const checkToken = require('../middlewares/checkToken');
const Device = require('../models/Device');

module.exports = function (mqttClient, server) {
    const io = require('socket.io')(server, {
        cors: {
            origin: (origin, callback) => {
                if (origin) {
                    callback(null, origin); // Chấp nhận mọi nguồn gốc
                } else {
                    callback(null, '*'); // Trường hợp không có origin (dùng cho các công cụ phát triển)
                }
            },
            methods: ["GET", "POST"],
            credentials: true // Cho phép gửi cookie từ client
        }
    });
    
    let data = {
        "data/sensor": null,
        "data/led": null,
        "control/led": null,
    }

    mqttClient.on('message', (topic, message) => {
        data[topic] = {
            ...data[topic],
            ...JSON.parse(message.toString())
        };// lưu data vào object

        if (topic === "data/led") {
            Object.keys(data['data/led']).forEach((id) => { // Lưu trạng thái devices
                Device.update({
                    status: data['data/led'][id],
                },
                    { where: { id: id } });
            });

            if (data['control/led']) {
                Object.keys(data['control/led']).forEach((key) => {
                    Data_Device.create({
                        device_id: key, // id của thiết bị
                        action: data['control/led'][key], // action tương ứng với id
                        user_id: 1
                    });
                });
                data['control/led'] = null;
            }
        }

        if (!data["data/led"]) {
            mqttClient.publish("control/led", null); // gọi để lấy led data ban đầu 
        }

        io.emit('data', {
            topic: topic,
            data: data[topic]
        });

        console.log(data);
    });

    io.use(checkToken); // Đặt middleware trước khi lắng nghe kết nối
    io.on('connection', (socket) => {
        console.log('a user connected');

        Object.keys(data).forEach((topic) => {
            socket.emit('data', {
                topic: topic,
                data: data[topic]
            }); // gửi data về cho socket khi kết nối đầu tiên
        });

        socket.on('control', (controlData) => { // io sẽ lắng nghe sự kiện control với socket
            console.log(JSON.stringify(controlData, null, 2));

            if (!socket.user) {
                console.log("không có id");
                return socket.emit('error', { message: 'Unauthorized access. Please log in.' });
            }

            let _controlData = {};
            Object.keys(controlData).forEach((key) => {
                if (controlData[key] !== data["data/led"]) {
                    _controlData[key] = controlData[key];
                }
            })
            if (_controlData) {
                data["control/led"] = _controlData; // lưu data vào object
                mqttClient.publish("control/led", JSON.stringify(_controlData, null, 2));
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    })

    setInterval(() => {
        if (data["data/sensor"]) {
            Data_Sensor.create({
                temperature: data["data/sensor"].t,
                humidity: data["data/sensor"].h,
                light: data["data/sensor"].l,
            });
            console.log("saved data sensor to DB");
        }
    }, 60000); // Mỗi 60 giây (1 phút)
} 