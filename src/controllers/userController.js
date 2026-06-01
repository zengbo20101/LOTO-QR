const User = require('../models/User');
const mongoose = require('mongoose');

// 检查 MongoDB 是否连接成功
function isMongoConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

// 模拟用户数据（用于向后兼容）
exports.users = [
  {
    _id: '1',
    username: 'admin',
    phone: '13800138000',
    password: '123456',
    role: 'admin',
    id: '1'
  },
  {
    _id: '2',
    username: 'user1',
    phone: '13900139000',
    password: '123456',
    role: 'user',
    id: '2'
  }
];

// Get all users
exports.getUsers = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const users = await User.find();
      res.json(users);
    } else {
      res.json(exports.users);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    let user;
    if (isMongoConnected()) {
      user = await User.findById(req.params.id);
    } else {
      user = exports.users.find(u => u._id === req.params.id || u.id === req.params.id);
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create user
exports.createUser = async (req, res) => {
  try {
    let newUser;
    if (isMongoConnected()) {
      newUser = new User({
        ...req.body,
        password: req.body.password || '123456'
      });
      await newUser.save();
    } else {
      newUser = {
        ...req.body,
        _id: String(exports.users.length + 1),
        id: String(exports.users.length + 1),
        password: req.body.password || '123456'
      };
      exports.users.push(newUser);
    }
    
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    let updatedUser;
    if (isMongoConnected()) {
      updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
    } else {
      const index = exports.users.findIndex(u => u._id === req.params.id || u.id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ message: 'User not found' });
      }
      exports.users[index] = { ...exports.users[index], ...req.body };
      updatedUser = exports.users[index];
    }
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    } else {
      const index = exports.users.findIndex(u => u._id === req.params.id || u.id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ message: 'User not found' });
      }
      exports.users.splice(index, 1);
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};