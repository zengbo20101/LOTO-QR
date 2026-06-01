const Device = require('../models/Device');

/**
 * 新增设备
 * POST /api/device/add
 * 前置：JWT鉴权
 * 入参：deviceName
 */
exports.addDevice = async (req, res) => {
  try {
    const { deviceName } = req.body;
    
    const deviceNo = await Device.generateDeviceNo();
    const tempDevice = new Device();
    tempDevice._id = require('mongoose').Types.ObjectId();
    
    const { qrContent, qrBase64 } = await Device.generateQR(tempDevice._id);
    
    const device = new Device({
      _id: tempDevice._id,
      deviceNo,
      deviceName,
      qrContent,
      qrBase64,
      createdBy: req.user._id
    });
    
    await device.save();
    await device.populate('createdBy', 'username');
    
    res.status(201).json(device);
  } catch (error) {
    res.status(500).json({ message: '添加设备失败', error: error.message });
  }
};

/**
 * 获取设备列表
 * GET /api/device/list
 * 前置：JWT鉴权
 */
exports.getDeviceList = async (req, res) => {
  try {
    const devices = await Device.find()
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: '获取设备列表失败', error: error.message });
  }
};

/**
 * 获取单个设备详情
 * GET /api/device/detail/:id
 * 前置：JWT鉴权
 */
exports.getDeviceDetail = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id)
      .populate('createdBy', 'username');
    
    if (!device) {
      return res.status(404).json({ message: '设备不存在' });
    }
    
    res.json(device);
  } catch (error) {
    res.status(500).json({ message: '获取设备详情失败', error: error.message });
  }
};
