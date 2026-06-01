App({
  globalData: {
    userInfo: null,
    token: null,
    apiBase: 'http://17.87.166.89:3000/api'
  },
  
  onLaunch() {
    // 检查本地存储的用户信息
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
    }
    
    // 检查是否有扫码参数
    const launchOptions = wx.getLaunchOptionsSync();
    this.handleLaunchOptions(launchOptions);
  },
  
  onShow(options) {
    this.handleLaunchOptions(options);
  },
  
  handleLaunchOptions(options) {
    if (options.query && (options.query.deviceId || options.query.tagId)) {
      // 扫码进来的，保存参数到本地，等进入相应页面时使用
      wx.setStorageSync('scanParams', options.query);
    }
  },
  
  setUserInfo(userInfo, token) {
    this.globalData.userInfo = userInfo;
    this.globalData.token = token;
    wx.setStorageSync('userInfo', userInfo);
    wx.setStorageSync('token', token);
  },
  
  clearUserInfo() {
    this.globalData.userInfo = null;
    this.globalData.token = null;
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('token');
  }
})
