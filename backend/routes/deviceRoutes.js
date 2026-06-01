const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const auth = require('../middleware/auth');

// 新增设备
router.post('/add', auth, deviceController.addDevice);

// 获取设备列表
router.get('/list', auth, deviceController.getDeviceList);

// 获取设备详情
router.get('/detail/:id', auth, deviceController.getDeviceDetail);

module.exports = router;
