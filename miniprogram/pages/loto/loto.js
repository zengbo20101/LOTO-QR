const app = getApp();
const request = require('../../utils/request');

Page({
  data: {
    userInfo: null,
    lotoRecords: [],
    loading: false,
    filterOptions: ['全部', '锁定中', '已解除'],
    filterIndex: 0,
    currentFilter: '全部'
  },
  
  onLoad(options) {
    const userInfo = wx.getStorageSync('userInfo');
    this.setData({ userInfo });
    this.loadRecords();
    
    if (options.deviceId || options.tagId) {
      wx.setStorageSync('scanParams', options);
    }
  },
  
  onShow() {
    this.loadRecords();
  },
  
  async loadRecords() {
    this.setData({ loading: true });
    try {
      const res = await request.get('/loto/list');
      let records = Array.isArray(res) ? res : [];
      
      // 过滤
      if (this.data.currentFilter === '锁定中') {
        records = records.filter(r => r.status === '锁定');
      } else if (this.data.currentFilter === '已解除') {
        records = records.filter(r => r.status === '已解除');
      }
      
      records = records.map(item => ({
        ...item,
        createdTime: this.formatTime(item.createdAt)
      }));
      
      this.setData({ lotoRecords: records });
    } catch (err) {
      console.error(err);
    } finally {
      this.setData({ loading: false });
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
  
  onFilterChange(e) {
    const index = parseInt(e.detail.value);
    const currentFilter = this.data.filterOptions[index];
    this.setData({ filterIndex: index, currentFilter });
    this.loadRecords();
  },
  
  goToAdd() {
    wx.navigateTo({
      url: '/pages/loto/edit/edit'
    });
  },
  
  editLoto(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/loto/edit/edit?id=${id}`
    });
  },
  
  async cancelLoto(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '提示',
      content: '确定要解除锁定吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await request.put(`/loto/cancel/${id}`);
            wx.showToast({
              title: '解除成功',
              icon: 'success'
            });
            this.loadRecords();
          } catch (err) {
            console.error(err);
          }
        }
      }
    });
  },
  
  async deleteLoto(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '提示',
      content: '确定要删除此记录吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await request.delete(`/loto/delete/${id}`);
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
            this.loadRecords();
          } catch (err) {
            console.error(err);
          }
        }
      }
    });
  }
});
