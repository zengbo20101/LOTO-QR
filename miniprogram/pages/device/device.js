const request = require('../../utils/request');

Page({
  data: {
    devices: [],
    loading: false,
    showAddModal: false,
    deviceName: '',
    addLoading: false
  },
  
  onLoad(options) {
    this.loadDevices();
    if (options.action === 'add') {
      setTimeout(() => {
        this.showAddModal();
      }, 500);
    }
  },
  
  onShow() {
    this.loadDevices();
  },
  
  async loadDevices() {
    this.setData({ loading: true });
    try {
      const res = await request.get('/device/list');
      this.setData({ devices: Array.isArray(res) ? res : [] });
    } catch (err) {
      console.error(err);
    } finally {
      this.setData({ loading: false });
    }
  },
  
  showAddModal() {
    this.setData({ showAddModal: true, deviceName: '' });
  },
  
  hideAddModal() {
    this.setData({ showAddModal: false });
  },
  
  onDeviceNameInput(e) {
    this.setData({ deviceName: e.detail.value });
  },
  
  async addDevice() {
    if (!this.data.deviceName) {
      wx.showToast({
        title: '请输入设备名称',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ addLoading: true });
    
    try {
      await request.post('/device/add', {
        deviceName: this.data.deviceName
      });
      
      wx.showToast({
        title: '添加成功',
        icon: 'success'
      });
      
      this.hideAddModal();
      this.loadDevices();
    } catch (err) {
      console.error(err);
    } finally {
      this.setData({ addLoading: false });
    }
  },
  
  viewDevice(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/loto/loto?deviceId=${id}`
    });
  },
  
  previewQr(e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      urls: [url]
    });
  },
  
  saveQr(e) {
    const qr = e.currentTarget.dataset.qr;
    wx.showModal({
      title: '保存二维码',
      content: '是否保存此二维码到相册？',
      success: (res) => {
        if (res.confirm) {
          wx.saveImageToPhotosAlbum({
            filePath: qr,
            success: () => {
              wx.showToast({
                title: '保存成功',
                icon: 'success'
              });
            },
            fail: () => {
              wx.showToast({
                title: '保存失败',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  }
});
