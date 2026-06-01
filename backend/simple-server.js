require('dotenv').config();
const express = require('express');
const QRCode = require('qrcode');
const json2csv = require('json2csv');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(require('cors')());

const mockUsers = [
  { _id: 'admin1', username: 'SARL2LOTO', password: 'EHS123456', role: 'admin' },
  { _id: 'user1', username: 'user1', password: '123456', role: 'user' }
];

let mockDevices = [];
let mockLockTags = [];
let mockLotoRecords = [];

const ObjectId = () => 'mock_' + Math.random().toString(36).substr(2, 9);

async function initMockData() {
  const deviceId1 = 'device1';
  const deviceId2 = 'device2';
  const tagId1 = 'tag1';
  const tagId2 = 'tag2';
  
  mockDevices = [
    {
      _id: deviceId1,
      deviceNo: 'EQP-2026-001',
      deviceName: '冲压车间1号机床',
      qrContent: 'pages/loto/loto?deviceId=' + deviceId1,
      qrBase64: await QRCode.toDataURL('pages/loto/loto?deviceId=' + deviceId1, { width: 256 }),
      createdBy: { _id: 'admin1', username: 'SARL2LOTO' },
      createdAt: new Date()
    },
    {
      _id: deviceId2,
      deviceNo: 'EQP-2026-002',
      deviceName: '焊接机器人',
      qrContent: 'pages/loto/loto?deviceId=' + deviceId2,
      qrBase64: await QRCode.toDataURL('pages/loto/loto?deviceId=' + deviceId2, { width: 256 }),
      createdBy: { _id: 'admin1', username: 'SARL2LOTO' },
      createdAt: new Date()
    }
  ];

  mockLockTags = [
    {
      _id: tagId1,
      tagNo: 'TAG-2026-001',
      tagName: '红色安全锁A',
      status: '可用',
      qrContent: 'pages/loto/loto?tagId=' + tagId1,
      qrBase64: await QRCode.toDataURL('pages/loto/loto?tagId=' + tagId1, { width: 256 }),
      createdBy: { _id: 'admin1', username: 'SARL2LOTO' },
      createdAt: new Date()
    },
    {
      _id: tagId2,
      tagNo: 'TAG-2026-002',
      tagName: '蓝色安全锁B',
      status: '可用',
      qrContent: 'pages/loto/loto?tagId=' + tagId2,
      qrBase64: await QRCode.toDataURL('pages/loto/loto?tagId=' + tagId2, { width: 256 }),
      createdBy: { _id: 'admin1', username: 'SARL2LOTO' },
      createdAt: new Date()
    }
  ];
}

app.get('/', (req, res) => {
  res.json({
    message: '🎉 LOTO QR System API 运行成功!',
    mode: '模拟数据模式'
  });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = mockUsers.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: '用户名或密码错误' });
  }
  res.json({
    token: 'mock_token_' + user._id,
    user: { _id: user._id, username: user.username, role: user.role }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { username, password, role } = req.body;
  const existingUser = mockUsers.find(u => u.username === username);
  if (existingUser) {
    return res.status(400).json({ message: '用户名已存在' });
  }
  const newUser = {
    _id: ObjectId(),
    username,
    password,
    role: role || 'user'
  };
  mockUsers.push(newUser);
  res.status(201).json({ message: '用户创建成功', user: { _id: newUser._id, username: newUser.username, role: newUser.role } });
});

app.post('/api/device/add', async (req, res) => {
  const { deviceName } = req.body;
  const year = new Date().getFullYear();
  const num = String(mockDevices.length + 1).padStart(3, '0');
  const deviceNo = 'EQP-' + year + '-' + num;
  const deviceId = ObjectId();
  const qrContent = 'pages/loto/loto?deviceId=' + deviceId;
  const qrBase64 = await QRCode.toDataURL(qrContent, { width: 256 });

  const newDevice = {
    _id: deviceId,
    deviceNo,
    deviceName,
    qrContent,
    qrBase64,
    createdBy: { _id: 'admin1', username: 'SARL2LOTO' },
    createdAt: new Date()
  };
  mockDevices.push(newDevice);
  res.status(201).json(newDevice);
});

app.get('/api/device/list', (req, res) => res.json(mockDevices));
app.get('/api/device/detail/:id', (req, res) => {
  const device = mockDevices.find(d => d._id === req.params.id);
  if (!device) return res.status(404).json({ message: '设备不存在' });
  res.json(device);
});

app.post('/api/locktag/add', async (req, res) => {
  const { tagName } = req.body;
  const year = new Date().getFullYear();
  const num = String(mockLockTags.length + 1).padStart(3, '0');
  const tagNo = 'TAG-' + year + '-' + num;
  const tagId = ObjectId();
  const qrContent = 'pages/loto/loto?tagId=' + tagId;
  const qrBase64 = await QRCode.toDataURL(qrContent, { width: 256 });

  const newTag = {
    _id: tagId,
    tagNo,
    tagName,
    status: '可用',
    qrContent,
    qrBase64,
    createdBy: { _id: 'admin1', username: 'SARL2LOTO' },
    createdAt: new Date()
  };
  mockLockTags.push(newTag);
  res.status(201).json(newTag);
});

