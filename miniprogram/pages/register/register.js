const request = require('../../utils/request');

Page({
  data: {
    username: '',
    password: '',
    roles: ['普通用户', '管理员'],
    roleIndex: 0,
    roleValues: ['user', 'admin'],
    loading: false
  },
  
  onUsernameInput(e) {
    this.setData({ username: e.detail.value });
  },
  
  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },
  
  onRoleChange(e) {
    this.setData({ roleIndex: parseInt(e.detail.value) });
  },
  
  async onRegister() {
    if (!this.data.username || !this.data.password) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }
    
    if (this.data.password.length < 6) {
      wx.showToast({
        title: '密码至少6位',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ loading: true });
    
    try {
      await request.post('/auth/register', {
        username: this.data.username,
        password: this.data.password,
        role: this.data.roleValues[this.data.roleIndex]
      });
      
      wx.showToast({
        title: '注册成功',
        icon: 'success'
      });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      this.setData({ loading: false });
    }
  },
  
  goBack() {
    wx.navigateBack();
  }
});
