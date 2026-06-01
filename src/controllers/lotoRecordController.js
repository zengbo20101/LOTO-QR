const LotoRecord = require('../models/LotoRecord');
const mongoose = require('mongoose');
const createHistoryLogger = require('../middleware/historyLogger');
const devices = require('./deviceController').devices;
const users = require('./userController').users;

// 模拟锁标签数据
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

// 检查 MongoDB 是否连接成功
function isMongoConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

// 模拟LOTO记录数据（当MongoDB不可用时）
let mockLotoRecords = [
  {
    _id: '1',
    userId: '1',
    deviceId: '1',
    startTime: new Date('2026-04-20T10:00:00'),
    endTime: null,
    status: 'active',
    reason: '设备维护',
    operatorName: 'admin',
    operatorPhone: '13800138000',
    notes: '定期维护',
    createdAt: new Date('2026-04-20T10:00:00'),
    updatedAt: new Date('2026-04-20T10:00:00')
  },
  {
    _id: '2',
    userId: '2',
    deviceId: '2',
    startTime: new Date('2026-04-19T14:00:00'),
    endTime: new Date('2026-04-19T16:00:00'),
    status: 'completed',
    reason: '设备维修',
    operatorName: 'user1',
    operatorPhone: '13900139000',
    notes: '更换零部件',
    createdAt: new Date('2026-04-19T14:00:00'),
    updatedAt: new Date('2026-04-19T16:00:00')
  }
];

// 创建历史记录中间件实例
const lotoRecordHistoryLogger = createHistoryLogger('LotoRecord');

// 应用用户上下文中间件
exports.applyUserContext = (req, res, next) => {
  // 模拟模型对象
  req.model = {
    find: async () => {
      // 模拟populate
      return mockLotoRecords.map(record => ({
        ...record,
        userId: users.find(u => u._id === record.userId),
        deviceId: devices.find(d => d._id === record.deviceId)
      }));
    },
    findById: async (id) => {
      const record = mockLotoRecords.find(r => r._id === id);
      if (record) {
        // 应用用户上下文
        if (req.userContext) {
          record._userContext = req.userContext;
        }
        // 模拟populate
        return {
          ...record,
          userId: users.find(u => u._id === record.userId),
          deviceId: devices.find(d => d._id === record.deviceId)
        };
      }
      return null;
    },
    findByIdAndUpdate: async (id, update, options) => {
      const index = mockLotoRecords.findIndex(r => r._id === id);
      if (index === -1) return null;
      
      // 应用更新
      mockLotoRecords[index] = {
        ...mockLotoRecords[index],
        ...update,
        updatedAt: new Date()
      };
      
      // 模拟populate
      const updatedRecord = {
        ...mockLotoRecords[index],
        userId: users.find(u => u._id === mockLotoRecords[index].userId),
        deviceId: devices.find(d => d._id === mockLotoRecords[index].deviceId)
      };
      
      return updatedRecord;
    },
    findByIdAndDelete: async (id) => {
      const index = mockLotoRecords.findIndex(r => r._id === id);
      if (index === -1) return null;
      
      const deletedRecord = mockLotoRecords[index];
      mockLotoRecords.splice(index, 1);
      
      return deletedRecord;
    }
  };
  
  lotoRecordHistoryLogger.applyUserContext(req, res, next);
};

