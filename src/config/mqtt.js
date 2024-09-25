
const mqtt = require('mqtt');

const mqttBrokerUrl = 'mqtt://localhost:1111';
const mqttUser = 'khiem';
const mqttPassword = '123';

// Tạo client MQTT và kết nối
const mqttClient = mqtt.connect(mqttBrokerUrl, {
  username: mqttUser,
  password: mqttPassword
});

// Kết nối MQTT
mqttClient.on('connect', () => {
  console.log('Connected to MQTT Broker');
  // Đăng ký chủ đề MQTT
  mqttClient.subscribe('data/sensor', (err) => {
    if (err) {
      console.error('Failed to subscribe to topic');
    } else {
      console.log('Subscribed to topic: data/sensor');
    }
  });

  mqttClient.subscribe('data/led', (err) => {
    if (err) {
      console.error('Failed to subscribe to topic');
    } else {
      console.log('Subscribed to topic: data/led');
    }
  });
});

module.exports = mqttClient;
