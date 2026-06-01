require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');

const app = express();
app.use(cors());
app.use(express.json());

let usingMockData = false;
let mockData = {
  users: [
    { _id: 'admin1', username: 'SARL2LOTO', password: 'EHS123456', role: 'admin', createdAt: new Date() },
    { _id: 'user1', username: 'user1', password: '123456', role: 'user', createdAt: new Date() }
  ],
  devices: [],
  lockTags: [],
  lotoRecords: []
};

const ObjectId = () => 'mock_' + Math.random().toString(36).substr(2, 9);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/loto-qr');
    console.log('MongoDB连接成功');
    
    const User = require('./models/User');
    const adminExists = await User.findOne({ username: 'SARL2LOTO' });
    if (!adminExists) {
      const admin = new User({
        username: 'SARL2LOTO',
        password: 'EHS123456',
        role: 'admin'
      });
      await admin.save();
      console.log('管理员账号创建成功');
    }
  } catch (error) {
    console.log('MongoDB连接失败，切换到模拟数据模式:', error.message);
    usingMockData = true;
    await initMockData();
  }
}

async function initMockData() {
  console.log('初始化模拟数据');
  mockData.devices = [
    {
      _id: 'device1',
      deviceNo: 'EQP-2026-001',
      deviceName: '冲压车间1号机床',
      qrContent: 'pages/loto/loto?deviceId=device1',
      qrBase64: '',
      createdBy: { _id: 'admin1', username: 'SARL2LOTO' },
      createdAt: new Date()
    },
    {
      _id: 'device2',
      deviceNo: 'EQP-2026-002',
      deviceName: '焊接机器人',
      qrContent: 'pages/loto/loto?deviceId=device2',
      qrBase64: '',
      createdBy: { _id: 'admin1', username: 'SARL2LOTO' },
      createdAt: new Date()
    }
  ];
  
  mockData.lockTags = [
    {
      _id: 'tag1',
      tagNo: 'TAG-2026-001',
      tagName: '红色安全锁A',
      status: '可用',
      qrContent: 'pages/loto/loto?tagId=tag1',
      qrBase64: '',
      createdBy: { _id: 'admin1', username: 'SARL2LOTO' },
      createdAt: new Date()
    },
    {
      _id: 'tag2',
      tagNo: 'TAG-2026-002',
      tagName: '蓝色安全锁B',
      status: '可用',
      qrContent: 'pages/loto/loto?tagId=tag2',
      qrBase64: '',
      createdBy: { _id: 'admin1', username: 'SARL2LOTO' },
      createdAt: new Date()
    }
  ];
  
  for (let device of mockData.devices) {
    try {
      device.qrBase64 = await QRCode.toDataURL(device.qrContent, { width: 256 });
    } catch (e) {
      device.qrBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    }
  }
  
  for (let tag of mockData.lockTags) {
    try {
      tag.qrBase64 = await QRCode.toDataURL(tag.qrContent, { width: 256 });
    } catch (e) {
      tag.qrBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    }
  }
}

function authMiddleware(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: '未提供认证令牌' });
  }
  
  if (usingMockData && token.startsWith('mock_token_')) {
    req.user = { userId: 'admin1', role: 'admin' };
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: '认证失败，请重新登录' });
  }
}

app.get('/', (req, res) => {
  res.json({ 
    message: 'LOTO QR System API',
    mode: usingMockData ? '模拟数据模式' : '真实数据库模式'
  });
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (usingMockData) {
      const user = mockData.users.find(u => u.username === username && u.password === password);
      if (!user) {
        return res.status(401).json({ message: '用户名或密码错误' });
      }
      
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      res.json({
        token,
        user: { _id: user._id, username: user.username, role: user.role }
      });
    } else {
      const User = require('./models/User');
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({ message: '用户名或密码错误' });
      }
      
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: '用户名或密码错误' });
      }
      
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      res.json({
        token,
        user: { _id: user._id, username: user.username, role: user.role }
      });
    }
  } catch (error) {
    res.status(500).json({ message: '登录失败', error: error.message });
  }
});

