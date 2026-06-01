const mongoose = require('mongoose');

const HistoryRecordSchema = new mongoose.Schema({
  model: {
    type: String,
    required: true,
    enum: ['Device', 'LotoRecord', 'User', 'Item']
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  operation: {
    type: String,
    required: true,
    enum: ['create', 'update', 'delete']
  },
  previousData: {
    type: mongoose.Schema.Types.Mixed
  },
  newData: {
    type: mongoose.Schema.Types.Mixed
  },
  changedFields: {
    type: [String]
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
});

module.exports = mongoose.model('HistoryRecord', HistoryRecordSchema);
