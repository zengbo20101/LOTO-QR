const mongoose = require('mongoose');

/**
 * LOTO记录表模型
 * 字段说明：
 * - deviceId：关联设备ID
 * - lockTagId：关联锁牌ID
 * - lotoInfo：LOTO详情内容
 * - status：状态（锁定 / 已解除）
 * - createdBy：创建人ID
 * - createdAt：创建时间
 * - updatedAt：更新时间
 */
const LotoRecordSchema = new mongoose.Schema({
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  lockTagId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LockTag',
    required: false
  },
  lotoInfo: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['锁定', '已解除'],
    default: '锁定'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新时间中间件
LotoRecordSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('LotoRecord', LotoRecordSchema);
