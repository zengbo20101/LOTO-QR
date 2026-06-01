const app = getApp();

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    
    wx.request({
      url: app.globalData.apiBase + url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.header
      },
      success(res) {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // 未授权，清除用户信息
          app.clearUserInfo();
          wx.showToast({
            title: '请先登录',
            icon: 'none'
          });
          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/login/login'
            });
          }, 1500);
          reject(res.data);
        } else {
          wx.showToast({
            title: res.data.message || '请求失败',
            icon: 'none'
          });
          reject(res.data);
        }
      },
      fail(err) {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
}

module.exports = {
  get(url, data) {
    return request(url, { method: 'GET', data });
  },
  post(url, data) {
    return request(url, { method: 'POST', data });
  },
  put(url, data) {
    return request(url, { method: 'PUT', data });
  },
  delete(url, data) {
    return request(url, { method: 'DELETE', data });
  }
};
