const express = require('express');
const router = express.Router();
const lotoController = require('../controllers/lotoController');
const auth = require('../middleware/auth');

// 创建LOTO记录
router.post('/add', auth, lotoController.addLotoRecord);

// 获取LOTO列表
router.get('/list', auth, lotoController.getLotoList);

// 获取LOTO详情
router.get('/detail/:id', auth, lotoController.getLotoDetail);

// 修改LOTO记录
router.put('/update/:id', auth, lotoController.updateLotoRecord);

// 删除LOTO记录
router.delete('/delete/:id', auth, lotoController.deleteLotoRecord);

// 解除LOTO状态
router.put('/cancel/:id', auth, lotoController.cancelLoto);

module.exports = router;
