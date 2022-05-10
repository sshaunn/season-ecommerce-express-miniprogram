var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
// 触底上拉刷新 TODO 这里要将page传给服务器，作者没写
Page({
    data: {
        pickup_points: [],
        nowAddress: 0
    },

    getAddresses() {
        let that = this;
        util.request(api.PickupAddresses).then(function(res) {
            if (res.errno === 0) {
                that.setData({
                  pickup_points: res.data
                })
            }
        });
    },
    selectAddress: function(e) {
        let addressId = e.currentTarget.dataset.addressid;
        wx.setStorageSync('pickupAddressId', addressId);
        wx.setStorageSync('is_pickup', 1);
        wx.navigateBack();
    },
    onLoad: function() {
    },
    onUnload: function() {},

    onShow: function() {
        this.getAddresses();
        let addressId = wx.getStorageSync('pickupAddressId');
        if (addressId) {
            this.setData({
                nowAddress: wx.getStorageSync('pickupAddressId')
            });
        }
        else {
            this.setData({
                nowAddress: 0
            });
        }
    },


    onPullDownRefresh: function () {
        wx.showNavigationBarLoading()
        this.getAddresses();
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
    }
})