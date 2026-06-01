const mongoose = require('mongoose');
const createHistoryLogger = require('../middleware/historyLogger');

const LotoRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true,
  },
  lockTagId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LockTag',
    required: false,
  },
  operatorName: {
    type: String,
    required: true,
  },
  operatorPhone: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active',
  },
  reason: {
    type: String,
    required: true,
  },
  notes: {
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
const lotoRecordHistoryLogger = createHistoryLogger('LotoRecord');

// 应用历史记录中间件
LotoRecordSchema.pre('save', lotoRecordHistoryLogger.preSave);
LotoRecordSchema.post('save', lotoRecordHistoryLogger.postSave);
LotoRecordSchema.pre('remove', lotoRecordHistoryLogger.preRemove);

LotoRecordSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('LotoRecord', LotoRecordSchema);