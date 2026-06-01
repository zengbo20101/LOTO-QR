const LotoRecord = require('../models/LotoRecord');
const LockTag = require('../models/LockTag');

/**
 * 创建LOTO记录
 * POST /api/loto/add
 * 前置：JWT鉴权
 * 入参：deviceId, lockTagId（可选）, lotoInfo
 */
exports.addLotoRecord = async (req, res) => {
  try {
    const { deviceId, lockTagId, lotoInfo } = req.body;
    
    const lotoRecord = new LotoRecord({
      deviceId,
      lockTagId: lockTagId || undefined,
      lotoInfo,
      createdBy: req.user._id
    });
    
    await lotoRecord.save();
    
    // 如果有关联锁牌，更新锁牌状态
    if (lockTagId) {
      await LockTag.findByIdAndUpdate(lockTagId, { status: '已锁定' });
    }
    
    await lotoRecord.populate([
      { path: 'deviceId', select: 'deviceNo deviceName' },
      { path: 'lockTagId', select: 'tagNo tagName' },
      { path: 'createdBy', select: 'username' }
    ]);
    
    res.status(201).json(lotoRecord);
  } catch (error) {
    res.status(500).json({ message: '创建LOTO记录失败', error: error.message });
  }
};

/**
 * 获取LOTO列表
 * GET /api/loto/list
 * 前置：JWT鉴权
 * 支持筛选：deviceId, lockTagId, userId, startTime, endTime
 */
exports.getLotoList = async (req, res) => {
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
    
    res.json(lotoRecords);
  } catch (error) {
    res.status(500).json({ message: '获取LOTO列表失败', error: error.message });
  }
};

/**
 * 获取LOTO记录详情
 * GET /api/loto/detail/:id
 * 前置：JWT鉴权
 */
exports.getLotoDetail = async (req, res) => {
  try {
    const lotoRecord = await LotoRecord.findById(req.params.id)
      .populate([
        { path: 'deviceId', select: 'deviceNo deviceName' },
        { path: 'lockTagId', select: 'tagNo tagName' },
        { path: 'createdBy', select: 'username' }
      ]);
    
    if (!lotoRecord) {
      return res.status(404).json({ message: 'LOTO记录不存在' });
    }
    
    res.json(lotoRecord);
  } catch (error) {
    res.status(500).json({ message: '获取LOTO详情失败', error: error.message });
  }
};

/**
 * 修改LOTO记录
 * PUT /api/loto/update/:id
 * 前置：JWT鉴权 + 创建人权限
 * 入参：lotoInfo, status（可选）
 */
exports.updateLotoRecord = async (req, res) => {
  try {
    const lotoRecord = await LotoRecord.findById(req.params.id);
    
    if (!lotoRecord) {
      return res.status(404).json({ message: 'LOTO记录不存在' });
    }
    
    // 验证是否为创建人
    if (lotoRecord.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '无权修改此记录' });
    }
    
    const { lotoInfo, status } = req.body;
    if (lotoInfo) lotoRecord.lotoInfo = lotoInfo;
    if (status) lotoRecord.status = status;
    
    await lotoRecord.save();
    
    await lotoRecord.populate([
      { path: 'deviceId', select: 'deviceNo deviceName' },
      { path: 'lockTagId', select: 'tagNo tagName' },
      { path: 'createdBy', select: 'username' }
    ]);
    
    res.json(lotoRecord);
  } catch (error) {
    res.status(500).json({ message: '修改LOTO记录失败', error: error.message });
  }
};

/**
 * 删除LOTO记录
 * DELETE /api/loto/delete/:id
 * 前置：JWT鉴权 + 创建人权限
 */
exports.deleteLotoRecord = async (req, res) => {
  try {
    const lotoRecord = await LotoRecord.findById(req.params.id);
    
    if (!lotoRecord) {
      return res.status(404).json({ message: 'LOTO记录不存在' });
    }
    
    // 验证是否为创建人
    if (lotoRecord.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '无权删除此记录' });
    }
    
    // 如果有关联锁牌，更新锁牌状态
    if (lotoRecord.lockTagId && lotoRecord.status === '锁定') {
      await LockTag.findByIdAndUpdate(lotoRecord.lockTagId, { status: '可用' });
    }
    
    await LotoRecord.findByIdAndDelete(req.params.id);
    
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ message: '删除LOTO记录失败', error: error.message });
  }
};

/**
 * 解除LOTO状态
 * PUT /api/loto/cancel/:id
 * 前置：JWT鉴权 + 创建人权限
 */
exports.cancelLoto = async (req, res) => {
  try {
    const lotoRecord = await LotoRecord.findById(req.params.id);
    
    if (!lotoRecord) {
      return res.status(404).json({ message: 'LOTO记录不存在' });
    }
    
    // 验证是否为创建人
    if (lotoRecord.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '无权解除此记录' });
    }
    
    if (lotoRecord.status === '已解除') {
      return res.status(400).json({ message: '该记录已解除' });
    }
    
    lotoRecord.status = '已解除';
    await lotoRecord.save();
    
    // 如果有关联锁牌，更新锁牌状态
    if (lotoRecord.lockTagId) {
      await LockTag.findByIdAndUpdate(lotoRecord.lockTagId, { status: '可用' });
    }
    
    await lotoRecord.populate([
      { path: 'deviceId', select: 'deviceNo deviceName' },
      { path: 'lockTagId', select: 'tagNo tagName' },
      { path: 'createdBy', select: 'username' }
    ]);
    
    res.json(lotoRecord);
  } catch (error) {
    res.status(500).json({ message: '解除LOTO失败', error: error.message });
  }
};
