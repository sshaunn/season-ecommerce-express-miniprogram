var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var app = getApp();
Page({
    data: {
        address: {
            address_id: 0, // db column: address_id
            contact_name: '',
            contact_number: '',
            postcode_id: 0,
            street: '',
            postcode: '',
            suburb: '',
            state: 'VIC',
            is_default: 0,
        },
        addressId: 0,
        isNewAddress: false,
        isSubmitting: false,
    },
    mobilechange(e) {
        let mobile = e.detail.value;
        let address = this.data.address;
        if (util.testMobile(mobile)) {
            address.contact_number = mobile;
            this.setData({
                address: address
            });
        }
    },
    setAddressField(field, event) {
        let address = {
            ...this.data.address
        };
        address[field] = event.detail.value;
        this.setData({
            address: address
        });
    },
    bindinputName(event) {
        this.setAddressField('contact_name', event);
    },
    bindinputAddress(event) {
        this.setAddressField('street', event);
    },
    bindinputSuburb(event) {
        this.setAddressField('suburb', event);
    },
    validatePostcode(postcode) {
        // Validate postcode
        const postcodeRegex = /^[0-9]{4}$/;
        if (typeof (postcode) === 'string' && postcodeRegex.test(postcode)) {
            return true;
        }
        util.showErrorToast('邮政编码需为4位数字');
        return false;
    },
    validatePostcodeHandler(event) {
        return this.validatePostcode(event.detail.value);
    },
    bindinputPostcode(event) {
        this.setAddressField('postcode', event);
    },
    switchChange(e) {
        let status = e.detail.value;
        let is_default = 0;
        if (status == true) {
            is_default = 1;
        }
        let address = 'address.is_default';
        this.setData({
            [address]: is_default
        });
    },
    getAddressDetail() {
        let that = this;
        util.request(api.AddressDetail, {
            id: that.data.addressId
        }).then(function (res) {
            if (res.errno === 0) {
                that.setData({
                    address: {
                        ...res.data
                    }
                });
            }
        });
    },
    deleteAddress: function () {
        let id = this.data.addressId;
        wx.showModal({
            title: '提示',
            content: '您确定要删除么？',
            success: function (res) {
                if (res.confirm) {
                    util.request(api.DeleteAddress, {
                        id: id
                    }, 'POST').then(function (res) {
                        if (res.errno === 0) {
                            wx.removeStorageSync('addressId');
                            util.showErrorToast('删除成功');
                            wx.navigateBack();
                        } else {
                            util.showErrorToast(res.errmsg);
                        }
                    });
                }
            }
        })
    },
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
        if (options.id) {
            this.setData({
                addressId: options.id
            });
            this.getAddressDetail();
        }
    },
    validateAddress: function () {
        let address = this.data.address;
        if (address.contact_name == '' || address.contact_name == undefined) {
            util.showErrorToast('请输入姓名');
            return false;
        }
        if (address.contact_number == '' || address.contact_number == undefined) {
            util.showErrorToast('请输入手机号码');
            return false;
        }
        if (address.street == '' || address.street == undefined) {
            util.showErrorToast('请输入收货地址');
            return false;
        }
        if (address.suburb == '' || address.suburb == undefined) {
            util.showErrorToast('请输入Suburb信息');
            return false;
        }
        if (!this.validatePostcode(address.postcode)) {
            return false;
        }
        return true;
    },
    onReady: function () {},
    saveAddress: function () {
        if (this.data.isSubmitting) {
            // Avoid submitting multiple times
            return;
        }
        this.setData({
            isSubmitting: true
        })
        let address = this.data.address;
        const isAddingAddress = this.data.isNewAddress;
        if (!this.validateAddress()) {
            return false;
        }
        const requestBody = {
            name: address.contact_name,
            mobile: address.contact_number,
            street: address.street,
            suburb: address.suburb,
            state: address.state,
            postcode: address.postcode,
            is_default: address.is_default,
        };
        if (isAddingAddress) {
            // Add new address
            util.request(api.AddAddress, requestBody, 'POST').then(function (res) {
                if (res.errno === 0) {
                    wx.navigateBack()
                } else {
                    wx.showModal({
                        title: res.errmsg
                    })
                }
            });
        } else {
            // Update the address
            requestBody.address_id = address.address_id; // Add address_id to request
            util.request(api.UpdateAddress, requestBody, 'POST').then(function (res) {
                if (res.errno === 0) {
                    wx.navigateBack()
                } else {
                    wx.showModal({
                        title: res.errmsg
                    })
                }
            });
        }
    },
    onShow: function () {
        let id = this.data.addressId;
        if (id > 0) {
            wx.setNavigationBarTitle({
                title: '编辑地址',
            })
        } else {
            wx.setNavigationBarTitle({
                title: '新增地址',
            })
            this.setData({
                isNewAddress: true
            });
        }
    },
    onHide: function () {
        // 页面隐藏

    },
    onUnload: function () {
        // 页面关闭

    }
})