// const ApiRootUrl = 'http://10.0.0.10:8360/api/';
let remoteDevServerUrl = 'http://localhost:8360';
remoteDevServerUrl = 'http://52.62.171.204:8360'; // Staging server

// const ApiRootUrl = 'https://www.hiolabs.com/api/';
let seasonServerUrl = 'https://season.happyhackers.com.cn';
const ApiRootUrl = `${seasonServerUrl}/api/`;

module.exports = {
    // 远程服务器
   // Server: remoteDevServerUrl + '/',
   Server: seasonServerUrl + '/',
    // 登录
    AuthLoginByWeixin: ApiRootUrl + 'auth/loginByWeixin', //微信登录
    // 首页
    IndexUrl: ApiRootUrl + 'index/appInfo', //首页数据接口
    // 分类 
    CatalogList: ApiRootUrl + 'catalog/index', //分类目录全部分类数据接口
    CatalogCurrent: ApiRootUrl + 'catalog/current', //分类目录当前分类数据接口
    GetCurrentList: ApiRootUrl + 'catalog/currentlist',
    // 购物车
    CartAdd: ApiRootUrl + 'cart/add', // 添加商品到购物车
    CartList: ApiRootUrl + 'cart/index', //获取购物车的数据
    CartUpdate: ApiRootUrl + 'cart/update', // 更新购物车的商品
    CartDelete: ApiRootUrl + 'cart/delete', // 删除购物车的商品
    CartChecked: ApiRootUrl + 'cart/checked', // 选择或取消选择商品
    CartGoodsCount: ApiRootUrl + 'cart/goodsCount', // 获取购物车商品件数
    CartCheckout: ApiRootUrl + 'cart/checkout', // 下单前信息确认
    // 商品
    GoodsCount: ApiRootUrl + 'goods/count', //统计商品总数
    GoodsDetail: ApiRootUrl + 'goods/detail', //获得商品的详情
    GoodsList: ApiRootUrl + 'goods/list', //获得商品列表
    GoodsShare: ApiRootUrl + 'goods/goodsShare', //获得商品的详情
    SaveUserId: ApiRootUrl + 'goods/saveUserId',
    // 收货地址
    AddressDetail: ApiRootUrl + 'address_au/addressDetail', // Get address detail
    DeleteAddress: ApiRootUrl + 'address_au/deleteAddress', // DELETE the address
    UpdateAddress: ApiRootUrl + 'address_au/updateAddress', // POST: Update an existing address
    GetAddresses: ApiRootUrl + 'address_au/getAddresses', // GET a list of addresses
    AddAddress: ApiRootUrl + 'address_au/addAddress', // POST a new address
    PickupAddresses: ApiRootUrl + 'pickup_point/getAllPickupPoints',
    RegionList: ApiRootUrl + 'region/list', //获取区域列表
    PayPrepayId: ApiRootUrl + 'pay_au/preWeixinPay', //获取微信统一下单prepay_id
    OrderSubmit: ApiRootUrl + 'order_au/submit', // 提交订单
    confirmImage: ApiRootUrl + 'order_au/uploadScreenshot', // 确认支付截图
    uploadScreenshot: ApiRootUrl + 'fileUpload/upload', // 上传支付截图
    OrderList: ApiRootUrl + 'order_au/list', //订单列表
    OrderDetail: ApiRootUrl + 'order_au/detail', //订单详情
    OrderDelete: ApiRootUrl + 'order_au/delete', //订单删除
    OrderCancel: ApiRootUrl + 'order_au/cancel', //取消订单
    OrderConfirm: ApiRootUrl + 'order_au/confirm', //物流详情
    OrderCount: ApiRootUrl + 'order_au/count', // 获取订单数
    OrderCountInfo: ApiRootUrl + 'order_au/orderCount', // 我的页面获取订单数状态
    OrderExpressInfo: ApiRootUrl + 'order/express', //物流信息
    OrderGoods: ApiRootUrl + 'order_au/orderGoods', // 获取checkout页面的商品列表
    // 足迹
    FootprintList: ApiRootUrl + 'footprint/list', //足迹列表
    FootprintDelete: ApiRootUrl + 'footprint/delete', //删除足迹
    // 搜索
    SearchIndex: ApiRootUrl + 'search/index', //搜索页面数据
    SearchHelper: ApiRootUrl + 'search/helper', //搜索帮助
    SearchClearHistory: ApiRootUrl + 'search/clearHistory', //搜索帮助
    ShowSettings: ApiRootUrl + 'settings/showSettings',
    SaveSettings: ApiRootUrl + 'settings/save',
    SettingsDetail: ApiRootUrl + 'settings/userDetail',
    GetBase64: ApiRootUrl + 'qrcode/getBase64', //获取商品详情二维码

};
