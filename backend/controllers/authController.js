const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * 登录接口
 * POST /api/auth/login
 * 入参：username, password
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }
    
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: '登录失败', error: error.message });
  }
};

/**
 * 注册接口
 * POST /api/auth/register
 * 前置：需要管理员权限
 * 入参：username, password, role
 */
exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }
    
    const user = new User({
      username,
      password,
      role: role || 'user'
    });
    
    await user.save();
    
    res.status(201).json({
      message: '用户创建成功',
      user: {
        _id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: '注册失败', error: error.message });
  }
};
