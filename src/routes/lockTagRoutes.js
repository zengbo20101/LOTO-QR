const express = require('express');
const router = express.Router();

// 模拟数据
const mockLockTags = [
  {
    _id: '1',
    tagId: 'TAG001',
    name: '红色上锁牌',
    status: '可用',
    description: '用于电气设备的上锁挂牌',
    lastInspected: new Date('2026-04-01').toISOString(),
    qrCodeUrl: '/qr-codes/TAG001.png'
  },
  {
    _id: '2',
    tagId: 'TAG002',
    name: '蓝色上锁牌',
    status: '可用',
    description: '用于机械设备的上锁挂牌',
    lastInspected: new Date('2026-04-02').toISOString(),
    qrCodeUrl: '/qr-codes/TAG002.png'
  }
];

// 获取所有上锁牌子
router.get('/', (req, res) => {
  res.json(mockLockTags);
});

// 获取单个上锁牌子
router.get('/:id', (req, res) => {
  const lockTag = mockLockTags.find(tag => tag._id === req.params.id);
  if (!lockTag) {
    return res.status(404).json({ message: '上锁牌子未找到' });
  }
  res.json(lockTag);
});

// 创建上锁牌子
router.post('/', (req, res) => {
  const newLockTag = {
    _id: (mockLockTags.length + 1).toString(),
    tagId: req.body.tagId,
    name: req.body.name,
    status: req.body.status || '可用',
    description: req.body.description,
    lastInspected: new Date().toISOString(),
    qrCodeUrl: `/qr-codes/${req.body.tagId}.png`
  };
  mockLockTags.push(newLockTag);
  res.status(201).json(newLockTag);
});

// 更新上锁牌子
router.put('/:id', (req, res) => {
  const index = mockLockTags.findIndex(tag => tag._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: '上锁牌子未找到' });
  }
  mockLockTags[index] = {
    ...mockLockTags[index],
    ...req.body
  };
  res.json(mockLockTags[index]);
});

// 删除上锁牌子
router.delete('/:id', (req, res) => {
  const index = mockLockTags.findIndex(tag => tag._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: '上锁牌子未找到' });
  }
  mockLockTags.splice(index, 1);
  res.json({ message: '上锁牌子删除成功' });
});

// 为现有上锁牌子生成二维码
router.post('/:id/generate-qr', (req, res) => {
  const index = mockLockTags.findIndex(tag => tag._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: '上锁牌子未找到' });
  }
  mockLockTags[index].qrCodeUrl = `/qr-codes/${mockLockTags[index].tagId}.png`;
  res.json(mockLockTags[index]);
});

// 下载二维码
router.get('/:id/download-qr', (req, res) => {
  const lockTag = mockLockTags.find(tag => tag._id === req.params.id);
  if (!lockTag) {
    return res.status(404).json({ message: '上锁牌子未找到' });
  }
  res.json({ message: '二维码下载功能' });
});

module.exports = router;