app.post('/api/auth/register', authMiddleware, async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '需要管理员权限' });
    }
    
    if (usingMockData) {
      const existingUser = mockData.users.find(u => u.username === username);
      if (existingUser) {
        return res.status(400).json({ message: '用户名已存在' });
      }
      
      const newUser = {
        _id: ObjectId(),
        username,
        password,
        role: role || 'user',
        createdAt: new Date()
      };
      mockData.users.push(newUser);
      
      res.status(201).json({
        message: '用户创建成功',
        user: { _id: newUser._id, username: newUser.username, role: newUser.role }
      });
    } else {
      const User = require('./models/User');
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: '用户名已存在' });
      }
      
      const user = new User({
        username,
        password,
        role: role || 'user'
      });
      await user.save();
      
      res.status(201).json({
        message: '用户创建成功',
        user: { _id: user._id, username: user.username, role: user.role }
      });
    }
  } catch (error) {
    res.status(500).json({ message: '注册失败', error: error.message });
  }
});

app.post('/api/device/add', authMiddleware, async (req, res) => {
  try {
    const { deviceName } = req.body;
    const year = new Date().getFullYear();
    const num = (mockData.devices.length + 1).toString().padStart(3, '0');
    const deviceNo = `EQP-${year}-${num}`;
    const deviceId = ObjectId();
    const qrContent = `pages/loto/loto?deviceId=${deviceId}`;
    const qrBase64 = await QRCode.toDataURL(qrContent, { width: 256 });
    
    const user = mockData.users.find(u => u._id === req.user.userId);
    
    const newDevice = {
      _id: deviceId,
      deviceNo,
      deviceName,
      qrContent,
      qrBase64,
      createdBy: { _id: req.user.userId, username: user?.username || '未知' },
      createdAt: new Date()
    };
    
    mockData.devices.push(newDevice);
    res.status(201).json(newDevice);
  } catch (error) {
    res.status(500).json({ message: '添加设备失败', error: error.message });
  }
});

app.get('/api/device/list', authMiddleware, (req, res) => {
  res.json(mockData.devices);
});

app.get('/api/device/detail/:id', authMiddleware, (req, res) => {
  const device = mockData.devices.find(d => d._id === req.params.id);
  if (!device) {
    return res.status(404).json({ message: '设备不存在' });
  }
  res.json(device);
});

app.post('/api/locktag/add', authMiddleware, async (req, res) => {
  try {
    const { tagName } = req.body;
    const year = new Date().getFullYear();
    const num = (mockData.lockTags.length + 1).toString().padStart(3, '0');
    const tagNo = `TAG-${year}-${num}`;
    const tagId = ObjectId();
    const qrContent = `pages/loto/loto?tagId=${tagId}`;
    const qrBase64 = await QRCode.toDataURL(qrContent, { width: 256 });
    
    const user = mockData.users.find(u => u._id === req.user.userId);
    
    const newTag = {
      _id: tagId,
      tagNo,
      tagName,
      status: '可用',
      qrContent,
      qrBase64,
      createdBy: { _id: req.user.userId, username: user?.username || '未知' },
      createdAt: new Date()
    };
    
    mockData.lockTags.push(newTag);
    res.status(201).json(newTag);
  } catch (error) {
    res.status(500).json({ message: '添加锁牌失败', error: error.message });
  }
});

app.get('/api/locktag/list', authMiddleware, (req, res) => {
  res.json(mockData.lockTags);
});

app.get('/api/locktag/detail/:id', authMiddleware, (req, res) => {
  const tag = mockData.lockTags.find(t => t._id === req.params.id);
  if (!tag) {
    return res.status(404).json({ message: '锁牌不存在' });
  }
  res.json(tag);
});

app.put('/api/locktag/update/:id', authMiddleware, (req, res) => {
  const tag = mockData.lockTags.find(t => t._id === req.params.id);
  if (!tag) {
    return res.status(404).json({ message: '锁牌不存在' });
  }
  
  if (req.body.status) {
    tag.status = req.body.status;
  }
  
  res.json(tag);
});

