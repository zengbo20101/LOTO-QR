const express = require('express');
const router = express.Router();
const lotoRecordController = require('../controllers/lotoRecordController');
const createHistoryLogger = require('../middleware/historyLogger');
const auth = require('../middleware/auth');

// 创建历史记录中间件实例
const lotoRecordHistoryLogger = createHistoryLogger('LotoRecord');

// 应用用户上下文中间件
// router.use(lotoRecordHistoryLogger.addUserContext);
// router.use(lotoRecordController.applyUserContext);

// Get all LOTO records - 公开访问
router.get('/', lotoRecordController.getLotoRecords);

// Get LOTO records by lock tag - 公开访问
router.get('/lock-tag/:lockTagId', lotoRecordController.getLotoRecordsByLockTag);

// Get LOTO record by ID - 公开访问
router.get('/:id', lotoRecordController.getLotoRecordById);

// Get LOTO record history - 公开访问
router.get('/:id/history', lotoRecordController.getLotoRecordHistory);

// Create LOTO record - 需要身份验证
router.post('/', auth.verifyToken, lotoRecordController.createLotoRecord);

// Update LOTO record - 需要身份验证和权限检查
router.put('/:id', auth.verifyToken, auth.checkLotoPermission, lotoRecordController.updateLotoRecord);

// Delete LOTO record - 需要身份验证和权限检查
router.delete('/:id', auth.verifyToken, auth.checkLotoPermission, lotoRecordController.deleteLotoRecord);

module.exports = router;