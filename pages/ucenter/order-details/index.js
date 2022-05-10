var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var timer = require('../../../utils/wxTimer.js');
var remaintimer = require('../../../utils/remainTime.js');
const pay = require('../../../services/pay.js');
const app = getApp()

// TODO 拼团订单不能退款
Page({
    data: {
        orderId: 0,
        orderInfo: {},
        orderGoods: [],
        userInfo:{},
        payMethodItems: [{
            name: 'offline',
            value: '银行转账',
            checked: true
        },
        // {
        //     name: 'online',
        //     value: '微信支付',
        //     checked: false
        // },
    ],
    payMethod: 0,
    },
    payChange(e) {
        let val = e.detail.value;
        if (val == 'offline') {
            this.setData({
                payMethod: 0
            })
        } else {
            this.setData({
                payMethod: 1
            })
        }
    },
    offlineOrder: function(e){
        const orderId= this.data.orderId
        wx.redirectTo({
            url: '/pages/screenshotUpload/screenshotUpload?order_id=' + orderId
        })
    },
    onlineOrder: function(e){
        const orderId= this.data.orderId
        wx.showLoading({
            title: '',
            mask: true,
        })
        pay.payOrder(orderId)
            .then(res => {
                wx.redirectTo({
                    url: '/pages/payResult/payResult?orderId=' + orderId + '&status=' + 1,
                })
                wx.hideLoading();
            })
            .catch(error => {
                wx.redirectTo({
                    url: '/pages/payResult/payResult?orderId=' + orderId + '&status=' + 0,
                })
                wx.hideLoading();
            });



    },

    reOrderAgain: function () {
        let orderId = this.data.orderId
        wx.redirectTo({
            url: '/pages/order-check/index?addtype=2&orderFrom=' + orderId
        })
    },
    copyText: function (e) {
        let data = e.currentTarget.dataset.text;
        wx.setClipboardData({
            data: data,
            success(res) {
                wx.getClipboardData({
                    success(res) {}
                })
            }
        })
    },
    toGoodsList: function (e) {
        let orderId = this.data.orderId;
        wx.navigateTo({
            url: '/pages/ucenter/goods-list/index?id=' + orderId,
        });
    },
    toExpressInfo: function (e) {
        let orderId = this.data.orderId;
        wx.navigateTo({
            url: '/pages/ucenter/express-info/index?id=' + orderId,
        });
    },
    toRefundSelect: function (e) {
        wx.navigateTo({
            url: '/pages/refund-select/index',
        });
    },
    payOrder: function (e) {
        let that = this;
        pay.payOrder(parseInt(that.data.orderId)).then(res => {
            that.getOrderDetail();
        }).catch(res => {
            util.showErrorToast(res.errmsg);
        });
    },
    toSelectAddress: function () {
        let orderId = this.data.orderId;
        wx.navigateTo({
            url: '/pages/ucenter/address-select/index?id=' + orderId,
        });
    },
    onLoad: function () {

    },
    onShow: function () {
        var orderId = wx.getStorageSync('orderId');
        let userInfo = wx.getStorageSync('userInfo');
        this.setData({
            orderId: orderId,
            userInfo:userInfo
        });
        wx.showLoading({
            title: '加载中...',
        })
        this.getOrderDetail();
    },
    onUnload: function () {
    },
    onHide: function () {
    },
    orderTimer: function (endTime) {
        let that = this;
        var orderTimerID = '';
        let wxTimer2 = new timer({
            endTime: endTime,
            name: 'orderTimer',
            id: orderTimerID,
            complete: function () {
                that.letOrderCancel();
            },
        })
        wxTimer2.start(that);
    },
    bindinputMemo(event) {
        let postscript = event.detail.value;
        this.setData({
            postscript: postscript
        });
    },

    getOrderDetail: function () {
        let that = this;
        util.request(api.OrderDetail, {
            order_id: that.data.orderId
        }).then(function (res) {
            if (res.errno === 0) {
                that.setData({
                    orderInfo: {...res.data, goods_price: (res.data.total_price - res.data.freight_price).toFixed(2)},
                    orderGoods: res.data.orderGoods,
                    goodsCount: res.data.goodsCount
                });
            }
        });
        wx.hideLoading();
    },
    letOrderCancel: function () {
        let that = this;
        util.request(api.OrderCancel, {
            orderId: that.data.orderId
        }, 'POST').then(function (res) {
            if (res.errno === 0) {
                that.getOrderDetail();
            } else {
                util.showErrorToast(res.errmsg);
            }
        });
    },
    // “删除”点击效果
    deleteOrder: function () {
        let that = this;
        wx.showModal({
            title: '',
            content: '确定要删除此订单？',
            success: function (res) {
                if (res.confirm) {
                    util.request(api.OrderDelete, {
                        orderId: that.data.orderId
                    }, 'POST').then(function (res) {
                        if (res.errno === 0) {
                            wx.showToast({
                                title: '删除订单成功'
                            });
                            wx.removeStorageSync('orderId');
                            wx.setStorageSync('doRefresh', 1);
                            wx.navigateBack();
                        } else {
                            util.showErrorToast(res.errmsg);
                        }
                    });
                }
            }
        });
    },
    // “确认收货”点击效果
    confirmOrder: function () {
        let that = this;
        wx.showModal({
            title: '',
            content: '收到货了？确认收货？',
            success: function (res) {
                if (res.confirm) {
                    util.request(api.OrderConfirm, {
                        orderId: that.data.orderId
                    }, 'POST').then(function (res) {
                        if (res.errno === 0) {
                            wx.showToast({
                                title: '确认收货成功！'
                            });
                            wx.setStorageSync('doRefresh', 1);
                            that.getOrderDetail();
                        } else {
                            util.showErrorToast(res.errmsg);
                        }
                    });
                }
            }
        });
    },
    // “取消订单”点击效果
    cancelOrder: function (e) {
        let that = this;
        wx.showModal({
            title: '',
            content: '确定要取消此订单？',
            success: function (res) {
                if (res.confirm) {
                    util.request(api.OrderCancel, {
                        id: that.data.orderId
                    }, 'POST').then(function (res) {
                        if (res.errno === 0) {
                            wx.showToast({
                                title: '取消订单成功'
                            });
                            // nav back to order list
                            wx.navigateBack();
                            wx.setStorageSync('doRefresh', 1);
                        } else {
                            util.showErrorToast(res.errmsg);
                        }
                    });
                }
            }
        });
    },

    payForOrder: function() {
        let that = this;
        const order_id = that.data.orderId;
        wx.redirectTo({
            // url: '/pages/payOffline/index?status=1',
            url: '/pages/screenshotUpload/screenshotUpload?order_id=' + order_id
        })
    }
})