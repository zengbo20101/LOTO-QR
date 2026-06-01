const request = require('../../../utils/request');

Page({
  data: {
    isEdit: false,
    recordId: null,
    
    devices: [],
    lockTags: [],
    
    deviceNames: [],
    lockTagNames: ['不使用锁牌'],
    
    deviceIndex: 0,
    lockTagIndex: 0,
    
    statusOptions: ['锁定', '已解除'],
    statusIndex: 0,
    
    lotoInfo: '',
    submitting: false
  },
  
  onLoad(options) {
    if (options.id) {
      this.setData({ 
        isEdit: true, 
        recordId: options.id 
      });
      this.loadRecord(options.id);
    }
    
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
      
      const deviceNames = deviceList.map(d => `${d.deviceNo} - ${d.deviceName}`);
      const lockTagNames = ['不使用锁牌', ...lockTagList.filter(t => t.status === '可用').map(t => `${t.tagNo} - ${t.tagName}`)];
      
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
  
  async loadRecord(id) {
    try {
      const record = await request.get(`/loto/detail/${id}`);
      
      let deviceIndex = this.data.devices.findIndex(d => d._id === record.deviceId);
      let lockTagIndex = 0;
      
      if (record.lockTagId) {
        const lockTagInList = this.data.lockTags.find(t => t._id === record.lockTagId);
        if (lockTagInList) {
          lockTagIndex = this.data.lockTagNames.findIndex(n => n.includes(lockTagInList.tagNo));
        }
      }
      
      let statusIndex = 0;
      if (record.status === '已解除') {
        statusIndex = 1;
      }
      
      this.setData({
        deviceIndex: deviceIndex >= 0 ? deviceIndex : 0,
        lockTagIndex,
        statusIndex,
        lotoInfo: record.lotoInfo
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
  
  onStatusChange(e) {
    this.setData({ statusIndex: parseInt(e.detail.value) });
  },
  
  onLotoInfoChange(e) {
    this.setData({ lotoInfo: e.detail.value });
  },
  
  async onSubmit() {
    if (!this.data.lotoInfo) {
      wx.showToast({
        title: '请输入LOTO信息',
        icon: 'none'
      });
      return;
    }
    
    if (this.data.deviceIndex < 0) {
      wx.showToast({
        title: '请选择设备',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ submitting: true });
    
    try {
      const deviceId = this.data.devices[this.data.deviceIndex]?._id;
      const lockTagId = this.data.lockTagIndex > 0 
        ? this.data.lockTags[this.data.lockTagIndex - 1]?._id 
        : null;
      
      if (this.data.isEdit) {
        const status = this.data.statusOptions[this.data.statusIndex];
        
        await request.put(`/loto/update/${this.data.recordId}`, {
          lotoInfo: this.data.lotoInfo,
          status
        });
      } else {
        await request.post('/loto/add', {
          deviceId,
          lockTagId,
          lotoInfo: this.data.lotoInfo
        });
      }
      
      wx.showToast({
        title: this.data.isEdit ? '修改成功' : '创建成功',
        icon: 'success'
      });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      this.setData({ submitting: false });
    }
  },
  
  onCancel() {
    wx.navigateBack();
  }
});
