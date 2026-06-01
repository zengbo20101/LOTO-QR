const Device = require('../models/Device');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// 检查 MongoDB 是否连接成功
function isMongoConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

// 模拟设备数据
let devices = [
  {
    _id: '1',
    deviceId: 'DEV001',
    name: '注塑机',
    location: 'A区-1号',
    status: 'active',
    description: '用于塑料制品的注塑成型',
    lastInspected: new Date('2026-04-01').toISOString(),
    qrCodeUrl: '/qr-codes/DEV001.png'
  },
  {
    _id: '2',
    deviceId: 'DEV002',
    name: '包装机',
    location: 'B区-3号',
    status: 'active',
    description: '用于产品的包装和封口',
    lastInspected: new Date('2026-04-02').toISOString(),
    qrCodeUrl: '/qr-codes/DEV002.png'
  },
  {
    _id: '3',
    deviceId: 'DEV003',
    name: '输送机',
    location: 'C区-5号',
    status: 'active',
    description: '用于物料的输送',
    lastInspected: new Date('2026-04-03').toISOString(),
    qrCodeUrl: '/qr-codes/DEV003.png'
  }
];

// Generate QR code for device
const generateQRCodeForDevice = async (device) => {
  try {
    // Create qr-codes directory if it doesn't exist
    const qrCodeDir = path.join(__dirname, '..', 'public', 'qr-codes');
    if (!fs.existsSync(qrCodeDir)) {
      fs.mkdirSync(qrCodeDir, { recursive: true });
    }
    
    // Generate QR code data (device ID and name) - 生成包含设备ID的URL
    const qrCodeData = `http://localhost:3000/?deviceId=${device._id}`;
    
    // Generate QR code image
    const qrCodePath = path.join(qrCodeDir, `${device.deviceId}.png`);
    await QRCode.toFile(qrCodePath, qrCodeData, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // Update device with QR code information
    device.qrCodeData = qrCodeData;
    device.qrCodeUrl = `/qr-codes/${device.deviceId}.png`;
    
    return device;
  } catch (error) {
    console.error('Error generating QR code:', error);
    // 即使生成二维码失败，也返回设备信息
    device.qrCodeUrl = '/qr-codes/placeholder.png';
    return device;
  }
};

// Get all devices
exports.getDevices = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const dbDevices = await Device.find();
      res.json(dbDevices);
    } else {
      res.json(devices);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get device by ID
exports.getDeviceById = async (req, res) => {
  try {
    let device;
    if (isMongoConnected()) {
      device = await Device.findById(req.params.id);
    } else {
      device = devices.find(d => d._id === req.params.id);
    }
    
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    res.json(device);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create device
exports.createDevice = async (req, res) => {
  try {
    let newDevice;
    if (isMongoConnected()) {
      newDevice = new Device(req.body);
      await newDevice.save();
      // Generate QR code for the new device
      await generateQRCodeForDevice(newDevice);
      await newDevice.save();
    } else {
      newDevice = {
        ...req.body,
        _id: (devices.length + 1).toString(),
        lastInspected: new Date().toISOString()
      };
      // Generate QR code for the new device
      const deviceWithQR = await generateQRCodeForDevice(newDevice);
      devices.push(deviceWithQR);
      newDevice = deviceWithQR;
    }
    
    res.status(201).json(newDevice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update device
exports.updateDevice = async (req, res) => {
  try {
    let updatedDevice;
    if (isMongoConnected()) {
      updatedDevice = await Device.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      
      if (updatedDevice && (req.body.deviceId || req.body.name || req.body.location)) {
        await generateQRCodeForDevice(updatedDevice);
        await updatedDevice.save();
      }
    } else {
      const index = devices.findIndex(d => d._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ message: 'Device not found' });
      }
      
      // Update device fields
      devices[index] = { ...devices[index], ...req.body };
      
      // Regenerate QR code if device ID or name changed
      if (req.body.deviceId || req.body.name || req.body.location) {
        devices[index] = await generateQRCodeForDevice(devices[index]);
      }
      
      updatedDevice = devices[index];
    }
    
    if (!updatedDevice) {
      return res.status(404).json({ message: 'Device not found' });
    }
    
    res.json(updatedDevice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Generate QR code for existing device
exports.generateQRCode = async (req, res) => {
  try {
    let device;
    if (isMongoConnected()) {
      device = await Device.findById(req.params.id);
    } else {
      const index = devices.findIndex(d => d._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ message: 'Device not found' });
      }
      device = devices[index];
    }
    
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    
    const deviceWithQR = await generateQRCodeForDevice(device);
    
    if (isMongoConnected()) {
      await deviceWithQR.save();
    } else {
      const index = devices.findIndex(d => d._id === req.params.id);
      devices[index] = deviceWithQR;
    }
    
    res.json(deviceWithQR);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Download QR code
exports.downloadQRCode = async (req, res) => {
  try {
    let device;
    if (isMongoConnected()) {
      device = await Device.findById(req.params.id);
    } else {
      device = devices.find(d => d._id === req.params.id);
    }
    
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    
    if (!device.qrCodeUrl) {
      return res.status(404).json({ message: 'QR code not generated for this device' });
    }
    
    const qrCodePath = path.join(__dirname, '..', 'public', device.qrCodeUrl);
    if (!fs.existsSync(qrCodePath)) {
      return res.status(404).json({ message: 'QR code file not found' });
    }
    
    res.download(qrCodePath, `${device.deviceId}_qrcode.png`);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete device
exports.deleteDevice = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const device = await Device.findByIdAndDelete(req.params.id);
      if (!device) {
        return res.status(404).json({ message: 'Device not found' });
      }
    } else {
      const index = devices.findIndex(d => d._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ message: 'Device not found' });
      }
      devices.splice(index, 1);
    }
    
    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 导出设备数组供其他模块使用
exports.devices = devices;