app.get('/api/locktag/list', (req, res) => res.json(mockLockTags));
app.get('/api/locktag/detail/:id', (req, res) => {
  const tag = mockLockTags.find(t => t._id === req.params.id);
  if (!tag) return res.status(404).json({ message: '锁牌不存在' });
  res.json(tag);
});

app.put('/api/locktag/update/:id', (req, res) => {
  const tag = mockLockTags.find(t => t._id === req.params.id);
  if (!tag) return res.status(404).json({ message: '锁牌不存在' });
  if (req.body.status) tag.status = req.body.status;
  res.json(tag);
});

app.post('/api/loto/add', (req, res) => {
  const { deviceId, lockTagId, lotoInfo } = req.body;
  const recordId = ObjectId();
  const device = mockDevices.find(d => d._id === deviceId);
  const tag = lockTagId ? mockLockTags.find(t => t._id === lockTagId) : null;

  const newRecord = {
    _id: recordId,
    deviceId: device || { _id: deviceId },
    lockTagId: tag || (lockTagId ? { _id: lockTagId } : null),
    lotoInfo,
    status: '锁定',
    createdBy: { _id: 'admin1', username: 'SARL2LOTO' },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  if (tag) tag.status = '已锁定';

  mockLotoRecords.push(newRecord);
  res.status(201).json(newRecord);
});

app.get('/api/loto/list', (req, res) => res.json(mockLotoRecords));
app.get('/api/loto/detail/:id', (req, res) => {
  const record = mockLotoRecords.find(r => r._id === req.params.id);
  if (!record) return res.status(404).json({ message: '记录不存在' });
  res.json(record);
});

app.put('/api/loto/update/:id', (req, res) => {
  const record = mockLotoRecords.find(r => r._id === req.params.id);
  if (!record) return res.status(404).json({ message: '记录不存在' });
  if (req.body.lotoInfo) record.lotoInfo = req.body.lotoInfo;
  if (req.body.status) {
    const oldStatus = record.status;
    record.status = req.body.status;
    if (oldStatus === '锁定' && req.body.status === '已解除' && record.lockTagId) {
      const tag = mockLockTags.find(t => t._id === (record.lockTagId._id || record.lockTagId));
      if (tag) tag.status = '可用';
    }
  }
  record.updatedAt = new Date();
  res.json(record);
});

app.put('/api/loto/cancel/:id', (req, res) => {
  const record = mockLotoRecords.find(r => r._id === req.params.id);
  if (!record) return res.status(404).json({ message: '记录不存在' });
  record.status = '已解除';
  record.updatedAt = new Date();
  if (record.lockTagId) {
    const tag = mockLockTags.find(t => t._id === (record.lockTagId._id || record.lockTagId));
    if (tag) tag.status = '可用';
  }
  res.json(record);
});

app.delete('/api/loto/delete/:id', (req, res) => {
  const idx = mockLotoRecords.findIndex(r => r._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: '记录不存在' });
  const record = mockLotoRecords[idx];
  if (record.status === '锁定' && record.lockTagId) {
    const tag = mockLockTags.find(t => t._id === (record.lockTagId._id || record.lockTagId));
    if (tag) tag.status = '可用';
  }
  mockLotoRecords.splice(idx, 1);
  res.json({ message: '删除成功' });
});

app.get('/api/export/loto', (req, res) => {
  const Parser = json2csv.Parser;
  const fields = ['记录ID', '设备', '锁牌', 'LOTO信息', '状态', '创建人', '创建时间'];
  const data = mockLotoRecords.map(r => ({
    '记录ID': r._id,
    '设备': r.deviceId?.deviceName || r.deviceId?._id || '-',
    '锁牌': r.lockTagId?.tagName || r.lockTagId?._id || '-',
    'LOTO信息': r.lotoInfo,
    '状态': r.status,
    '创建人': r.createdBy?.username || '-',
    '创建时间': new Date(r.createdAt).toLocaleString('zh-CN')
  }));
  const parser = new Parser({ fields });
  const csv = parser.parse(data);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename=loto_records.csv');
  res.send('\uFEFF' + csv);
});

initMockData().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('\n🚀 LOTO QR System API 运行中!');
    console.log('📍 访问地址: http://localhost:' + PORT);
    console.log('🌐 局域网访问: http://0.0.0.0:' + PORT);
    console.log('\n📋 测试账号:');
    console.log('   管理员: SARL2LOTO / EHS123456');
    console.log('   普通用户: user1 / 123456');
    console.log('\n✨ 后端已启动!');
  });
});
