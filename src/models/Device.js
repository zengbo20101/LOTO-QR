const mongoose = require('mongoose');
const createHistoryLogger = require('../middleware/historyLogger');

const DeviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  deviceId: {
    type: String,
    required: true,
    unique: true,
  },
  location: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'locked'],
    default: 'active',
  },
  description: {
    type: String,
  },
  lastInspected: {
    type: Date,
  },
  qrCodeData: {
    type: String,
  },
  qrCodeUrl: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// 创建历史记录中间件
const deviceHistoryLogger = createHistoryLogger('Device');

// 应用历史记录中间件
DeviceSchema.pre('save', deviceHistoryLogger.preSave);
DeviceSchema.post('save', deviceHistoryLogger.postSave);
DeviceSchema.pre('remove', deviceHistoryLogger.preRemove);

DeviceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Device', DeviceSchema);