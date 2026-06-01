/**
 * 管理员权限中间件
 * 验证当前用户是否为管理员
 */
module.exports = function(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: '需要管理员权限' });
  }
  next();
};