app.post('/api/loto/add', authMiddleware, async (req, res) => {
  try {
    const { deviceId, lockTagId, lotoInfo } = req.body;
    const recordId = ObjectId();
    const device = mockData.devices.find(d => d._id === deviceId);
    const tag = lockTagId ? mockData.lockTags.find(t => t._id === lockTagId) : null;
    const user = mockData.users.find(u => u._id === req.user.userId);
    
    const newRecord = {
      _id: recordId,
      deviceId: device || { _id: deviceId },
      lockTagId: tag || (lockTagId ? { _id: lockTagId } : null),
      lotoInfo,
      status: '锁定',
      createdBy: { _id: req.user.userId, username: user?.username || '未知' },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    if (tag) {
      tag.status = '已锁定';
    }
    
    mockData.lotoRecords.push(newRecord);
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ message: '创建记录失败', error: error.message });
  }
});

app.get('/api/loto/list', authMiddleware, (req, res) => {
  res.json(mockData.lotoRecords);
});

app.get('/api/loto/detail/:id', authMiddleware, (req, res) => {
  const record = mockData.lotoRecords.find(r => r._id === req.params.id);
  if (!record) {
    return res.status(404).json({ message: '记录不存在' });
  }
  res.json(record);
});

app.put('/api/loto/update/:id', authMiddleware, async (req, res) => {
  const record = mockData.lotoRecords.find(r => r._id === req.params.id);
  if (!record) {
    return res.status(404).json({ message: '记录不存在' });
  }
  
  if (req.body.lotoInfo) record.lotoInfo = req.body.lotoInfo;
  if (req.body.status) {
    const oldStatus = record.status;
    record.status = req.body.status;
    
    if (oldStatus === '锁定' && req.body.status === '已解除' && record.lockTagId) {
      const tag = mockData.lockTags.find(t => t._id === (record.lockTagId._id || record.lockTagId));
      if (tag) tag.status = '可用';
    }
  }
  
  record.updatedAt = new Date();
  res.json(record);
});

app.put('/api/loto/cancel/:id', authMiddleware, async (req, res) => {
  const record = mockData.lotoRecords.find(r => r._id === req.params.id);
  if (!record) {
    return res.status(404).json({ message: '记录不存在' });
  }
  
  record.status = '已解除';
  record.updatedAt = new Date();
  
  if (record.lockTagId) {
    const tag = mockData.lockTags.find(t => t._id === (record.lockTagId._id || record.lockTagId));
    if (tag) tag.status = '可用';
  }
  
  res.json(record);
});

app.delete('/api/loto/delete/:id', authMiddleware, async (req, res) => {
  const idx = mockData.lotoRecords.findIndex(r => r._id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ message: '记录不存在' });
  }
  
  const record = mockData.lotoRecords[idx];
  if (record.status === '锁定' && record.lockTagId) {
    const tag = mockData.lockTags.find(t => t._id === (record.lockTagId._id || record.lockTagId));
    if (tag) tag.status = '可用';
  }
  
  mockData.lotoRecords.splice(idx, 1);
  res.json({ message: '删除成功' });
});

app.get('/api/export/loto', authMiddleware, async (req, res) => {
  try {
    const { Parser } = require('json2csv');
    const fields = ['记录ID', '设备', '锁牌', 'LOTO信息', '状态', '创建人', '创建时间'];
    
    const data = mockData.lotoRecords.map(r => ({
      '记录ID': r._id,
      '设备': r.deviceId?.deviceName || r.deviceId?._id || '-',
      '锁牌': r.lockTagId?.tagName || r.lockTagId?._id || '-',
      'LOTO信息': r.lotoInfo,
      '状态': r.status,
      '创建人': r.createdBy?.username || '-',
      '创建时间': new Date(r.createdAt).toLocaleString('zh-CN')
    }));
    
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=loto_records.csv');
    res.send('\uFEFF' + csv);
  } catch (error) {
    res.status(500).json({ message: '导出失败', error: error.message });
  }
});

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 LOTO QR System API 运行中!`);
    console.log(`📍 访问地址: http://localhost:${PORT}`);
    console.log(`📊 模式: ${usingMockData ? '模拟数据模式' : '真实数据库模式'}`);
    console.log(`\n📋 测试账号:`);
    console.log(`   管理员: SARL2LOTO / EHS123456`);
    console.log(`   普通用户: user1 / 123456`);
    console.log(`\n✨ 开始使用吧!\n`);
  });
});
