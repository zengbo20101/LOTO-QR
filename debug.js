console.log('=== 调试导入模块 ===');
const authController = require('./src/controllers/authController');
console.log('authController:', authController);
console.log('authController.register type:', typeof authController.register);
console.log('authController.login type:', typeof authController.login);
console.log('\n=== 检查 User 模型 ===');
const User = require('./src/models/User');
console.log('User model:', User);
console.log('User schema:', User.schema);
