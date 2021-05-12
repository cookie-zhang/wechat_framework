/**
 * Created by zjf
 */
function config() {
}

config.prototype = {
    // debug: true,
    debug: false,
    version: '1.0.0', // 版本号 正式: v1.0.0 体验: v0.0.1
    appName: 'demo', // 内容展示小程序

    tokenKey: '',
    env: 'pro', // 切换版本提交正式必须改为 pro): dev 开发 | test  测试 | pro 生产
    defaultPage: 1,// 页码 默认1
    defaultPageSize: 15,// 每页数 默认15
    appId: '',// appId
    appIndex: 'pages/home/index',// app的第一个页面, 分享时如果没定义那个页面就默认分享这个配置的页面
    shareTitle: '',// app分享时的公共title
    /**
     * 服务器地址
     */
    host: {
        oss:'', // oss图片地址
        pro:'',  // 生产环境
        test: '',// 测试环境
        dev: '', // 开发环境
        photo: '',
    },
    /**
     * 小程序订阅消息-我的模板
     */
    subscribeMessage: {
        couponExpired: 'G0etBTww6PdZBK4q6NDSdY8Xl2W2vO8q3BTxqku-_HY', // 优惠卷过期
    },

    formIdType: {
        // 导航
        navigation: 1,
    },
    /**
     * local storage keys对象
     */
    sessionKeyExpireTime: 1000 * 60 * 60 * 24 * 7 - 5000,
    promoCodeExpireTime: 1000 * 60 * 60 * 24 * 7 ,
    LSKeys: {
        SessionKey: 'SessionKey',
        userInfo: 'userInfo',
        checkLogin: 'checkLogin_{today}',
        systemInfo: 'systemInfo',
        storeInfo: 'storeInfo',
        promoCode: 'promoCode',
        applyStoreData: 'applyStoreData', // 门店申请数据缓存
        elapsePopUpList: 'currentPopUp', // 已跳过的弹窗id数组
        inviteListRoomId: 'inviteListRoomId', // 已确认的直播邀请码
        couponId: 'couponId', // 领取优惠券Id
    },
    pages: {
        home: {
            index: 'pages/home/index'
        }
    },
    /**
     * 接口地址对象
     */
    apiUrls: {
        ajaxUpload: '/app/ajaxUpload.do', // 参数为 base64Str
        user: {
            login: '/app/account/login.do'
        }
    }
};

config.prototype.constructor = config;
module.exports = new config();
