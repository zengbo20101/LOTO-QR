const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 登录
router.post('/login', authController.login);

// 注册
router.post('/register', authController.register);

module.exports = router;