const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const itemRoutes = require('./routes/itemRoutes');
const userRoutes = require('./routes/userRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const lotoRecordRoutes = require('./routes/lotoRecordRoutes');
const authRoutes = require('./routes/authRoutes');
const lockTagRoutes = require('./routes/lockTagRoutes');
const User = require('./models/User');
const Device = require('./models/Device');
const LockTag = require('./models/LockTag');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('src/public'));

// Connect to database and initialize mock data
const initializeApp = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected successfully');
    
    // 初始化模拟用户数据
    const mockUsers = [
      {
        username: 'admin',
        phone: '13800138000',
        password: '123456',
        role: 'admin'
      },
      {
        username: 'user1',
        phone: '13900139000',
        password: '123456',
        role: 'user'
      }
    ];
    
    for (const mockUser of mockUsers) {
      const existingUser = await User.findOne({
        $or: [{ username: mockUser.username }, { phone: mockUser.phone }]
      });
      if (!existingUser) {
        const user = new User(mockUser);
        await user.save();
        console.log(`Created user: ${mockUser.username}`);
      }
    }
    
    // 初始化模拟设备数据
    const mockDevices = [
      {
        deviceId: 'DEV001',
        name: '注塑机',
        location: 'A区-1号',
        status: '正常',
        description: '用于塑料制品的注塑成型',
        lastInspected: new Date('2026-04-01')
      },
      {
        deviceId: 'DEV002',
        name: '包装机',
        location: 'B区-3号',
        status: '正常',
        description: '用于产品的包装和封口',
        lastInspected: new Date('2026-04-02')
      },
      {
        deviceId: 'DEV003',
        name: '输送机',
        location: 'C区-5号',
        status: '正常',
        description: '用于物料的输送',
        lastInspected: new Date('2026-04-03')
      }
    ];
    
    for (const mockDevice of mockDevices) {
      const existingDevice = await Device.findOne({ deviceId: mockDevice.deviceId });
      if (!existingDevice) {
        const device = new Device(mockDevice);
        await device.save();
        console.log(`Created device: ${mockDevice.name}`);
      }
    }
    
    // 初始化模拟上锁牌子数据
    const mockLockTags = [
      {
        tagId: 'TAG001',
        name: '红色上锁牌',
        status: '可用',
        description: '用于电气设备的上锁挂牌',
        lastInspected: new Date('2026-04-01')
      },
      {
        tagId: 'TAG002',
        name: '蓝色上锁牌',
        status: '可用',
        description: '用于机械设备的上锁挂牌',
        lastInspected: new Date('2026-04-02')
      }
    ];
    
    for (const mockTag of mockLockTags) {
      const existingTag = await LockTag.findOne({ tagId: mockTag.tagId });
      if (!existingTag) {
        const tag = new LockTag(mockTag);
        await tag.save();
        console.log(`Created lock tag: ${mockTag.name}`);
      }
    }
  } catch (err) {
    console.log('MongoDB connection failed, continuing with server:', err.message);
  }
};

// Routes
app.use('/api/items', itemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/loto-records', lotoRecordRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/lock-tags', lockTagRoutes);

initializeApp();

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to LOTO QR API' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;