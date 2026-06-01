const express = require('express');
const router = express.Router();
const lockTagController = require('../controllers/lockTagController');
const auth = require('../middleware/auth');

// 新增锁牌
router.post('/add', auth, lockTagController.addLockTag);

// 获取锁牌列表
router.get('/list', auth, lockTagController.getLockTagList);

// 获取锁牌详情
router.get('/detail/:id', auth, lockTagController.getLockTagDetail);

// 更新锁牌
router.put('/update/:id', auth, lockTagController.updateLockTag);

module.exports = router;
