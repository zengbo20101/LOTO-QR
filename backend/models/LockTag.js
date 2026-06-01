const mongoose = require('mongoose');
const QRCode = require('qrcode');

/**
 * 锁牌表模型
 * 字段说明：
 * - tagNo：锁牌编号（自动生成）
 * - tagName：锁牌名称
 * - status：状态（可用 / 已锁定）
 * - qrContent：二维码原始内容
 * - qrBase64：二维码Base64图片
 * - createdBy：创建人ID
 * - createdAt：创建时间
 */
const LockTagSchema = new mongoose.Schema({
  tagNo: {
    type: String,
    required: true,
    unique: true
  },
  tagName: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['可用', '已锁定'],
    default: '可用'
  },
  qrContent: {
    type: String,
    required: true
  },
  qrBase64: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 生成锁牌编号的方法
LockTagSchema.statics.generateTagNo = async function() {
  const year = new Date().getFullYear();
  const prefix = `TAG-${year}-`;
  
  const lastTag = await this.findOne({ tagNo: new RegExp('^' + prefix) })
    .sort({ tagNo: -1 });
  
  let sequence = 1;
  if (lastTag) {
    const noMatch = lastTag.tagNo.match(/-(\d+)$/);
    if (noMatch) {
      sequence = parseInt(noMatch[1]) + 1;
    }
  }
  
  return `${prefix}${String(sequence).padStart(3, '0')}`;
};

// 生成二维码的方法
LockTagSchema.statics.generateQR = async function(tagId) {
  const qrContent = `pages/loto/loto?tagId=${tagId}`;
  const qrBase64 = await QRCode.toDataURL(qrContent, {
    width: 256,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });
  return { qrContent, qrBase64 };
};

module.exports = mongoose.model('LockTag', LockTagSchema);
