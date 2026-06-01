# LOTO 扫码信息系统修复 - 实施计划

## [x] 任务 1: 修复用户注册和登录功能
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 修复用户注册功能，确保用户名和电话正确保存
  - 修复用户登录功能，确保正确验证用户
  - 确保注册的用户可以正常登录
- **Acceptance Criteria Addressed**: AC-5, AC-6
- **Test Requirements**:
  - `programmatic` TR-1.1: 新用户注册后，用户信息被正确保存
  - `programmatic` TR-1.2: 已注册用户可以使用用户名或电话成功登录
  - `programmatic` TR-1.3: 用户注册时不会出现"账号已存在"的错误提示（除非确实已存在）
- **Notes**: 重点检查用户控制器和认证控制器的逻辑

## [x] 任务 2: 修复电话录入功能
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 检查电话字段在表单中的处理
  - 确保电话信息在注册和登录过程中正确传递和保存
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` TR-2.1: 注册时填写的电话信息被正确保存
  - `programmatic` TR-2.2: 登录时可以使用电话作为标识符
- **Notes**: 检查前端表单收集和后端数据保存逻辑

## [x] 任务 3: 删除危险警示字段
- **Priority**: P1
- **Depends On**: None
- **Description**:
  - 在 LOTO 信息输入表单中删除危险警示字段
  - 更新相关的显示和处理逻辑
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgement` TR-3.1: 危险警示字段不在 LOTO 信息输入表单中显示
- **Notes**: 仅从前端删除，保持后端兼容性

## [x] 任务 4: 添加上锁牌子管理功能
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 创建上锁牌子数据模型
  - 实现上锁牌子的 CRUD 功能
  - 为每个上锁牌子生成二维码
  - 创建上锁牌子管理页面
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-4.1: 可以创建、查看、编辑和删除上锁牌子
  - `programmatic` TR-4.2: 每个上锁牌子有唯一的二维码
- **Notes**: 上锁牌子至少需要包含编号、名称等基本信息

## [x] 任务 5: 修改二维码绑定逻辑
- **Priority**: P0
- **Depends On**: Task 4
- **Description**:
  - 修改二维码生成逻辑，二维码绑定上锁牌子而非设备
  - 更新二维码扫描处理逻辑
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-5.1: 二维码包含上锁牌子的唯一标识符
  - `programmatic` TR-5.2: 扫描二维码可以正确识别对应的上锁牌子
- **Notes**: 保留设备管理功能，设备与上锁牌子是独立的实体

## [x] 任务 6: 实现扫描二维码后选择设备
- **Priority**: P0
- **Depends On**: Task 5
- **Description**:
  - 修改 URL 参数处理逻辑，处理上锁牌子 ID
  - 更新 LOTO 信息输入页面，确保用户可以从下拉菜单选择设备
  - 确保选择设备后自动输入设备位置
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-6.1: 扫描上锁牌子二维码后，用户可以选择设备
  - `programmatic` TR-6.2: 选择设备后，设备位置自动填充
- **Notes**: 优化用户体验，确保流程顺畅
