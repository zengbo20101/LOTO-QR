const LockTag = require('../models/LockTag');

/**
 * 新增锁牌
 * POST /api/locktag/add
 * 前置：JWT鉴权
 * 入参：tagName
 */
exports.addLockTag = async (req, res) => {
  try {
    const { tagName } = req.body;
    
    const tagNo = await LockTag.generateTagNo();
    const tempTag = new LockTag();
    tempTag._id = require('mongoose').Types.ObjectId();
    
    const { qrContent, qrBase64 } = await LockTag.generateQR(tempTag._id);
    
    const lockTag = new LockTag({
      _id: tempTag._id,
      tagNo,
      tagName,
      qrContent,
      qrBase64,
      createdBy: req.user._id
    });
    
    await lockTag.save();
    await lockTag.populate('createdBy', 'username');
    
    res.status(201).json(lockTag);
  } catch (error) {
    res.status(500).json({ message: '添加锁牌失败', error: error.message });
  }
};

/**
 * 获取锁牌列表
 * GET /api/locktag/list
 * 前置：JWT鉴权
 */
exports.getLockTagList = async (req, res) => {
  try {
    const lockTags = await LockTag.find()
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json(lockTags);
  } catch (error) {
    res.status(500).json({ message: '获取锁牌列表失败', error: error.message });
  }
};

/**
 * 获取单个锁牌详情
 * GET /api/locktag/detail/:id
 * 前置：JWT鉴权
 */
exports.getLockTagDetail = async (req, res) => {
  try {
    const lockTag = await LockTag.findById(req.params.id)
      .populate('createdBy', 'username');
    
    if (!lockTag) {
      return res.status(404).json({ message: '锁牌不存在' });
    }
    
    res.json(lockTag);
  } catch (error) {
    res.status(500).json({ message: '获取锁牌详情失败', error: error.message });
  }
};

/**
 * 更新锁牌状态
 * PUT /api/locktag/update/:id
 * 前置：JWT鉴权
 */
exports.updateLockTag = async (req, res) => {
  try {
    const { status } = req.body;
    
    const lockTag = await LockTag.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('createdBy', 'username');
    
    if (!lockTag) {
      return res.status(404).json({ message: '锁牌不存在' });
    }
    
    res.json(lockTag);
  } catch (error) {
    res.status(500).json({ message: '更新锁牌失败', error: error.message });
  }
};