// Get all LOTO records
exports.getLotoRecords = async (req, res) => {
  try {
    const { lockTagId } = req.query;
    let query = {};
    
    // 如果提供了 lockTagId，则只查询关联该上锁牌子的记录
    if (lockTagId) {
      query.lockTagId = lockTagId;
    }
    
    if (isMongoConnected()) {
      const lotoRecords = await LotoRecord.find(query)
        .populate('userId', 'username phone role')
        .populate('deviceId')
        .populate('lockTagId');
      res.json(lotoRecords);
    } else {
      // 模拟查询
      let lotoRecords = mockLotoRecords;
      if (lockTagId) {
        lotoRecords = lotoRecords.filter(r => r.lockTagId === lockTagId);
      }
      // 模拟populate
      lotoRecords = lotoRecords.map(record => ({
        ...record,
        userId: users.find(u => u._id === record.userId),
        deviceId: devices.find(d => d._id === record.deviceId),
        lockTagId: mockLockTags.find(t => t._id === record.lockTagId)
      }));
      res.json(lotoRecords);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get LOTO records by lock tag
exports.getLotoRecordsByLockTag = async (req, res) => {
  try {
    const { lockTagId } = req.params;
    
    if (isMongoConnected()) {
      const lotoRecords = await LotoRecord.find({ lockTagId })
        .populate('userId', 'username phone role')
        .populate('deviceId')
        .populate('lockTagId');
      res.json(lotoRecords);
    } else {
      // 模拟查询
      const lotoRecords = mockLotoRecords
        .filter(r => r.lockTagId === lockTagId)
        .map(record => ({
          ...record,
          userId: users.find(u => u._id === record.userId),
          deviceId: devices.find(d => d._id === record.deviceId),
          lockTagId: mockLockTags.find(t => t._id === record.lockTagId)
        }));
      res.json(lotoRecords);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get LOTO record by ID
exports.getLotoRecordById = async (req, res) => {
  try {
    let lotoRecord;
    if (isMongoConnected()) {
      lotoRecord = await LotoRecord.findById(req.params.id)
        .populate('userId', 'username phone role')
        .populate('deviceId')
        .populate('lockTagId');
    } else {
      lotoRecord = mockLotoRecords.find(r => r._id === req.params.id);
      if (lotoRecord) {
        // 模拟populate
        lotoRecord = {
          ...lotoRecord,
          userId: users.find(u => u._id === lotoRecord.userId),
          deviceId: devices.find(d => d._id === lotoRecord.deviceId),
          lockTagId: mockLockTags.find(t => t._id === lotoRecord.lockTagId)
        };
      }
    }
    
    if (!lotoRecord) {
      return res.status(404).json({ message: 'LOTO record not found' });
    }
    
    res.json(lotoRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get LOTO record history
exports.getLotoRecordHistory = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const HistoryRecord = require('../models/HistoryRecord');
      const historyRecords = await HistoryRecord.find({ 
        model: 'LotoRecord', 
        documentId: req.params.id 
      }).sort({ timestamp: -1 });
      res.json(historyRecords);
    } else {
      // 模拟历史记录
      const historyRecords = [
        {
          _id: '1',
          model: 'LotoRecord',
          documentId: req.params.id,
          operation: 'create',
          previousData: null,
          newData: mockLotoRecords.find(r => r._id === req.params.id),
          changedFields: [],
          userId: '60d5ec9f9f1b2c0015a3a7a3',
          timestamp: new Date(),
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0'
        }
      ];
      res.json(historyRecords);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create LOTO record
exports.createLotoRecord = async (req, res) => {
  try {
    let newRecord;
    if (isMongoConnected()) {
      // 从请求中获取操作员信息
      const { operatorName, operatorPhone, ...rest } = req.body;
      newRecord = new LotoRecord({
        ...rest,
        operatorName,
        operatorPhone
      });
      await newRecord.save();
      // Populate 关联数据
      await newRecord.populate('userId', 'username phone role');
      await newRecord.populate('deviceId');
      await newRecord.populate('lockTagId');
    } else {
      newRecord = {
        _id: `${mockLotoRecords.length + 1}`,
        ...req.body,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockLotoRecords.push(newRecord);
      // 模拟populate
      newRecord = {
        ...newRecord,
        userId: users.find(u => u._id === newRecord.userId),
        deviceId: devices.find(d => d._id === newRecord.deviceId),
        lockTagId: mockLockTags.find(t => t._id === newRecord.lockTagId)
      };
    }
    
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update LOTO record
exports.updateLotoRecord = async (req, res) => {
  try {
    let updatedRecord;
    if (isMongoConnected()) {
      updatedRecord = await LotoRecord.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('userId', 'username phone role').populate('deviceId').populate('lockTagId');
    } else {
      const index = mockLotoRecords.findIndex(r => r._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ message: 'LOTO record not found' });
      }
      
      // 应用更新
      mockLotoRecords[index] = {
        ...mockLotoRecords[index],
        ...req.body,
        updatedAt: new Date()
      };
      
      // 模拟populate
      updatedRecord = {
        ...mockLotoRecords[index],
        userId: users.find(u => u._id === mockLotoRecords[index].userId),
        deviceId: devices.find(d => d._id === mockLotoRecords[index].deviceId),
        lockTagId: mockLockTags.find(t => t._id === mockLotoRecords[index].lockTagId)
      };
    }
    
    if (!updatedRecord) {
      return res.status(404).json({ message: 'LOTO record not found' });
    }
    
    res.json(updatedRecord);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete LOTO record
exports.deleteLotoRecord = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const record = await LotoRecord.findByIdAndDelete(req.params.id);
      if (!record) {
        return res.status(404).json({ message: 'LOTO record not found' });
      }
    } else {
      const index = mockLotoRecords.findIndex(r => r._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ message: 'LOTO record not found' });
      }
      mockLotoRecords.splice(index, 1);
    }
    
    res.json({ message: 'LOTO record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};