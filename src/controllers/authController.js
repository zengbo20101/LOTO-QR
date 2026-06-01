const auth = require('../middleware/auth');
const User = require('../models/User');
const mongoose = require('mongoose');

// 检查 MongoDB 是否连接成功
function isMongoConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

// 获取用户数据 - 根据 MongoDB 连接状态选择
async function findUser(identifier) {
  if (isMongoConnected()) {
    return await User.findOne({ $or: [{ username: identifier }, { phone: identifier }] });
  } else {
    const mockUsers = require('./userController').users;
    return mockUsers.find(u => u.username === identifier || u.phone === identifier);
  }
}

// 检查用户是否已存在
async function checkUserExists(username, phone) {
  if (isMongoConnected()) {
    return await User.findOne({ $or: [{ username }, { phone }] });
  } else {
    const mockUsers = require('./userController').users;
    return mockUsers.find(u => u.username === username || u.phone === phone);
  }
}

// 登录
exports.login = async (req, res) => {
  try {
    const { identifier } = req.body; // 标识符可以是用户名或电话
    
    // 查找用户
    let user = await findUser(identifier);
    
    // 如果没有找到
    if (!user) {
      return res.status(401).json({ message: '用户不存在' });
    }
    
    // 生成令牌
    const token = auth.generateToken(user);
    
    res.json({
      user: {
        id: user._id || user.id,
        username: user.username,
        phone: user.phone,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// 注册
exports.register = async (req, res) => {
  try {
    const { username, phone, role } = req.body;
    
    // 检查用户是否已存在
    const existingUser = await checkUserExists(username, phone);
    
    if (existingUser) {
      let errorMessage = '';
      if (existingUser.username === username && existingUser.phone === phone) {
        errorMessage = '用户名和电话已存在';
      } else if (existingUser.username === username) {
        errorMessage = '用户名已存在';
      } else {
        errorMessage = '电话已存在';
      }
      return res.status(400).json({ message: errorMessage });
    }
    
    let newUser;
    
    if (isMongoConnected()) {
      // 创建新用户到数据库
      newUser = new User({
        username,
        phone,
        password: '123456', // 默认密码
        role: role || 'user'
      });
      await newUser.save();
    } else {
      // 添加到模拟数据
      const mockUsers = require('./userController').users;
      newUser = {
        _id: String(mockUsers.length + 1),
        id: String(mockUsers.length + 1),
        username,
        phone,
        password: '123456',
        role: role || 'user'
      };
      mockUsers.push(newUser);
    }
    
    // 生成令牌
    const token = auth.generateToken(newUser);
    
    res.status(201).json({
      user: {
        id: newUser._id || newUser.id,
        username: newUser.username,
        phone: newUser.phone,
        role: newUser.role
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      // 处理重复键错误
      const key = Object.keys(error.keyPattern)[0];
      let errorMessage = '';
      if (key === 'username') {
        errorMessage = '用户名已存在';
      } else if (key === 'phone') {
        errorMessage = '电话已存在';
      } else {
        errorMessage = '账号已存在';
      }
      return res.status(400).json({ message: errorMessage });
    }
    res.status(400).json({ message: error.message });
  }
};