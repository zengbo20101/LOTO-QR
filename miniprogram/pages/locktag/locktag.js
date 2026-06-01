const request = require('../../utils/request');

Page({
  data: {
    lockTags: [],
    loading: false,
    showAddModal: false,
    tagName: '',
    addLoading: false
  },
  
  onLoad(options) {
    this.loadLockTags();
    if (options.action === 'add') {
      setTimeout(() => {
        this.showAddModal();
      }, 500);
    }
  },
  
  onShow() {
    this.loadLockTags();
  },
  
  async loadLockTags() {
    this.setData({ loading: true });
    try {
      const res = await request.get('/locktag/list');
      this.setData({ lockTags: Array.isArray(res) ? res : [] });
    } catch (err) {
      console.error(err);
    } finally {
      this.setData({ loading: false });
    }
  },
  
  showAddModal() {
    this.setData({ showAddModal: true, tagName: '' });
  },
  
  hideAddModal() {
    this.setData({ showAddModal: false });
  },
  
  onTagNameInput(e) {
    this.setData({ tagName: e.detail.value });
  },
  
  async addLockTag() {
    if (!this.data.tagName) {
      wx.showToast({
        title: '请输入锁牌名称',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ addLoading: true });
    
    try {
      await request.post('/locktag/add', {
        tagName: this.data.tagName
      });
      
      wx.showToast({
        title: '添加成功',
        icon: 'success'
      });
      
      this.hideAddModal();
      this.loadLockTags();
    } catch (err) {
      console.error(err);
    } finally {
      this.setData({ addLoading: false });
    }
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
