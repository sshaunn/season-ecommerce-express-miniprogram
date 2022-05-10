const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const user = require('../../services/user.js');
const cartHelper = require('../../services/cart');

//获取应用实例
const app = getApp()

Page({
  data: {
    floorGoods: [],
    showChannel: 0,
    showBanner: 0,
    showBannerImg: 0,
    goodsCount: 0,
    banner: [],
    index_banner_img: 0,
    userInfo: {},
    imgurl: '',
    sysHeight: 0,
    loading: 0,
    autoplay: true,
    // For specification drawer
    drawerOpened: false,
    productInfo: {}
  },
  onHide: function () {
    this.setData({
      autoplay: false
    })
  },
  goSearch: function () {
    wx.navigateTo({
      url: '/pages/search/search',
    })
  },
  goCategory: function (e) {
    let id = e.currentTarget.dataset.cateid;
    wx.setStorageSync('categoryId', id);
    wx.switchTab({
      url: '/pages/category/index',
    })
  },
  getCatalog: function () {
    let that = this;
    util.request(api.GoodsCount).then(function (res) {
      that.setData({
        goodsCount: res.data.goodsCount
      });
    });
  },
  handleTap: function (event) {
    //阻止冒泡 
  },
  onShareAppMessage: function () {
    let info = wx.getStorageSync('userInfo');
    return {
      title: '海胆小王子美食精选',
      desc: '海胆小王子美食精选',
      path: '/pages/index/index?id=' + info.id
    }
  },
  toDetailsTap: function () {
    wx.navigateTo({
      url: '/pages/goods-details/index',
    });
  },
  getIndexData: function () {
    let that = this;

    const limitGoodsNumber = (categoryList) => {
      const output = {};
      Object.keys(categoryList).forEach((key) => {
        // set the maximum limit of items to 6 items
        const _goodsList = categoryList[key].goodsList;
        output[key] = {
          ...categoryList[key],
          goodsList: _goodsList.slice(0, 6)
        }
      })
      return output;
    }

    util.request(api.IndexUrl).then(function (res) {
      if (res.errno === 0) {
        that.setData({
          floorGoods: limitGoodsNumber(res.data.categoryList),
          banner: res.data.banner,
          channel: res.data.channel,
          notice: res.data.notice,
          loading: 1,
        });
      }
    });
  },
  onLoad: function (options) {
    let systemInfo = wx.getStorageSync('systemInfo');
    var scene = decodeURIComponent(options.scene);
    this.getCatalog();
  },
  onShow: function () {
    this.getCartNum();
    this.getChannelShowInfo();
    this.getIndexData();
    var that = this;
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo != '') {
      that.setData({
        userInfo: userInfo,
      });
    };
    let info = wx.getSystemInfoSync();
    let sysHeight = info.windowHeight - 100;
    this.setData({
      sysHeight: sysHeight,
      autoplay: true
    });
    wx.removeStorageSync('categoryId');
  },
  getCartNum: function () {
    util.request(api.CartGoodsCount).then(function (res) {
      if (res.errno === 0) {
        let cartGoodsCount = '';
        if (res.data.cartTotal.goodsCount == 0) {
          wx.removeTabBarBadge({
            index: 2,
          })
        } else {
          cartGoodsCount = res.data.cartTotal.goodsCount + '';
          wx.setTabBarBadge({
            index: 2,
            text: cartGoodsCount
          })
        }
      }
    });
  },
  getChannelShowInfo: function (e) {
    let that = this;
    util.request(api.ShowSettings).then(function (res) {
      if (res.errno === 0) {
        let show_channel = res.data.channel;
        let show_banner = res.data.banner;
        let show_notice = res.data.notice;
        let index_banner_img = res.data.index_banner_img;
        that.setData({
          show_channel: show_channel,
          show_banner: show_banner,
          show_notice: show_notice,
          index_banner_img: index_banner_img
        });
      }
    });
  },
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading()
    this.getIndexData();
    this.getChannelShowInfo();
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  openDrawerHandler: function (value) {
    let newState = value;
    if (newState === undefined) {
      newState = !this.data.drawerOpened;
    }
    this.setData({
      drawerOpened: newState
    })
  },
  addToCart: function (event) {
    // Check if the user has signed in, redirect to login page if not
    util.loginNow();
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo == '') {
      return false;
    }

    const goodsId = event.target.id;

    // Check whether the product is out of stock
    const itemInfo = event.target.dataset.extra;
    if (itemInfo.goods_number <= 0) {
      wx.showToast({
        image: '/images/icon/icon_error.png',
        title: '库存不足',
      })
      return;
    }

    // Show a loading dialog to tell the user the request has started
    wx.showLoading({
      title: '正在添加...',
    })

    var that = this;
    cartHelper.getGoodsInfo(goodsId, function onSuccess(resData) {
      const productInfo = resData;

      const _specificationList = productInfo.specificationList;
      // If there is only one item in specification list, check it by default
      let checkedProduct = null;
      const onlyOneSpec = _specificationList.valueList.length == 1;
      if (onlyOneSpec) {
        productInfo.specificationList.valueList[0].checked = true;
        checkedProduct = productInfo.productList[0];
      } else {
        // open drawer to select a specification
        wx.hideLoading();
        that.openDrawerHandler(true);
      }

      that.setData({
        productInfo: productInfo
      });

      if (onlyOneSpec) {
        // Submit the request to add the item to cart
        cartHelper.addToCart(goodsId, 1, checkedProduct.id, () => {
          wx.hideLoading();
          wx.showToast({
            title: '添加成功',
          });
        }, (res) => {
          wx.showToast({
            image: '/images/icon/icon_error.png',
            title: res.errmsg
          });
        });
        // cartHelper.addToCart(goodsId, 1, checkedProduct.id).then((res) => {
        //   if (res.errmsg == 0) {
        //     wx.hideLoading();
        //     wx.showToast({
        //       title: '添加成功',
        //     });
        //   } else {
        //     wx.showToast({
        //       image: '/images/icon/icon_error.png',
        //       title: res.errmsg
        //     });
        //   };
        // });
      }
    });
  },
  addToCartFromDrawer: function (event) {
    const {
      detail
    } = event;
    const {
      goodsId,
      productId
    } = detail;
    let {
      number
    } = detail;
    if (!number) {
      number = 1;
    }
    const that = this;
    // Submit the request to add the item to cart
    cartHelper.addToCart(goodsId, number, productId, () => {
      wx.hideLoading();
      wx.showToast({
        title: '添加成功',
      });
      that.setData({
        drawerOpened: false
      });
    }, (res) => {
      wx.showToast({
        image: '/images/icon/icon_error.png',
        title: res.errmsg
      });
      that.setData({
        drawerOpened: false
      });
    });
  }
})