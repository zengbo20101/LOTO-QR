# LOTO QR 挂牌上锁管理系统

基于微信小程序的现代化LOTO（挂牌上锁）管理系统，支持设备管理、锁牌管理、二维码扫描、LOTO记录全流程管理。

## 功能特性

### 🔐 核心功能
- **用户认证**：JWT令牌认证，管理员可注册新用户
- **设备管理**：创建设备、自动生成编号和二维码
- **锁牌管理**：管理物理锁牌、支持状态追踪
- **LOTO记录**：完整的上锁/解锁流程管理
- **扫码功能**：微信扫码直接跳转对应设备/锁牌
- **数据导出**：支持导出LOTO记录为CSV格式

### 📱 小程序页面
1. **登录页** - 用户登录界面
2. **首页** - 数据概览和快捷操作
3. **设备管理** - 设备列表、新增、二维码管理
4. **锁牌管理** - 锁牌列表、新增、状态更新
5. **LOTO记录** - 记录查询、新增、编辑、解除
6. **数据导出** - CSV文件导出

## 项目结构

```
LOTO_QR/
├── backend/                    # 后端服务（Node.js + Express）
│   ├── models/                 # 数据模型
│   │   ├── User.js            # 用户模型
│   │   ├── Device.js          # 设备模型
│   │   ├── LockTag.js         # 锁牌模型
│   │   └── LotoRecord.js      # LOTO记录模型
│   ├── controllers/            # 控制器
│   │   ├── authController.js
│   │   ├── deviceController.js
│   │   ├── locktagController.js
│   │   ├── lotoController.js
│   │   └── exportController.js
│   ├── middleware/             # 中间件
│   │   ├── auth.js            # JWT认证
│   │   └── isAdmin.js         # 管理员权限
│   ├── routes/                 # 路由
│   │   ├── authRoutes.js
│   │   ├── deviceRoutes.js
│   │   ├── locktagRoutes.js
│   │   ├── lotoRoutes.js
│   │   └── exportRoutes.js
│   ├── index.js                # 服务入口
│   ├── .env                    # 环境配置
│   └── package.json            # 依赖管理
│
└── miniprogram/               # 微信小程序
    ├── pages/                 # 页面
    │   ├── login/            # 登录页
    │   ├── register/         # 注册页
    │   ├── index/            # 首页
    │   ├── device/           # 设备管理
    │   ├── locktag/          # 锁牌管理
    │   ├── loto/             # LOTO记录
    │   │   └── edit/        # 编辑/新增记录
    │   └── export/           # 数据导出
    ├── utils/                # 工具函数
    │   └── request.js        # 网络请求封装
    ├── app.js
    ├── app.json
    └── app.wxss
```

## 快速开始

### 环境要求

- Node.js >= 14.0
- MongoDB >= 4.0 (可选，支持模拟数据模式)
- 微信开发者工具

### 后端部署

1. 进入后端目录并安装依赖：
```bash
cd backend
npm install
```

2. 配置环境变量（编辑 `.env` 文件）：
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/loto-qr
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

3. 启动服务：
```bash
npm start
```

服务将在 `http://localhost:3000` 启动。

### 小程序配置

1. 使用微信开发者工具打开 `miniprogram` 目录

2. 修改 API 地址（`miniprogram/app.js`）：
```javascript
// app.js
globalData: {
  apiBase: 'http://your-server-ip:3000/api'
}
```

3. 在微信开发者工具中配置服务器域名（开发阶段可选择"不校验合法域名"）

## 默认账号

系统自动创建管理员账号：

- **用户名**: `SARL2LOTO`
- **密码**: `EHS123456`

## API 接口文档

### 认证接口

