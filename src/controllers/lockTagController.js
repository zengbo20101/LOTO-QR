const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const LockTag = require('../models/LockTag');
const mongoose = require('mongoose');

// 模拟数据（当MongoDB不可用时使用）
let mockLockTags = [
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

// 检查MongoDB连接状态
function checkMongoDB() {
  try {
    return mongoose.connection && mongoose.connection.readyState === 1;
  } catch (error) {
    return false;
  }
};

// 生成二维码
const generateQRCodeForTag = async (lockTag) => {
  try {
    // 创建二维码目录（如果不存在）
    const qrCodeDir = path.join(__dirname, '..', 'public', 'qr-codes');
    if (!fs.existsSync(qrCodeDir)) {
      fs.mkdirSync(qrCodeDir, { recursive: true });
    }
    
    // 生成二维码数据（包含tagId的URL）
    const qrCodeData = `http://localhost:3000/?tagId=${lockTag._id}`;
    
    // 生成二维码图片
    const qrCodePath = path.join(qrCodeDir, `${lockTag.tagId}.png`);
    await QRCode.toFile(qrCodePath, qrCodeData, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // 更新上锁牌子的二维码信息
    lockTag.qrCodeData = qrCodeData;
    lockTag.qrCodeUrl = `/qr-codes/${lockTag.tagId}.png`;
    
    return lockTag;
  } catch (error) {
    console.error('Error generating QR code:', error);
    // 即使生成二维码失败，仍然返回牌子信息
    lockTag.qrCodeUrl = '/qr-codes/placeholder.png';
    return lockTag;
  }
};

// 获取所有上锁牌子
exports.getLockTags = async (req, res) => {
  try {
    const mongoDBAlive = checkMongoDB();
    let lockTags;
    
    if (mongoDBAlive) {
      lockTags = await LockTag.find().sort({ createdAt: -1 });
    } else {
      lockTags = mockLockTags;
    }
    
    res.json(lockTags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取单个上锁牌子
exports.getLockTagById = async (req, res) => {
  try {
    const mongoDBAlive = checkMongoDB();
    let lockTag;
    
    if (mongoDBAlive) {
      lockTag = await LockTag.findById(req.params.id);
    } else {
      lockTag = mockLockTags.find(tag => tag._id === req.params.id);
    }
    
    if (!lockTag) {
      return res.status(404).json({ message: '上锁牌子未找到' });
    }
    
    res.json(lockTag);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 创建上锁牌子
exports.createLockTag = async (req, res) => {
  try {
    const mongoDBAlive = checkMongoDB();
    let lockTag;
    
    if (mongoDBAlive) {
      lockTag = new LockTag({
        tagId: req.body.tagId,
        name: req.body.name,
        status: req.body.status || '可用',
        description: req.body.description,
        lastInspected: new Date()
      });
      
      // 为新牌子生成二维码
      const tagWithQR = await generateQRCodeForTag(lockTag);
      await tagWithQR.save();
      lockTag = tagWithQR;
    } else {
      lockTag = {
        _id: (mockLockTags.length + 1).toString(),
        tagId: req.body.tagId,
        name: req.body.name,
        status: req.body.status || '可用',
        description: req.body.description,
        lastInspected: new Date().toISOString()
      };
      
      // 为新牌子生成二维码
      const tagWithQR = await generateQRCodeForTag(lockTag);
      mockLockTags.push(tagWithQR);
      lockTag = tagWithQR;
    }
    
    res.status(201).json(lockTag);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 更新上锁牌子
exports.updateLockTag = async (req, res) => {
  try {
    const mongoDBAlive = checkMongoDB();
    let lockTag;
    
    if (mongoDBAlive) {
      lockTag = await LockTag.findById(req.params.id);
      if (!lockTag) {
        return res.status(404).json({ message: '上锁牌子未找到' });
      }
      
      // 更新字段
      if (req.body.tagId) lockTag.tagId = req.body.tagId;
      if (req.body.name) lockTag.name = req.body.name;
      if (req.body.status) lockTag.status = req.body.status;
      if (req.body.description !== undefined) lockTag.description = req.body.description;
      
      // 如果更改了tagId或name，重新生成二维码
      if (req.body.tagId || req.body.name) {
        lockTag = await generateQRCodeForTag(lockTag);
      }
      
      await lockTag.save();
    } else {
      const index = mockLockTags.findIndex(tag => tag._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ message: '上锁牌子未找到' });
      }
      
      // 更新字段
      if (req.body.tagId) mockLockTags[index].tagId = req.body.tagId;
      if (req.body.name) mockLockTags[index].name = req.body.name;
      if (req.body.status) mockLockTags[index].status = req.body.status;
      if (req.body.description !== undefined) mockLockTags[index].description = req.body.description;
      
      // 如果更改了tagId或name，重新生成二维码
      if (req.body.tagId || req.body.name) {
        mockLockTags[index] = await generateQRCodeForTag(mockLockTags[index]);
      }
      
      lockTag = mockLockTags[index];
    }
    
    res.json(lockTag);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 删除上锁牌子
exports.deleteLockTag = async (req, res) => {
  try {
    const mongoDBAlive = checkMongoDB();
    
    if (mongoDBAlive) {
      const lockTag = await LockTag.findByIdAndDelete(req.params.id);
      if (!lockTag) {
        return res.status(404).json({ message: '上锁牌子未找到' });
      }
    } else {
      const index = mockLockTags.findIndex(tag => tag._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ message: '上锁牌子未找到' });
      }
      mockLockTags.splice(index, 1);
    }
    
    res.json({ message: '上锁牌子删除成功' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 为现有上锁牌子生成二维码
exports.generateQRCode = async (req, res) => {
  try {
    const mongoDBAlive = checkMongoDB();
    let lockTag;
    
    if (mongoDBAlive) {
      lockTag = await LockTag.findById(req.params.id);
      if (!lockTag) {
        return res.status(404).json({ message: '上锁牌子未找到' });
      }
      lockTag = await generateQRCodeForTag(lockTag);
      await lockTag.save();
    } else {
      const index = mockLockTags.findIndex(tag => tag._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ message: '上锁牌子未找到' });
      }
      mockLockTags[index] = await generateQRCodeForTag(mockLockTags[index]);
      lockTag = mockLockTags[index];
    }
    
    res.json(lockTag);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 下载二维码
exports.downloadQRCode = async (req, res) => {
  try {
    const mongoDBAlive = checkMongoDB();
    let lockTag;
    
    if (mongoDBAlive) {
      lockTag = await LockTag.findById(req.params.id);
    } else {
      lockTag = mockLockTags.find(tag => tag._id === req.params.id);
    }
    
    if (!lockTag) {
      return res.status(404).json({ message: '上锁牌子未找到' });
    }
    
    if (!lockTag.qrCodeUrl) {
      return res.status(404).json({ message: '该上锁牌子未生成二维码' });
    }
    
    const qrCodePath = path.join(__dirname, '..', 'public', lockTag.qrCodeUrl);
    if (!fs.existsSync(qrCodePath)) {
      return res.status(404).json({ message: '二维码文件未找到' });
    }
    
    res.download(qrCodePath, `${lockTag.tagId}_qrcode.png`);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 导出模拟数据（供其他模块使用）
exports.mockLockTags = mockLockTags;
