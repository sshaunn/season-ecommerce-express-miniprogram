// components/specifcationDrawer.js
Component({
  /**
   * Properties of the component
   */
  properties: {
    isOpen: Boolean,
    productInfo: Object,
  },
  /**
   * Initial internal data of the component
   */
  data: {
    isOpen: false,
    // Indicates the checked specification
    tmpSpecText: '请选择规格和数量',
    priceChecked: false,
    checkedSpecPrice: 0,
    checkedSpecText: '',
    number: 1,
    goodsNumber: 0,
    disabled: false,
    disabledEntireForm: true, // disable submission button before selecting specification
  },
  pageLifetimes: {
    show: function () {
      if (this.data.productInfo.specificationList !== undefined) {
        this.changeSpecInfo();
      }
    }
  },
  /**
   * Methods of the component
   */
  methods: {
    preventBubble: function () {}, // prevent event bubbling
    getCheckedSpecValue: function () {
      let checkedValues = [];
      let _specificationList = this.data.productInfo.specificationList;
      checkedValues = _specificationList.valueList.filter((item) => {
        return !!item.checked
      }).map((item) => {
        return {
          nameId: _specificationList.specification_id,
          valueId: item.id,
          valueText: item.value
        };
      });
      return checkedValues;
    },
    getCheckedProductItem: function (key) {
      return this.data.productInfo.productList.filter(function (v) {
        if (v.goods_specification_ids == key) {
          return true;
        } else {
          return false;
        }
      });
    },
    /**
     * Determine whether the specification has been selected
     */
    isCheckedAllSpec: function () {
      const checkedSpecValues = this.getCheckedSpecValue();
      if (!checkedSpecValues || checkedSpecValues.length <= 0) {
        return false;
      }
      return !checkedSpecValues.some(function (v) {
        if (v.valueId == 0) {
          return true;
        }
      });
    },
    getCheckedSpecKey: function () {
      let checkedValue = this.getCheckedSpecValue().map(function (v) {
        return v.valueId;
      });
      return checkedValue.join('_');
    },
    changeSpecInfo: function () {
      let checkedNameValue = this.getCheckedSpecValue();
      this.setData({
        disabled: false,
        number: 1
      });
      //设置选择的信息
      let checkedValue = checkedNameValue.filter(function (v) {
        if (v.valueId != 0) {
          return true;
        } else {
          return false;
        }
      }).map(function (v) {
        return v.valueText;
      });
      if (checkedValue.length > 0) {
        this.setData({
          tmpSpecText: '已选择：' + checkedValue.join('　'),
          priceChecked: true
        });
      } else {
        this.setData({
          tmpSpecText: '请选择规格和数量',
          priceChecked: false
        });
      }
      if (this.isCheckedAllSpec()) {
        this.setData({
          checkedSpecText: this.data.tmpSpecText
        });

        // 点击规格的按钮后
        // 验证库存
        let checkedProductArray = this.getCheckedProductItem(this.getCheckedSpecKey());
        if (!checkedProductArray || checkedProductArray.length <= 0) {
          this.setData({
            disabledEntireForm: true
          });
          wx.showToast({
            title: '规格所对应货品不存在',
            icon: 'none'
          });
          return;
        }
        let checkedProduct = checkedProductArray[0];
        if (checkedProduct.goods_number < this.data.number) {
          //找不到对应的product信息，提示没有库存
          this.setData({
            checkedSpecPrice: checkedProduct.retail_price,
            goodsNumber: checkedProduct.goods_number,
          });
          wx.showToast({
            image: '/images/icon/icon_error.png',
            title: '库存不足',
          });
          return false;
        }
        if (checkedProduct.goods_number > 0) {
          this.setData({
            checkedSpecPrice: checkedProduct.retail_price,
            goodsNumber: checkedProduct.goods_number,
            disabledEntireForm: false
          });

          var checkedSpecPrice = checkedProduct.retail_price;

        } else {
          this.setData({
            checkedSpecPrice: this.data.productInfo.retail_price,
          });
        }
      } else {
        this.setData({
          checkedSpecText: '请选择规格和数量',
          checkedSpecPrice: this.data.productInfo.info.retail_price,
          disabledEntireForm: true,
        });
      }
    },

    closeAttr: function () {
      this.setData({
        isOpen: false,
        disabledEntireForm: true
      });
      this.triggerEvent('toggleDrawer', {
        isOpen: false
      })
    },

    openAttr: function () {
      this.setData({
        isOpen: true
      });
      this.triggerEvent('toggleDrawer', {
        isOpen: true
      })
    },

    inputNumber: function (event) {
      let number = event.detail.value;
      const checkedProductArray = this.getCheckedProductItem(this.getCheckedSpecKey());
      if (checkedProductArray.length > 0) {
        const maxStockNumber = checkedProductArray[0].goods_number;
        this.setData({
          number: Math.min(number, maxStockNumber)
        });
      } else {
        this.setData({
          number: number
        });
      }
    },

    clickSkuValue: function (event) {
      // goods_specification中的id 要和product中的goods_specification_ids要一样
      let that = this;
      let specNameId = event.currentTarget.dataset.nameId;
      let specValueId = event.currentTarget.dataset.valueId;
      let index = event.currentTarget.dataset.index;
      //判断是否可以点击
      let _specificationList = this.data.productInfo.specificationList;
      if (_specificationList.specification_id == specNameId) {
        for (let j = 0; j < _specificationList.valueList.length; j++) {
          if (_specificationList.valueList[j].id == specValueId) {
            //如果已经选中，则反选
            if (_specificationList.valueList[j].checked) {
              _specificationList.valueList[j].checked = false;
            } else {
              _specificationList.valueList[j].checked = true;
            }
          } else {
            _specificationList.valueList[j].checked = false;
          }
        }
      }
      this.setData({
        'productInfo.specificationList': _specificationList
      });
      this.changeSpecInfo();
    },

    addNumber: function (e) {
      let checkedProductArray = this.getCheckedProductItem(this.getCheckedSpecKey());
      if (checkedProductArray.length === 0) {
        this.setData({
          disabled: true
        })
        wx.showToast({
          icon: 'none',
          title: '请先选择规格',
        })
        return false;
      }
      this.setData({
        number: Number(this.data.number) + 1
      });
      let checkedProduct = checkedProductArray[0];
      var check_number = this.data.number + 1;
      if (checkedProduct.goods_number < check_number) {
        wx.showToast({
          image: '/images/icon/icon_error.png',
          title: '库存不足',
        });
        this.setData({
          disabled: true
        });
      }
    },

    cutNumber: function (event) {
      this.setData({
        number: (this.data.number - 1 > 1) ? this.data.number - 1 : 1
      });
      this.setData({
        disabled: false
      });
    },

    addToCart: function () {
      // Find out the selected product
      const chosenProduct = this.getCheckedProductItem(this.getCheckedSpecKey())[0];
      if (!chosenProduct) {
        wx.showToast({
          title: '请选择规格',
          icon: 'none'
        });
        return;
      }
      this.triggerEvent('addToCartFromDrawer', {
        goodsId: this.data.productInfo.info.id,
        number: this.data.number,
        productId: chosenProduct.id,
        // Extra info
        chosenProduct: chosenProduct,
        productInfo: this.data.productInfo,
      });
    }
  }
})