#### 登录
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "SARL2LOTO",
  "password": "EHS123456"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "username": "SARL2LOTO",
    "role": "admin"
  }
}
```

#### 注册（管理员权限）
```
POST /api/auth/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newuser",
  "password": "password123",
  "role": "user"
}
```

### 设备接口

```
POST /api/device/add      # 新增设备
GET /api/device/list      # 获取设备列表
GET /api/device/detail/:id # 获取设备详情
```

### 锁牌接口

```
POST /api/locktag/add      # 新增锁牌
GET /api/locktag/list      # 获取锁牌列表
GET /api/locktag/detail/:id # 获取锁牌详情
PUT /api/locktag/update/:id # 更新锁牌
```

### LOTO记录接口

```
POST /api/loto/add         # 新增记录
GET /api/loto/list         # 获取记录列表
GET /api/loto/detail/:id   # 获取记录详情
PUT /api/loto/update/:id   # 更新记录
DELETE /api/loto/delete/:id # 删除记录
PUT /api/loto/cancel/:id   # 解除锁定
```

### 导出接口

```
GET /api/export/loto?deviceId=&lockTagId=&userId=&startTime=&endTime=
```

## 使用流程

### 1. 管理员操作流程

1. 登录系统（使用管理员账号）
2. 创建普通用户账号
3. 添加设备 - 系统自动生成编号和二维码
4. 添加锁牌 - 系统自动生成编号和二维码
5. 打印/保存二维码，贴在对应设备和锁牌上

### 2. 普通用户操作流程

#### 上锁流程
1. 扫码设备或锁牌二维码
2. 自动跳转到LOTO记录页面
3. 填写LOTO信息，选择锁牌
4. 提交记录，锁牌状态变更为"已锁定"

#### 解锁流程
1. 扫码设备或锁牌二维码
2. 查看当前LOTO记录
3. 点击"解除锁定"
4. 锁牌状态恢复为"可用"

## 数据模型

### User（用户）
```javascript
{
  username: String,        // 用户名（唯一）
  password: String,        // 加密密码
  role: 'admin' | 'user',  // 角色
  createdAt: Date
}
```

### Device（设备）
```javascript
{
  deviceNo: String,        // 设备编号（自动生成：EQP-YYYY-XXX）
  deviceName: String,      // 设备名称
  qrContent: String,       // 二维码内容
  qrBase64: String,        // 二维码Base64图片
  createdBy: ObjectId,     // 创建者ID
  createdAt: Date
}
```

### LockTag（锁牌）
```javascript
{
  tagNo: String,           // 锁牌编号（自动生成：TAG-YYYY-XXX）
  tagName: String,         // 锁牌名称
  status: '可用' | '已锁定',
  qrContent: String,
  qrBase64: String,
  createdBy: ObjectId,
  createdAt: Date
}
```

### LotoRecord（记录）
```javascript
{
  deviceId: ObjectId,      // 关联设备
  lockTagId: ObjectId,     // 关联锁牌（可选）
  lotoInfo: String,        // LOTO信息
  status: '锁定' | '已解除',
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

## 开发说明

### Mock数据模式

如果没有MongoDB数据库，系统会自动使用模拟数据模式，包含测试用户：
- 用户名: `SARL2LOTO` 密码: `EHS123456` (管理员)
- 用户名: `user1` 密码: `123456` (普通用户)

### 二维码生成

二维码内容格式：
- 设备: `pages/loto/loto?deviceId=<id>`
- 锁牌: `pages/loto/loto?tagId=<id>`

微信扫码时会自动跳转到对应页面。

## 安全建议

1. 生产环境请修改 `JWT_SECRET` 为强密码
2. 配置HTTPS
3. 定期备份数据库
4. 实施IP白名单或访问频率限制
5. 定期轮换管理员密码

## 常见问题

### Q: 小程序无法连接后端？
A: 请检查：
- 后端服务是否正常启动
- 小程序中API地址配置是否正确
- 微信开发者工具是否勾选了"不校验合法域名"

### Q: 二维码无法扫描？
A: 请确保：
- 二维码内容格式正确
- 小程序已正确配置
- 使用微信扫描（其他扫码软件可能无法跳转）

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
