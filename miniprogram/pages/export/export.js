const request = require('../../utils/request');

Page({
  data: {
    devices: [],
    lockTags: [],
    
    deviceNames: ['全部设备'],
    lockTagNames: ['全部锁牌'],
    
    deviceIndex: 0,
    lockTagIndex: 0,
    
    startDate: '',
    endDate: '',
    
    exporting: false
  },
  
  onLoad() {
    this.loadData();
  },
  
  async loadData() {
    try {
      const [devices, lockTags] = await Promise.all([
        request.get('/device/list'),
        request.get('/locktag/list')
      ]);
      
      const deviceList = Array.isArray(devices) ? devices : [];
      const lockTagList = Array.isArray(lockTags) ? lockTags : [];
      
      const deviceNames = ['全部设备', ...deviceList.map(d => `${d.deviceNo} - ${d.deviceName}`)];
      const lockTagNames = ['全部锁牌', ...lockTagList.map(t => `${t.tagNo} - ${t.tagName}`)];
      
      this.setData({
        devices: deviceList,
        lockTags: lockTagList,
        deviceNames,
        lockTagNames
      });
    } catch (err) {
      console.error(err);
    }
  },
  
  onDeviceChange(e) {
    this.setData({ deviceIndex: parseInt(e.detail.value) });
  },
  
  onLockTagChange(e) {
    this.setData({ lockTagIndex: parseInt(e.detail.value) });
  },
  
  onStartDateChange(e) {
    this.setData({ startDate: e.detail.value });
  },
  
  onEndDateChange(e) {
    this.setData({ endDate: e.detail.value });
  },
  
  async onExport() {
    this.setData({ exporting: true });
    
    try {
      const params = {};
      
      if (this.data.deviceIndex > 0) {
        params.deviceId = this.data.devices[this.data.deviceIndex - 1]._id;
      }
      
      if (this.data.lockTagIndex > 0) {
        params.lockTagId = this.data.lockTags[this.data.lockTagIndex - 1]._id;
      }
      
      if (this.data.startDate) {
        params.startTime = this.data.startDate;
      }
      
      if (this.data.endDate) {
        params.endTime = this.data.endDate;
      }
      
      let queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
      
      const url = `${getApp().globalData.apiBase}/export/loto${queryString ? '?' + queryString : ''}`;
      
      wx.showToast({
        title: '导出功能开发中',
        icon: 'none'
      });
      
      setTimeout(() => {
        wx.showModal({
          title: '提示',
          content: '请使用后端API直接导出CSV文件，或联系管理员获取数据。',
          showCancel: false
        });
      }, 1000);
      
    } catch (err) {
      console.error(err);
      wx.showToast({
        title: '导出失败',
        icon: 'none'
      });
    } finally {
      this.setData({ exporting: false });
    }
  }
});
