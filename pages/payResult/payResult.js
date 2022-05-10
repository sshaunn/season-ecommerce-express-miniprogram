var util = require('../../utils/util.js');
var api = require('../../config/api.js');
const pay = require('../../services/pay.js');

var app = getApp();
Page({
    data: {
        status: 1,
        orderId: 0,
        is_over:0,
        productId:0,
        imageUrl:''
    },
    onLoad: function(options) {
        // 页面初始化 options为页面跳转所带来的参数
        this.setData({
            orderId: options.orderId,
            status: options.status
        })
    },
    toOrderListPage: function(event) {
        wx.switchTab({
            url: '/pages/ucenter/index/index',
        });
    },
    toIndex: function() {
        wx.switchTab({
            url: '/pages/index/index'
        });
    },
    payOrder() {
        wx.showLoading({
            title: '',
            mask: true,
        })
        console.log(this.data);
        pay.payOrder(parseInt(this.data.orderId)).then(res => {
            this.setData({
                status: true
            });
            wx.hideLoading();
        }).catch(res => {
            wx.hideLoading();
            util.showErrorToast("重新付款失败，请稍后尝试");
            

        });
    }
})