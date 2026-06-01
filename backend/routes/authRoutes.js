const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// 登录
router.post('/login', authController.login);

// 注册（仅管理员）
router.post('/register', auth, isAdmin, authController.register);

module.exports = router;
