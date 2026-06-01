# LOTO QR 系统部署指南

## 项目准备

### 环境配置
- 确保项目已初始化 git 仓库
- 确保 `package.json` 中有正确的依赖和脚本
- 确保 `vercel.json` 配置文件存在
- 确保 `.gitignore` 文件正确配置

### 依赖检查
- Node.js 环境
- 所有依赖已安装：`npm install`

## 部署到 Vercel

### 步骤 1：登录 Vercel
1. 访问 https://vercel.com
2. 使用 GitHub、GitLab 或 Bitbucket 账号登录

### 步骤 2：导入项目
1. 点击 "New Project"
2. 选择 "Import Git Repository"
3. 粘贴项目的 Git 仓库 URL
4. 点击 "Continue"

### 步骤 3：配置项目
1. 项目名称：loto-qr-system
2. 框架预设：Other
3. 根目录：/（保持默认）
4. 构建命令：`npm run build`
5. 输出目录：无需填写（Node.js 应用）
6. 开发命令：`npm run dev`

### 步骤 4：设置环境变量
在 Vercel 项目设置中添加以下环境变量：

| 变量名 | 值 |
|-------|-----|
| MONGO_URI | 你的 MongoDB 连接字符串（生产环境） |
| PORT | 3000 |
| NODE_ENV | production |

### 步骤 5：部署
1. 点击 "Deploy"
2. 等待部署完成
3. 部署成功后，Vercel 会提供一个公网访问 URL

## 上线前检查

### 功能检查
- [ ] API 根路径可访问：`GET /`
- [ ] 所有路由正常响应
- [ ] 数据库连接正常（或使用模拟数据）
- [ ] CORS 配置正确

### 性能检查
- [ ] 响应时间合理
- [ ] 资源使用正常

### 安全检查
- [ ] 环境变量配置正确
- [ ] 敏感信息未暴露

## 公网访问验证

1. 访问 Vercel 提供的部署 URL
2. 测试 API 端点：
   - `GET /` - 应返回欢迎信息
   - `GET /api/items` - 应返回物品列表
   - `GET /api/devices` - 应返回设备列表

## 故障排查

### 常见问题
1. **数据库连接失败**：检查 MONGO_URI 环境变量
2. **端口冲突**：确保 PORT 环境变量设置正确
3. **构建失败**：检查依赖安装和构建脚本

### 日志查看
- Vercel 控制台提供实时日志
- 可通过 Vercel CLI 查看详细日志

## 后续维护

- 定期更新依赖
- 监控系统性能
- 备份数据库

---

部署完成后，系统将通过公网 URL 提供服务，可用于生产环境。