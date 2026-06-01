const { Parser } = require('json2csv');
const LotoRecord = require('../models/LotoRecord');

/**
 * 导出LOTO记录为CSV
 * GET /api/export/loto
 * 前置：JWT鉴权
 * 筛选参数：deviceId, lockTagId, userId, startTime, endTime
 */
exports.exportLoto = async (req, res) => {
  try {
    const { deviceId, lockTagId, userId, startTime, endTime } = req.query;
    
    const filter = {};
    if (deviceId) filter.deviceId = deviceId;
    if (lockTagId) filter.lockTagId = lockTagId;
    if (userId) filter.createdBy = userId;
    if (startTime || endTime) {
      filter.createdAt = {};
      if (startTime) filter.createdAt.$gte = new Date(startTime);
      if (endTime) filter.createdAt.$lte = new Date(endTime);
    }
    
    const lotoRecords = await LotoRecord.find(filter)
      .populate([
        { path: 'deviceId', select: 'deviceNo deviceName' },
        { path: 'lockTagId', select: 'tagNo tagName' },
        { path: 'createdBy', select: 'username' }
      ])
      .sort({ createdAt: -1 });
    
    // 准备CSV数据
    const csvData = lotoRecords.map(record => ({
      '记录ID': record._id,
      '设备编号': record.deviceId?.deviceNo || '-',
      '设备名称': record.deviceId?.deviceName || '-',
      '锁牌编号': record.lockTagId?.tagNo || '-',
      '锁牌名称': record.lockTagId?.tagName || '-',
      'LOTO内容': record.lotoInfo,
      '状态': record.status,
      '创建人': record.createdBy?.username || '-',
      '创建时间': new Date(record.createdAt).toLocaleString('zh-CN'),
      '更新时间': new Date(record.updatedAt).toLocaleString('zh-CN')
    }));
    
    const fields = [
      '记录ID', '设备编号', '设备名称', '锁牌编号', '锁牌名称',
      'LOTO内容', '状态', '创建人', '创建时间', '更新时间'
    ];
    
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(csvData);
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=loto_records_${Date.now()}.csv`);
    res.send('\uFEFF' + csv); // 添加BOM以支持中文
  } catch (error) {
    res.status(500).json({ message: '导出失败', error: error.message });
  }
};
