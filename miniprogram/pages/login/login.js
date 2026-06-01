const app = getApp();
const request = require('../../utils/request');

Page({
  data: {
    username: '',
    password: '',
    loading: false,
    userInfo: null
  },
  
  onLoad() {
    // 检查是否已经登录
    const token = wx.getStorageSync('token');
    if (token) {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }
    
    // 直接进入管理员模式（跳过登录）
    wx.showModal({
      title: '开发模式',
      content: '是否以管理员身份直接进入系统？',
      success: (res) => {
        if (res.confirm) {
          // 设置管理员信息
          const adminUser = {
            _id: 'admin1',
            username: 'SARL2LOTO',
            role: 'admin'
          };
          const adminToken = 'mock_token_admin1';
          
          app.setUserInfo(adminUser, adminToken);
          
          wx.showToast({
            title: '已以管理员身份进入',
            icon: 'success'
          });
          
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/index/index'
            });
          }, 1000);
        }
      }
    });
  },
  
  onShow() {
    // 检查是否已经登录
    const token = wx.getStorageSync('token');
    if (token) {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }
  },
  
  onUsernameInput(e) {
    this.setData({ username: e.detail.value });
  },
  
  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },
  
  async onLogin() {
    if (!this.data.username || !this.data.password) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ loading: true });
    
    try {
      const res = await request.post('/auth/login', {
        username: this.data.username,
        password: this.data.password
      });
      
      app.setUserInfo(res.user, res.token);
      
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });
      
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      this.setData({ loading: false });
    }
  },
  
  goToRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    });
  }
});
