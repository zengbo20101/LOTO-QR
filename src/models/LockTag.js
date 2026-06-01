const mongoose = require('mongoose');

const lockTagSchema = new mongoose.Schema({
  tagId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['可用', '使用中', '维修中'],
    default: '可用'
  },
  description: {
    type: String
  },
  qrCodeUrl: {
    type: String
  },
  qrCodeData: {
    type: String
  },
  lastInspected: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LockTag', lockTagSchema);
