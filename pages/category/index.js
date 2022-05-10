const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const cartService = require('../../services/cart');

Page({
  data: {
    navList: [],
    categoryList: [],
    currentCategory: {},
    goodsCount: 0,
    nowIndex: 0,
    nowId: 0,
    list: [],
    allPage: 1,
    allCount: 0,
    size: 9,
    hasInfo: 0,
    showNoMore: 0,
    loading: 0,
    index_banner_img: 0,
    // Specification drawer
    drawerOpened: false,
    productInfo: {},
  },
  onLoad: function (options) {},
  getChannelShowInfo: function (e) {
    let that = this;
    util.request(api.ShowSettings).then(function (res) {
      if (res.errno === 0) {
        let index_banner_img = res.data.index_banner_img;
        that.setData({
          index_banner_img: index_banner_img
        });
      }
    });
  },
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading()
    this.getCatalog();
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  getCatalog: function () {
    //CatalogList
    let that = this;
    util.request(api.CatalogList).then(function (res) {
      that.setData({
        navList: res.data.categoryList,
      });
    });
    util.request(api.GoodsCount).then(function (res) {
      that.setData({
        goodsCount: res.data.goodsCount
      });
    });
  },
  getCurrentCategory: function (id) {
    let that = this;
    util.request(api.CatalogCurrent, {
      id: id
    }).then(function (res) {
      that.setData({
        currentCategory: res.data
      });
    });
  },
  getCurrentList: function (id) {
    let that = this;
    util.request(api.GetCurrentList, {
      size: that.data.size,
      page: that.data.allPage,
      id: id
    }, 'POST').then(function (res) {
      if (res.errno === 0) {
        let count = res.data.count;
        that.setData({
          allCount: count,
          allPage: res.data.currentPage,
          list: that.data.list.concat(res.data.data),
          showNoMore: 1,
          loading: 0,
        });
        if (count == 0) {
          that.setData({
            hasInfo: 0,
            showNoMore: 0
          });
        }
      }
    });
  },
  onShow: function () {
    this.getChannelShowInfo();
    let id = this.data.nowId;
    let nowId = wx.getStorageSync('categoryId');
    if (id == 0 && nowId === 0) {
      return false
    } else if (nowId == 0 && nowId === '') {
      this.setData({
        list: [],
        allPage: 1,
        allCount: 0,
        size: 9,
        loading: 1
      })
      this.getCurrentList(0);
      this.setData({
        nowId: 0,
        currentCategory: {}
      })
      wx.setStorageSync('categoryId', 0)
    } else if (id != nowId) {
      this.setData({
        list: [],
        allPage: 1,
        allCount: 0,
        size: 9,
        loading: 1
      })
      this.getCurrentList(nowId);
      this.getCurrentCategory(nowId);
      this.setData({
        nowId: nowId
      })
      wx.setStorageSync('categoryId', nowId)
    }

    this.getCatalog();
  },
  switchCate: function (e) {
    let id = e.currentTarget.dataset.id;
    let nowId = this.data.nowId;
    if (id == nowId) {
      return false;
    } else {
      this.setData({
        list: [],
        allPage: 1,
        allCount: 0,
        size: 9,
        loading: 1
      })
      if (id == 0) {
        this.getCurrentList(0);
        this.setData({
          currentCategory: {}
        })
      } else {
        wx.setStorageSync('categoryId', id)
        this.getCurrentList(id);
        this.getCurrentCategory(id);
      }
      wx.setStorageSync('categoryId', id)
      this.setData({
        nowId: id
      })
    }
  },
  onBottom: function () {
    let that = this;
    if (that.data.allCount / that.data.size < that.data.allPage) {
      that.setData({
        showNoMore: 0
      });
      return false;
    }
    that.setData({
      allPage: that.data.allPage + 1
    });
    let nowId = that.data.nowId;
    if (nowId == 0 || nowId == undefined) {
      that.getCurrentList(0);
    } else {
      that.getCurrentList(nowId);
    }
  },
  openDrawer: function () {
    this.setData({
      drawerOpened: true
    });
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

    wx.showLoading({
      title: '正在添加...',
    })

    var that = this;
    cartService.getGoodsInfo(goodsId, function onSuccess(resData) {
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
        that.openDrawer();
      }

      that.setData({
        productInfo: productInfo
      });

      if (onlyOneSpec) {
        // Submit the request to add the item to cart
        cartService.addToCart(
          goodsId,
          1,
          checkedProduct.id,
          () => {
            wx.hideLoading();
            wx.showToast({
              title: '添加成功',
            });
          },
          () => {
            wx.showToast({
              image: '/images/icon/icon_error.png',
              title: _res.errmsg
            });
          })
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
    const checkedProductId = detail.chosenProduct;
    const that = this;
    // Submit the request to add the item to cart
    cartService.addToCart(goodsId, number, productId, (res) => {
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
        title: _res.errmsg
      });
      that.setData({
        drawerOpened: false
      });
    });
  }
})