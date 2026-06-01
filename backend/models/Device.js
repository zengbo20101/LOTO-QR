const mongoose = require('mongoose');
const QRCode = require('qrcode');

/**
 * 设备表模型
 * 字段说明：
 * - deviceNo：设备编号（自动生成）
 * - deviceName：设备名称
 * - qrContent：二维码原始内容
 * - qrBase64：二维码Base64图片
 * - createdBy：创建人ID
 * - createdAt：创建时间
 */
const DeviceSchema = new mongoose.Schema({
  deviceNo: {
    type: String,
    required: true,
    unique: true
  },
  deviceName: {
    type: String,
    required: true,
    trim: true
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

// 生成设备编号的方法
DeviceSchema.statics.generateDeviceNo = async function() {
  const year = new Date().getFullYear();
  const prefix = `EQP-${year}-`;
  
  const lastDevice = await this.findOne({ deviceNo: new RegExp('^' + prefix) })
    .sort({ deviceNo: -1 });
  
  let sequence = 1;
  if (lastDevice) {
    const noMatch = lastDevice.deviceNo.match(/-(\d+)$/);
    if (noMatch) {
      sequence = parseInt(noMatch[1]) + 1;
    }
  }
  
  return `${prefix}${String(sequence).padStart(3, '0')}`;
};

// 生成二维码的方法
DeviceSchema.statics.generateQR = async function(deviceId) {
  const qrContent = `pages/loto/loto?deviceId=${deviceId}`;
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

module.exports = mongoose.model('Device', DeviceSchema);
