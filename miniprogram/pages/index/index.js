const app = getApp();
const request = require('../../utils/request');

Page({
  data: {
    userInfo: null,
    deviceCount: 0,
    lockTagCount: 0,
    lotoCount: 0,
    latestRecords: []
  },
  
  onLoad() {
    this.init();
  },
  
  onShow() {
    this.loadData();
  },
  
  init() {
    const userInfo = wx.getStorageSync('userInfo');
    this.setData({ userInfo });
    this.loadData();
    this.checkScanParams();
  },
  
  async loadData() {
    try {
      // 并行加载所有数据
      const [devices, lockTags, lotoRecords] = await Promise.all([
        request.get('/device/list'),
        request.get('/locktag/list'),
        request.get('/loto/list')
      ]);
      
      // 处理最近记录
      const records = (Array.isArray(lotoRecords) ? lotoRecords : []).slice(0, 5).map(item => ({
        ...item,
        createdTime: this.formatTime(item.createdAt)
      }));
      
      this.setData({
        deviceCount: Array.isArray(devices) ? devices.length : 0,
        lockTagCount: Array.isArray(lockTags) ? lockTags.length : 0,
        lotoCount: Array.isArray(lotoRecords) ? lotoRecords.length : 0,
        latestRecords: records
      });
    } catch (err) {
      console.error('加载数据失败', err);
    }
  },
  
  checkScanParams() {
    const scanParams = wx.getStorageSync('scanParams');
    if (scanParams) {
      wx.removeStorageSync('scanParams');
      if (scanParams.deviceId || scanParams.tagId) {
        wx.switchTab({
          url: '/pages/loto/loto'
        });
      }
    }
  },
  
  formatTime(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${month}-${day} ${hour}:${minute}`;
  },
  
  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.clearUserInfo();
          wx.reLaunch({
            url: '/pages/login/login'
          });
        }
      }
    });
  },
  
  scanCode() {
    wx.scanCode({
      success: (res) => {
        // 解析扫码结果
        const url = res.result;
        // 这里可以处理二维码跳转逻辑
        wx.showToast({
          title: '扫码成功',
          icon: 'success'
        });
      },
      fail: () => {
        wx.showToast({
          title: '扫码失败',
          icon: 'none'
        });
      }
    });
  },
  
  goToDevice() {
    wx.switchTab({
      url: '/pages/device/device'
    });
  },
  
  goToLockTag() {
    wx.switchTab({
      url: '/pages/locktag/locktag'
    });
  },
  
  goToLoto() {
    wx.switchTab({
      url: '/pages/loto/loto'
    });
  },
  
  goToExport() {
    wx.navigateTo({
      url: '/pages/export/export'
    });
  },
  
  addDevice() {
    wx.navigateTo({
      url: '/pages/device/device?action=add'
    });
  },
  
  addLockTag() {
    wx.navigateTo({
      url: '/pages/locktag/locktag?action=add'
    });
  }
});
