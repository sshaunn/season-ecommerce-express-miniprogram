var util = require('../../utils/util.js');
var api = require('../../config/api.js');
const pay = require('../../services/pay.js');
const app = getApp()

Page({
    data: {
        checkedGoodsList: [],
        checkedAddress: {},
        goodsTotalPrice: 0.00, //商品总价
        freightPrice: 0.00, //快递费
        orderTotalPrice: 0.00, //订单总价
        actualPrice: 0.00, //实际需要支付的总价
        addressId: 0,
        goodsCount: 0,
        postscript: '',
        outStock: 0,
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
        is_pickup: 0,
        contact_name: '',
        contact_number: ''
    },

    changeDeliveryMethod(e) {
        let is_pickup = e.currentTarget.dataset.index;
        is_pickup = parseInt(is_pickup)
        // set is_pickup to index
        this.setData({
            is_pickup: is_pickup,
            checkedAddress: {}
        })
        this.getCheckoutInfo();
    },

    bindInputName(event) {
        const newContactName = event.detail.value;
        this.setData({
            contact_name: newContactName
        })
    },

    bindInputNumber(event) {
        const newContactNumber = event.detail.value;
        this.setData({
            contact_number: newContactNumber
        })
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
    toGoodsList: function (e) {
        wx.navigateTo({
            url: '/pages/ucenter/goods-list/index?id=0',
        });
    },
    toSelectAddress: function () {
        if (!this.data.is_pickup) {
            wx.navigateTo({
                url: '/pages/ucenter/address/index?type=1',
            });
        } else {
            wx.navigateTo({
                url: '/pages/ucenter/pickup/index',
            });
        }
    },
    toAddAddress: function () {
        wx.navigateTo({
            url: '/pages/ucenter/address-add/index',
        })
    },
    bindinputMemo(event) {
        let postscript = event.detail.value;
        this.setData({
            postscript: postscript
        });
    },
    onLoad: function (options) {
        let addType = options.addtype;
        let orderFrom = options.orderFrom;
        if (addType != undefined) {
            this.setData({
                addType: addType
            })
        }
        if (orderFrom != undefined) {
            this.setData({
                orderFrom: orderFrom
            })
        }
    },
    onUnload: function () {
        wx.removeStorageSync('addressId');
        wx.removeStorageSync('pickupAddressId');
        wx.removeStorageSync('is_pickup');
    },
    onShow: function () {
        // 页面显示
        // TODO结算时，显示默认地址，而不是从storage中获取的地址值
        try {
            var addressId = wx.getStorageSync('addressId');
            var pickupAddressId = wx.getStorageSync('pickupAddressId');
            var is_pickup_order = wx.getStorageSync('is_pickup');
            if (addressId == 0 || addressId == '') {
                addressId = 0;
            }
            this.setData({
                'addressId': !is_pickup_order || is_pickup_order == '0' ? addressId : pickupAddressId,
                'is_pickup': !is_pickup_order || is_pickup_order == '0' ? 0 : 1
            });
        } catch (e) {}
        this.getCheckoutInfo();
    },
    onPullDownRefresh: function () {
        wx.showNavigationBarLoading()
        try {
            var addressId = wx.getStorageSync('addressId');
            if (addressId == 0 || addressId == '') {
                addressId = 0;
            }
            this.setData({
                'addressId': addressId
            });
        } catch (e) {
            // Do something when catch error
        }
        this.getCheckoutInfo();
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
    },
    getCheckoutInfo: function () {
        let that = this;
        let addressId = that.data.addressId;
        let orderFrom = that.data.orderFrom;
        let addType = that.data.addType;
        let is_pickup = that.data.is_pickup;
        util.request(api.CartCheckout, {
            addressId: addressId,
            addType: addType,
            orderFrom: orderFrom,
            type: 0,
            is_pickup: is_pickup
        }).then(function (res) {
            if (res.errno === 0) {
                let addressId = 0;
                if (JSON.stringify(res.data.checkedAddress) !== '{}' && res.data.checkedAddress != 0) {
                    addressId = res.data.checkedAddress.address_id;
                }
                that.setData({
                    checkedGoodsList: res.data.checkedGoodsList,
                    checkedAddress: res.data.checkedAddress,
                    actualPrice: res.data.actualPrice,
                    addressId: addressId,
                    freightPrice: res.data.freightPrice,
                    goodsTotalPrice: res.data.goodsTotalPrice,
                    orderTotalPrice: res.data.orderTotalPrice,
                    goodsCount: res.data.goodsCount,
                    outStock: res.data.outStock
                });
                let goods = res.data.checkedGoodsList;
                wx.setStorageSync('addressId', addressId);
                if (res.data.outStock == 1) {
                    util.showErrorToast('有部分商品缺货或已下架');
                } else if (res.data.numberChange == 1) {
                    util.showErrorToast('部分商品库存有变动');
                }
            }
        });
    },
    // TODO 有个bug，用户没选择地址，支付无法继续进行，在切换过token的情况下
    submitOrder: function (e) {
        if (this.data.addressId <= 0) {
            util.showErrorToast('请选择收货地址');
            return false;
        }
        let addressId = this.data.addressId;
        let postscript = this.data.postscript;
        let freightPrice = this.data.freightPrice;
        let actualPrice = this.data.actualPrice;
    },
    onlineOrder: function (e) {
        if (this.data.addressId <= 0) {
            util.showErrorToast('请选择收货地址');
            return false;
        }
        if (!this.data.contact_name && this.data.is_pickup) {
            util.showErrorToast('请输入自提联系人姓名');
            return false;
        }
        if (!this.data.contact_number && this.data.is_pickup) {
            util.showErrorToast('请输入联系电话');
            return false;
        }
        if (this.data.contact_number && this.data.is_pickup && !this.data.contact_number.match('^0?(3|4)[0-9]{8}$')) {
            util.showErrorToast('电话号码有误，请重新输入');
            return false;
        }
        let addressId = this.data.addressId;
        let postscript = this.data.postscript;
        let is_pickup = this.data.is_pickup;
        let contact_number = this.data.contact_number;
        let contact_name = this.data.contact_name;
        wx.showLoading({
            title: '',
            mask: true,
        })
        util.request(api.OrderSubmit, {
            order_type: 0,
            address_id: addressId,
            postscript: postscript,
            is_pickup: is_pickup,
            payment_method: 601,
            contact_name: contact_name,
            contact_number: contact_number
        }, 'POST').then(res => {
            //console.log(res);
            if (res.errno === 0) {
                const order_id = res.data.id;
                wx.removeStorageSync('orderId');
                wx.setStorageSync('addressId', 0);
                wx.hideLoading();
                this.payOnline(order_id)

            } else {
                util.showErrorToast(res.errmsg);
            }
        })
    },
    payOnline: function (orderId) {
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
    offlineOrder: function (e) {
        if (this.data.addressId <= 0) {
            util.showErrorToast('请选择收货地址');
            return false;
        }
        if (!this.data.contact_name && this.data.is_pickup) {
            util.showErrorToast('请输入自提联系人姓名');
            return false;
        }
        if (!this.data.contact_number && this.data.is_pickup) {
            util.showErrorToast('请输入联系电话');
            return false;
        }
        if (this.data.contact_number && this.data.is_pickup && !this.data.contact_number.match('^0?(3|4)[0-9]{8}$')) {
            util.showErrorToast('电话号码有误，请重新输入');
            return false;
        }
        let addressId = this.data.addressId;
        let postscript = this.data.postscript;
        let is_pickup = this.data.is_pickup;
        let contact_number = this.data.contact_number;
        let contact_name = this.data.contact_name;
        util.request(api.OrderSubmit, {
            order_type: 0,
            address_id: addressId,
            postscript: postscript,
            is_pickup: is_pickup,
            payment_method: 501,
            contact_name: contact_name,
            contact_number: contact_number
        }, 'POST').then(res => {
            if (res.errno === 0) {
                const order_id = res.data.id;
                wx.removeStorageSync('orderId');
                wx.setStorageSync('addressId', 0);
                wx.redirectTo({
                    // url: '/pages/payOffline/index?status=1',
                    url: '/pages/screenshotUpload/screenshotUpload?order_id=' + order_id
                })
            } else {
                util.showErrorToast(res.errmsg);
                wx.redirectTo({
                    url: '/pages/payOffline/index?status=0',
                })
            }
        });
    }
})