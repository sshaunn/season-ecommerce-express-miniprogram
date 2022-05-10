const util = require('../../utils/util.js');
const api = require('../../config/api');
const { Server, uploadScreenshot, confirmImage } = api;
Page({
  /**
   * Page initial data
   */
  data: {
    order_id: 0,
    total: 0,
    src: '', // 预览图片用的src
  },

  chooseImage: function () {
    let that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: function (res) {
        const tempFilePaths = res.tempFilePaths;
        wx.showToast({
          icon: "loading",
          title: "正在上传"
        }),
        wx.uploadFile({
          filePath: tempFilePaths[0],
          name: 'image',
          url: uploadScreenshot,
          header: { 'X-Nideshop-Token': wx.getStorageSync('token') }, // use x-nideshop-token to pass token
          success: function(res) {
            // return url of uploaded image, set it to src 
            let response = JSON.parse(res.data);
            const url = Server + response.data;
            that.setData({
              src: url
            })
          }
        })
      }
    })
  },

  confirmImage: function () {
    let that = this;
    if (!that.data.src) {
      wx.showModal({
        title: '请先选择图片'
      })
    } else {
      // send a request to confirm url
      util.request(confirmImage, {
        order_id: that.data.order_id,
        url: that.data.src 
    }, 'POST').then((res) => {
      if (res.errno === 0) {
        // jump to payOffline page with index 1
        wx.redirectTo({
          url: '/pages/payOffline/index?status=1',
      })
      } else {
        // show notification, upload again
        wx.showModal({
          title: '网络请求出错，请稍后再试。'
        })
      }
    })
    }
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    this.setData({
      order_id: options.order_id
    })
    let that = this;
    util.request(api.OrderDetail, {
        order_id: that.data.order_id
    }).then(function (res) {
        if (res.errno === 0) {
            that.setData({
                total: res.data.total_price
            });
        } else {
          that.setData({
            total: '订单总价暂不可获取，请重新进入页面再试。'
          })
        }
    });
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  }
})