var router = require('express').Router();

const realTimeApiController = require('../app/controllers/RealTimeApiController');

router.get('/data/data_sensors', realTimeApiController.data_sensors);
router.get('/data/data_devices', realTimeApiController.data_devices);
router.post('/control/device', realTimeApiController.control_device);

module.exports = router;