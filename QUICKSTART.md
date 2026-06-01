# LOTO QR 快速启动指南

## 项目概述

这是一个完整的微信小程序+后端API系统，用于管理LOTO（挂牌上锁）流程，包含设备管理、锁牌管理、LOTO记录和二维码扫描功能。

## 目录结构

```
LOTO_QR/
├── backend/              # 后端服务（Node.js + Express）
│   ├── models/          # 数据模型
│   ├── controllers/      # 控制器
│   ├── middleware/       # 中间件
│   ├── routes/          # 路由
│   ├── index.js         # 服务入口
│   ├── package.json     # 依赖配置
│   └── .env            # 环境变量
│
├── miniprogram/         # 微信小程序
│   ├── pages/          # 页面
│   ├── utils/          # 工具函数
│   ├── app.js
│   ├── app.json
│   └── sitemap.json
│
└── README.md           # 完整文档
```

## 快速启动（5分钟）

### 1. 启动后端服务

```bash
cd backend
npm install
npm start
```

服务将在 http://localhost:3000 启动。

### 2. 配置小程序API地址

编辑 `miniprogram/app.js`，修改API地址：

```javascript
globalData: {
  apiBase: 'http://localhost:3000/api'  // 改成你的服务器地址
}
```

### 3. 使用微信开发者工具

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开微信开发者工具
3. 选择"导入项目"
4. 选择 `miniprogram` 目录
5. 填写项目名称和AppID（测试阶段可选择"测试号"）
6. 点击"导入"

### 4. 测试默认账号

系统已预置测试账号：

- **管理员账号**: SARL2LOTO / EHS123456
- **普通用户**: user1 / 123456（模拟数据模式）

## 核心功能使用

### 管理员操作流程

1. 登录 → 使用管理员账号登录
2. 创建用户 → 为团队成员创建账号
3. 添加设备 → 输入设备信息，自动生成二维码
4. 添加锁牌 → 创建物理锁牌记录
5. 打印二维码 → 将二维码贴在对应设备和锁牌上

### 普通用户操作流程

#### 上锁流程
1. 使用微信扫码 → 扫设备或锁牌二维码
2. 自动跳转 → 小程序自动打开对应设备页面
3. 创建记录 → 选择锁牌，填写LOTO信息
4. 确认锁定 → 提交后锁牌状态变为"已锁定"

#### 解锁流程
1. 扫码查看 → 扫码查看当前锁定状态
2. 确认权限 → 只有记录创建者可以解锁
3. 解除锁定 → 点击"解除锁定"，锁牌恢复"可用"状态

## API测试示例

使用curl或Postman测试API：

### 登录
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"SARL2LOTO\",\"password\":\"EHS123456\"}"
```

### 获取设备列表（需Token）
```bash
curl -X GET http://localhost:3000/api/device/list \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 添加设备
```bash
curl -X POST http://localhost:3000/api/device/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "{\"deviceName\":\"测试设备\"}"
```

## 模拟数据模式

如果没有MongoDB数据库，系统会自动使用模拟数据模式：

1. 内存存储，数据在服务重启后重置
2. 预加载测试数据，方便快速验证功能
3. 适合开发和演示场景

## 生产部署建议

1. 配置真实MongoDB数据库
2. 修改JWT_SECRET为强密码
3. 使用HTTPS协议
4. 配置CORS域名白名单
5. 定期备份数据

## 故障排查

### 小程序无法连接后端
- 检查后端服务是否正常启动
- 确认小程序API地址配置正确
- 微信开发者工具勾选"不校验合法域名"

### 登录失败
- 确认使用正确的测试账号
- 检查后端服务是否正常运行
- 查看后端控制台错误信息

### 二维码无法扫码跳转
- 确保在微信环境中扫码
- 确认小程序已正确配置
- 测试号可能有限制功能

## 技术支持

如有问题，请检查：
1. 后端控制台日志
2. 微信开发者工具控制台
3. 网络请求是否正常

---

现在开始使用吧！先启动后端服务，然后在微信开发者工具中导入小程序。
