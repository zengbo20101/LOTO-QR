const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const auth = require('../middleware/auth');

// 导出LOTO记录为CSV
router.get('/loto', auth, exportController.exportLoto);

module.exports = router;
