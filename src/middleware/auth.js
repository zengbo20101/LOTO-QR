const jwt = require('jsonwebtoken');

// 生成JWT令牌
exports.generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

// 验证JWT令牌
exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// 权限检查中间件 - 确保只有LOTO记录的创建者可以修改或删除
exports.checkLotoPermission = async (req, res, next) => {
  try {
    // 模拟LOTO记录数据（当MongoDB不可用时）
    const mockLotoRecords = [
      {
        _id: '1',
        userId: '60d5ec9f9f1b2c0015a3a7a3',
        deviceId: '1',
        startTime: new Date(),
        status: 'active',
        reason: '测试LOTO记录'
      }
    ];
    
    const lotoRecord = mockLotoRecords.find(record => record._id === req.params.id);
    
    if (!lotoRecord) {
      return res.status(404).json({ message: 'LOTO record not found' });
    }
    
    // 检查用户是否是LOTO记录的创建者
    if (lotoRecord.userId !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to modify this LOTO record' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};