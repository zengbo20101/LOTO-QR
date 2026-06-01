const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: '未提供认证令牌' });
  }
  
  // 支持模拟数据模式的简单token
  if (token.startsWith('mock_token_')) {
    const userId = token.replace('mock_token_', '');
    req.user = {
      userId: userId,
      role: userId === 'admin1' ? 'admin' : 'user'
    };
    return next();
  }
  
  // 支持JWT token验证
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: '认证失败，请重新登录' });
  }
}

module.exports = authMiddleware;
