/**
 * Functionality that relates to add to cart
 */
const util = require('../utils/util');
const api = require('../config/api');

/**
 * A flag to indicate whether the function is running
 */
let isAdding = false;

/** 
 * Get the detail information of the product (a.k.a. goods)
 * @param {number} id 
 * @param {function} onSuccess
 * @param {function} onError
 */
function getGoodsInfo(id, onSuccess, onError) {
  return util.request(api.GoodsDetail, {
    id
  }).then((res) => {
    if (res.errno === 0) {
      onSuccess && onSuccess(res.data, res);
    } else {
      util.showErrorToast(res.errmsg)
      return onError(res);
    }
  });
}

/**
 * General function to add an item to cart
 * Can be used by passing onSuccess and onFail functions, or use as a promise (followed by `.then` and `.catch`)
 * 
 * Example:
 * ```
 * cartHelper.addToCart(goodsId, 1, checkedProduct.id, () => {
    // handle success
  }, (res) => {
    // handle fail
  });
  ```
  Or
  ```
  cartHelper.addToCart(goodsId, 1, checkedProduct.id).then((res) => {
    // Be ware that res.errmsg !== 0 will not trigger catch
    if (res.errno == 0) {
      // on success
    } else {
      // on fail
    };
  }).catch((err) => {
    // Error handling, be ware that failed response (errno != 0) will goes to `.then`
  });
  ```
 * 
 * @param {number} id
 * @param {number} number How many items to buy, default: 1
 * @param {number} productId
 * @param {function} onSuccess 
 * @param {function} onFail
 */
function addToCart(id, number = 1, productId, onSuccess, onFail) {
  return new Promise((resolve, reject) => {
    util.request(api.CartAdd, {
      addType: 0,
      goodsId: id,
      number: number,
      productId: productId
    }, "POST").then((res) => {
      let _res = res;
      if (_res.errno == 0) {
        onSuccess && onSuccess(_res);
        updateTabCount();
      } else {
        onFail && onFail(_res);
      }
      resolve(_res);
    }).catch((error) => {
      reject(error);
    });
  });
};

function updateTabCount() {
  const CART_INDEX = 2;
  util.request(api.CartGoodsCount).then(function (res) {
    if (res.errno === 0) {
      let cartGoodsCount = '';
      if (res.data.cartTotal.goodsCount == 0) {
        wx.removeTabBarBadge({
          index: CART_INDEX,
        })
      } else {
        cartGoodsCount = res.data.cartTotal.goodsCount + '';
        wx.setTabBarBadge({
          index: CART_INDEX,
          text: cartGoodsCount
        })
      }
    }
  });
}

// ----- UNUSED FUNCTIONS ------
// The following functions are the common logic in goods page, mainly used for the specification drawer
// As it is too complicated to pass the data to external functions instead of internal methods, 
// these functions are not used
// /**
//  * Get the chosen value in the specification list
//  */
// function getCheckedSpecValue(specificationList) {
//   let checkedValues = [];
//   let _specificationList = specificationList;
//   let _checkedObj = {
//     nameId: _specificationList.specification_id,
//     valueId: 0,
//     valueText: ''
//   };
//   for (let j = 0; j < _specificationList.valueList.length; j++) {
//     if (_specificationList.valueList[j].checked) {
//       _checkedObj.valueId = _specificationList.valueList[j].id;
//       _checkedObj.valueText = _specificationList.valueList[j].value;
//     }
//   }
//   checkedValues.push(_checkedObj);
//   return checkedValues;
// };

// /**
//  * Check whether the specification is chosen
//  */
// function checkAllSpecChosen(productInfo) {
//   const {
//     specificationList
//   } = productInfo;
//   return getCheckedSpecValue(specificationList).some(function (v) {
//     if (v.valueId == 0) {
//       return true;
//     }
//   });
// };

// function getCheckedSpecKey(specificationList) {
//   let checkedValue = getCheckedSpecValue(specificationList).map(function (v) {
//     return v.valueId;
//   });
//   return checkedValue.join('_');
// }

// function getCheckedProductItem(productList, key) {
//   return productList.filter(function (v) {
//     if (v.goods_specification_ids == key) {
//       return true;
//     } else {
//       return false;
//     }
//   });
// }

// /**
//  * Fetch the specifications of a product before adding it to the cart
//  * @param {number} id The id of the product
//  */
// function fetchSepecificationBeforeSubmit(id, drawerOpened = false, openDrawerHandler = null, onSuccess = null, onError = null) {
//   getGoodsInfo(id, (resData, res) => {
//     console.log(resData);

//     if (res.errno !== 0) {
//       util.showErrorToast(res.errmsg)
//       onError && onError(res);
//       return false;
//     }

//     let userInfo = wx.getStorageSync('userInfo');
//     if (userInfo == '') {
//       return false;
//     }

//     const {
//       productList,
//       specificationList
//     } = resData;

//     let productLength = productList.length;
//     console.log({
//       productList,
//       specificationList
//     })

//     if (drawerOpened === false && productLength != 1) {
//       // Open drawer to allow user to select specification
//       openDrawerHandler && openDrawerHandler();
//       return;
//     } else {
//       // 提示选择完整规格
//       if (!checkAllSpecChosen(specificationList)) {
//         wx.showToast({
//           image: '/images/icon/icon_error.png',
//           title: '请选择规格',
//         });
//         onError();
//         return false;
//       }

//       // 根据选中的规格，判断是否有对应的sku信息
//       let checkedProductArray = getCheckedProductItem(productList, getCheckedSpecKey(specificationList));
//       if (!checkedProductArray || checkedProductArray.length <= 0) {
//         // 找不到对应的product信息，提示没有库存
//         wx.showToast({
//           image: '/images/icon/icon_error.png',
//           title: '库存不足',
//         });
//         return false;
//       }

//       let checkedProduct = checkedProductArray[0];
//       //验证库存
//       if (checkedProduct.goods_number < this.data.number) {
//         //要买的数量比库存多
//         wx.showToast({
//           image: '/images/icon/icon_error.png',
//           title: '库存不足',
//         });
//         return false;
//       }

//       onSuccess && onSuccess();
//     }
//   });
// }

module.exports = {
  addToCart,
  getGoodsInfo,
  updateTabCount,
  // fetchSepecificationBeforeSubmit,
};