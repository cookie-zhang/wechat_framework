/**
 * Created by zjf.
 */
function base() { };

var _ = require('./underscore.js');
var _c = require('./config.js');
var _t = require('../templates/temps.js');
var _q = require('./q.js');
var event = require('./event.js');
var _wx = require('./wx.js');
var api = require('./api.js')

/**
 * 将 Date 转化为指定格式的String
 * 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 * 例子：
 * formatTime(new Date(),'yyyy-MM-dd hh:mm:ss.S'); ==> 2006-07-02 08:09:04.423
 * formatTime(new Date(),'yyyy-M-d h:m:s.S'); ==> 2006-7-2 8:9:4.18
 * @param {[type]} fmt [description]
 */
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

base.prototype = {

    /**
     * 数据管理器 dm = data manager
     */
    dm: {
        isRefuseAuthorization: false, // 是否拒绝授权获取用户信息,默认false
        sessionKey: '234234', // 登录后token
        canLoadMore: 1, // 全局可以请求ajax
        preUrl: '', // 页面调用用方法跳转时,前一个页面是什么,防止点击多次
        param: {}, // 页面调用方法跳转时,所带的参数是什么
        userInfo: '', // 用户信息
        userInfoRes: '', // 微信返回的登录信息,包括加密后的信息encryptedData,iv等信息
        wxLoginCode: '', //  微信登录的login code(登录凭证),使用code 换取 session_key api，将 code 换成 openid 和 session_key
    },
    getUserInfo: function () {
        let _g = this;
        return _g.getLS(_c.LSKeys.userInfo);
    },
    /**
     * 初始化页面对象
     * @param options
     * @returns {{data: {}, pm: {param: {}, data: {}}, onLoad: onLoad, onReady: onReady, onShow: onShow, onHide: onHide, onUnload: onUnload, onShareAppMessage: onShareAppMessage, onPullDownRefresh: onPullDownRefresh, onReachBottom: onReachBottom, back: back, home: home}}
     */
    initPage: function (options) {
        var _g = this;
        var onLoad = options.onLoad; // 重写onLoad
        var onShow = options.onShow; // 重写onShow
        var onHide = options.onHide; // 重写onHide
        var onReady = options.onReady; // 重写onReady
        var onUnload = options.onUnload; // 重写onUnload
        var onPageScroll = options.onPageScroll;
        var methods = options.methods || {}; // 页面中的方法
        var temps = options.temps || {}; // 页面中的模板
        options.data.host = _g.getHost();
        options.data.ossHost = _c.host['oss'];
        options.data.currentTime = 0;
        //长按/双击/单击的判断
        options.data.touchStartTime = 0;
        options.data.touchEndTime = 0;
        options.data.lastTapTime = 0;
        // 单击事件点击后要触发的函数
        options.data.lastTapTimeoutFunc = null;
        options.data.isLogin = false;
        options.data.myLocation = {
            lon: 112.59000,
            lat: 28.12000
        };
        options.data.hiddenLoginPopup = true;
        options.data.safeAreaBottom = _g.getLS('hasSafeArea') ? 14 : 0;
        var page = {
            data: options.data || {},
            onLoad: function (options) {
                var self = this;
                var mainRoute = [
                    'pages/home/index',
                    'pages/me/index'
                ];
                if (mainRoute.indexOf(self.route) > -1) wx.hideTabBar();
                self.data.prePageUrl = _g.dm.prePageUrl || ''; // 前一个页面的url路径
                self.data.openTimes = 0; // 页面打开次数 默认0
                self.data.page = _c.defaultPage; // 页码 默认1
                self.data.pageSize = _c.defaultPageSize; // 每页数 默认20

                // param 页面自定方法传递的参数
                console.log(_g.dm.param)
                if (_g.j2s(_g.dm.param) != '{}') {
                    _.each(_g.dm.param, function (val, key) {
                        self.data[key] = val;
                    });
                }

                // 原始方式/分享页面传递单数兼容
                console.log(options);
                if (_g.j2s(options) != '{}') {
                    _.each(options, function (val, key) {
                        self.data[key] = val;
                    });
                    if (options.promoCode) {
                        _g.setLS(_c.LSKeys.promoCode, options.promoCode, _c.promoCodeExpireTime)
                    }
                    if (options.couponId) {
                        _g.setLS(_c.LSKeys.couponId, options.couponId, _c.promoCodeExpireTime)
                    }
                }

                //小程序码进入
                const scene = decodeURIComponent(options.scene);
                console.log(scene);
                if (scene != 'undefined') {
                    const sceneData = _g.getDataByUrl(scene);
                    console.log(sceneData, 'line134');
                    _.each(sceneData, (val, key) => {
                        if (key == 'pF') { //平台标识
                            self.data['platformFlag'] = val;
                        } else if (key == 'p') { //邀请码
                            self.data['promoCode'] = val;
                        } else if(key == 'tId'){
                            self.data['thirdId'] = val;
                        } else if (key == 'cid') {
                            self.data['couponId'] = val;
                        } else {
                            self.data[key] = val;
                        }
                    });

                    if (sceneData.promoCode) {
                        _g.setLS(_c.LSKeys.promoCode, sceneData.promoCode, _c.promoCodeExpireTime);
                    }
                    if (sceneData.p) {
                        _g.setLS(_c.LSKeys.promoCode, sceneData.p, _c.promoCodeExpireTime);
                    }
                    if (sceneData.cid) {
                        _g.setLS(_c.LSKeys.couponId, sceneData.cid, _c.promoCodeExpireTime);
                    }
                }

                // 重置模板data
                var tempsData = {};
                // _.each(self.data, function (tempVal, tempKey) {
                _.each(temps, function (tempVal, tempKey) {
                    var tempData = tempVal.data;
                    var tempOriginObj = _g.clone(_t[tempKey]);
                    if (tempData && _g.j2s(tempData) != '{}') {
                        _.each(tempData, function (tempDataVal, tempDataKey) {
                            tempOriginObj.data[tempDataKey] = tempDataVal;
                        });
                    }
                    tempsData[tempKey + 'Constant'] = tempOriginObj.data;
                });
                self.setData({
                    ...tempsData,
                    ...self.data
                })
                if (!_g.getLS('SessionKey')) {
                    _g.setLS('loginExpired', 1); //登录过期标志
                    const Http = require('./http.js')
                    self.login({
                        Http: Http
                    })
                }
                if (_g.getLS(_c.LSKeys.userInfo) &&
                    self.route != 'pages/home/index' &&
                    _g.getLS(_c.LSKeys.promoCode)) {
                    _g.userLinkUser(self);
                }
                event.on('loginListener', self, () => {
                    //登录成功后页面调用
                    if (_g.getLS(_c.LSKeys.promoCode) &&
                        self.route != 'pages/home/index') {
                        _g.userLinkUser(self).then(()=>{
                            self.loginSuc();
                        }).catch((err) => {
                            self.loginSuc();
                        });
                    }else {
                        self.loginSuc();
                    }

                })
                event.on('authorizeListener', self, () => {
                    //授权成功后调用
                    self.authorizeSuc();
                })
                // 执行页面自定义的 onLoad 方法
                onLoad && onLoad(self);
            },
            onReady: function () {
                // 执行页面自定义的 onReady 方法
                onReady && onReady(this);
            },
            onShow: function () {
                var self = this;
                wx.login({
                    success(res) {
                        if (res.code) {
                            // detail.code = res.code;
                            self.data.jsCode = res.code;
                        }
                    }
                })
                self.data.openTimes++; // 页面打开次数自增
                setTimeout(function () {
                    _g.dm.preUrl = ''; // 防触摸多次打开多个页面标志 临时记录每个跳转页面的前一个页面地址(url)
                }, 500);
                if (self.data.openTimes >= 2) {
                    // 在第二次打开的时候 执行页面自定义的 onShow 方法
                    onShow && onShow(self);
                }
            },
            onHide: function () {
                // 执行页面自定义的 onShow 方法
                onHide && onHide(this);
            },
            onUnload: function () {
                // 执行页面自定义的 onUnload 方法
                event.remove('loginListener', this);
                onUnload && onUnload(this);
            },
            onShareAppMessage: function (res) {
                if (res.from === 'button') {
                    // 来自页面内转发按钮
                    _g.logger(res.target);
                }
                return _g.shareAppMsg({});
            },
            // 下拉刷新
            onPullDownRefresh: function () {
                var self = this;
                self.data.page = 1;
                if (self.getData) {
                    self.getData();
                }
            },
            // 底部翻页
            onReachBottom: function () {
                var self = this;
                _g.logger('~~~ onReachBottom ~~~~');
                //如果不使用,直接重写 onReachBottom
                if (self.data.hasNextPage) {
                    // getPageData 方法 为页面定义的获取列表数据的方法
                    if (self.getPageData) {
                        self.getPageData();
                    }
                } else {
                    //没有下一页
                }
                _g.logger('~~~ onReachBottom ~~~~ self.data.page ', self.data.page);
            },
            onPageScroll: function (res) {
                // 执行页面自定义的 onShow 方法
                var self = this;
                self.pageScroll && self.pageScroll(res);
            },
            touchStart: function (e) {
                const self = this;
                self.touchStartTime = e.timeStamp;
            },
            touchEnd: function (e) {
                const self = this;
                if (self.data.lastTapTime != e.timeStamp) {
                    if (e.timeStamp - self.data.lastTapTime <= 400) {
                        self.doubleClick(e);
                    }
                }
                self.setData({
                    lastTapTime: e.timeStamp
                });
            },
            longPress: function (e) {
                console.log(e);
            },
            // doubleClick: function (e) {
            //     console.log(e);
            // }
            login: async function (opts) {
                let location;
                try {
                    location = await _wx.getLocation();
                } catch (e) {
                    console.log(e);
                }
                let code = opts.code;
                if (!code) {
                    code = await _wx.login();
                }
                let postData = {
                    url: _c.apiUrls.user.login,
                    data: {
                        lon: location && location.longitude,
                        lat: location && location.latitude,
                        jsCode: code,
                    },
                    lock: false,
                    isSync: false
                }
                let ret ='' // await opts.Http.ajax(postData)
                _g.rmLS('loginExpired');
                _g.setLS(_c.LSKeys.userInfo, ret.data)
                //_g.setLS(_c.LSKeys.SessionKey, ret.data.sessionKey); 
                // if (ret.data.store) {
                //     _g.setLS(_c.LSKeys.storeInfo, ret.data.store);
                // }
                event.emit('loginListener', ret.data);
            },
            loginSuc: function () {},
            authorizeSuc: function () {},
            // 跳转页面
            skipByUrl: async function  (item) {
                const self = this;
                if (item.isLink != 1) return;
                if (item.pageUrl == 'haohuo') {
                    //好货?不知道跳哪
                } else if (item.pageUrl == 'coupon') {
                    //领取优惠券
                    const postData = {
                        url: api.user.receiveCoupon,
                        data: {
                            couponId: value
                        },
                        isSync: true,
                        lock: true,
                    };
                    const { data } = await Http.ajax(postData);
                    if (data && data.status == 'success') {
                        _g.showModal({
                            content: '领取优惠券成功',
                        });
                    } else if (data && data.status == 'empty') {
                        _g.showModal({
                            content: '暂无此优惠券',
                        });
                    }
                } else if (item.pageUrl == 'pages/home/shop') {
                    //跳到首页
                    _g.switchTab({
                        url: item.pageUrl
                    }, self);
                } else if (item.pageUrl == 'pages/live/detail') {
                    //直播
                    _g.navigateTo({
                        url: item.pageUrl,
                        param: {
                            roomid: item.otherId
                        }
                    }, self);
                } else {
                    let id = item.pageUrl == 'pages/goods/detail' ? 'id': 'thirdId';
                    _g.navigateTo({
                        url: item.pageUrl,
                        param: {
                            [id]: item.otherId,
                            platformFlag: 1 // 默认商城专场
                        }
                    }, self);
                }
            }
        };

        // 初始化页面方法
        _.each(methods, function (val, key) {
            page[key] = val;
        });

        // 初始化模板
        _.each(temps, function (tempVal, tempKey) {
            page.data[tempKey] = tempKey; // 初始化模板名称
            // 初始化模板方法
            var tempOriginObj = _g.clone(_t[tempKey]);
            _.each(tempOriginObj.methods, function (mVal, mKey) {
                page[mKey] = mVal;
            });
            // 初始化页面模板重写方法
            var pageTempMethods = tempVal.methods || {};
            _.each(pageTempMethods, function (pageTempMethodVal, pageTempMethodKey) {
                page[pageTempMethodKey] = pageTempMethodVal;
            });
            // 初始化页面模板的data
            var tempData = tempVal.data;
            if (tempData && _g.j2s(tempData) != '{}') {
                _.each(tempData, function (tempDataVal, tempDataKey) {
                    tempOriginObj.data[tempDataKey] = tempDataVal;
                });
            }
            page.data[tempKey + 'Constant'] = tempOriginObj.data;
        });
        return page;
    },
    getMyInfo: async function () {
        const _g = this;
        const Http = require('./http.js');
        let postData = {
            url: api.user.getMyInfo,
            data: {},
            lock: false,
            isSync: false
        }
        let ret = await Http.ajax(postData);
        _g.setLS(_c.LSKeys.userInfo, ret.data.myInfo);
        if (ret.data.myInfo.store) {
            _g.setLS(_c.LSKeys.storeInfo, ret.data.myInfo.store);
        }
        return ret.data.myInfo
    },
    /**
     * 获取秒数
     * @param date
     * @returns {number}
     */
    getTimestamp: function (date) {
        var timestamp;
        if ((typeof date) == 'object') {
            timestamp = Date.parse(date);
        } else if (date && (typeof date) == 'string') {
            timestamp = Date.parse(new Date(date.replace(/-/g, "/")));
        } else {
            timestamp = Date.parse(new Date());
        }
        return timestamp / 1000;
    },

    /**
     * obj对象转为json格式的字符串
     * @param obj
     */
    j2s: function (obj) {
        return JSON.stringify(obj);
    },

    /**
     * json格式的字符串转为obj
     * @param str
     */
    s2j: function (str) {
        return JSON.parse(str);
    },

    /**
     * 对象克隆
     * @param obj
     * @returns {*}
     */
    clone: function (obj) {
        var _g = this;
        var o;
        if (typeof obj == "object") {
            if (obj === null) {
                o = null;
            } else {
                if (obj instanceof Array) {
                    o = [];
                    for (var i = 0, len = obj.length; i < len; i++) {
                        o.push(_g.clone(obj[i]));
                    }
                } else {
                    o = {};
                    for (var j in obj) {
                        o[j] = _g.clone(obj[j]);
                    }
                }
            }
        } else {
            o = obj;
        }
        return o;
    },

    /**
     * 获取随机字符串
     * @param len 长度
     * @returns {string}
     */
    randomString: function (len) {
        len = len || 32;
        var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
        /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        var maxPos = $chars.length;
        var str = '';
        for (var i = 0; i < len; i++) {
            str += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return str;
    },

    /**
     * 设置本地缓存
     * @param key
     * @param val
     * @param expireTime 毫秒数 有效时长
     */
    setLS: function (key, val, expireTime) {
        var _g = this;
        var value = {};
        value.val = val;
        if (expireTime) {
            value.expireTime = expireTime;
            value.saveTime = new Date().getTime();
        }
        try {
            wx.setStorageSync(key, _g.j2s(value));
        } catch (e) {
            console.log(e);
        }
    },

    /**
     * 获取本地缓存
     * @param key
     * @returns {*}
     */
    getLS: function (key) {
        var _g = this;
        var result = '';
        if (wx.getStorageSync(key)) {
            var value = _g.s2j(wx.getStorageSync(key));
            if (value.expireTime) {
                if ((new Date().getTime() - value.saveTime) <= value.expireTime) {
                    result = value.val;
                } else {
                    _g.rmLS(key);
                }
            } else {
                result = value.val;
            }
        }
        return result;
    },

    /**
     * 删除单个缓存
     * @param key
     */
    rmLS: function (key) {
        try {
            wx.removeStorageSync(key);
        } catch (e) {
            console.log(e);
        }
    },

    /**
     * 删除所有本地缓存
     */
    rmAllLS: function () {
        try {
            wx.clearStorageSync();
        } catch (e) {
            //console.log(e);
        }
    },

    /**
     * 设置顶部导航栏title
     * @param title
     */
    setNavigationBarTitle: function (title) {
        wx.setNavigationBarTitle({
            title: title
        });
    },

    /**
     * navigateTo 跳转页面
     * @param options
     */
    navigateTo: function (options, self) {
        var _g = this;
        if (_g.dm.preUrl == options.url) {
            return;
        }
        var self = self || options.self;
        _g.dm.prePageUrl = self.route;
        _g.dm.preUrl = options.url;
        _g.dm.param = options.param || {};
        console.log(_g.dm.param);
        var url = '/' + options.url;
        wx.navigateTo({
            url: url
        })
    },

    /**
     * openWin 跳转页面
     * 重写跳转页面方法
     * @param options
     */
    openWin: function (opts, normal) {
        var _g = this;
        var opts = _.extend({}, opts);
        var self = opts.self;
        if (!opts.url) return;
        if (normal) {
            //abandon
        } else {
            if (_g.dm.preUrl == opts.url) {
                return;
            }
            _g.dm.prePageUrl = self.route;
            _g.dm.preUrl = opts.url;
            _g.dm.param = opts.param || {};
            var mainPages = ['pages/home/index', 'pages/find/index', 'pages/me/index'];
            var url = '/' + opts.url;
            if (mainPages.indexOf(opts.url) > -1) {
                wx.switchTab({
                    url: opts.url
                });
                return;
            }
            wx.navigateTo({
                url: url
            })
        }
    },

    /**
     * redirectTo 跳转页面
     * @param options
     */
    redirectTo: function (options, self) {
        var _g = this;
        if (_g.dm.preUrl == options.url) {
            return;
        }
        var self = self || options.self;
        _g.dm.prePageUrl = self.route;
        _g.dm.preUrl = options.url;
        _g.dm.param = options.param || {};
        var url = '/' + options.url;
        wx.redirectTo({
            url: url
        });
    },
    reLaunch: function (options, self) {
        var _g = this;
        if (_g.dm.preUrl == options.url) {
            return;
        }
        var self = self || options.self;
        _g.dm.prePageUrl = self.route;
        _g.dm.preUrl = options.url;
        _g.dm.param = options.param || {};
        var url = '/' + options.url;
        wx.reLaunch({
            url: url
        });
    },
    /**
     * closeToWin 跳转页面
     * @param options
     */
    closeToWin: function () {

    },

    /**
     * switch跳转页面
     * @param options
     */
    switchTab: function (options, self) {
        var _g = this;
        if (_g.dm.preUrl == options.url) {
            return;
        }
        var self = self || options.self;
        _g.dm.prePageUrl = self.route;
        _g.dm.preUrl = options.url;
        var url = '/' + options.url;
        _g.dm.param = options.param || {};
        wx.switchTab({
            url: url
        });
    },

    /**
     * navigateBack 返回
     * @param delta 返回深度
     */
    navigateBack: function (delta) {
        if (getCurrentPages().length > 1) {
            wx.navigateBack({
                delta: delta || 1
            });
        } else {
            wx.switchTab({
                url: '/' + _c.appIndex
            })
        }
    },

    /**
     * closeWin 重写返回 返回
     * @param opts.delta 返回深度
     */
    closeWin: function (opts) {
        if (getCurrentPages().length > 1) {
            wx.navigateBack({
                delta: opts.delta || 1
            });
        } else {
            wx.redirectTo({
                url: '/' + _c.appIndex
            })
            // wx.switchTab({
            //     url: '/' + _c.appIndex
            // });
        }
    },
    /**
     * toast
     * @param msg options
     */
    toast: function (options) {
        /*if (options.mask == false) {
            options.mask = false;
        } else {
            options.mask = true;
        }*/
        wx.showToast({
            title: options.title || '', // 标题
            icon: options.icon || 'none', // 图标
            image: options.image || '', // 自定义图标的本地路径，image 的优先级高于 icon
            mask: options.mask || false, // 是否显示透明蒙层，防止触摸穿透，默认：false
            duration: options.duration || 1000, //提示的延迟时间
            success: function () {
                options.success && options.success();
            }
        });
    },

    /**
     * 隐藏toast
     */
    hideToast: function () {
        wx.hideToast();
    },

    /**
     * 预览图片
     * @param urlsArr
     */
    previewImage: function (urlsArr, index) {
        var index = index || 0;
        urlsArr = _.map(urlsArr, (item) => {
            if (item.indexOf('http') > -1) {
                return item;
            } else {
                return _c.host.photo + item;
            }
        });
        wx.previewImage({
            current: urlsArr[index], // 当前显示图片的http链接
            urls: urlsArr // 需要预览的图片http链接列表
        })
    },

    /**
     * 打开同一公众号下关联的另一个小程序。
     * @param options
     */
    navigateToMiniProgram: function (options) {
        if (!options) options = {};
        var envVersion = '';
        if (_c.env == 'dev') {
            envVersion = 'develop';
        } else if (_c.env == 'test') {
            envVersion = 'trial';
        } else if (_c.env == 'pro') {
            envVersion = 'release';
        }
        wx.navigateToMiniProgram({
            appId: options.appId || _c.appId, // 要打开的小程序 appId
            path: options.path || '', // 打开的页面路径，如果为空则打开首页
            extraData: options.extraData || {}, // 需要传递给目标小程序的数据，目标小程序可在 App.onLaunch()，App.onShow() 中获取到这份数据。
            envVersion: options.envVersion || envVersion, // 有效值 develop（开发版），trial（体验版），release（正式版）
            success(res) {
                // 打开成功
            }
        })
    },

    /**
     * 停止下拉刷新
     */
    stopPullDownRefresh: function () {
        wx.stopPullDownRefresh();
    },

    /**
     * 显示模态框
     * @param opts
     */
    showModal: function (opts) {
        var _g = this;
        wx.showModal({
            title: opts.title || '提示',
            content: opts.content,
            showCancel: opts.showCancel ? opts.showCancel : false,
            confirmColor: opts.confirmColor || '#FF2854',
            confirmText: opts.confirmText || '确定',
            cancelColor: opts.cancelColor || '#000000',
            cancelText: opts.cancelText || '取消',
            success: function (res) {
                if (res.confirm) {
                    _g.logger('用户点击确定');
                    opts.confirm && opts.confirm(res);
                } else if (res.cancel) {
                    _g.logger('用户点击取消');
                    opts.cancel && opts.cancel();
                }
            }
        })
    },

    /**
     * 定位
     * @returns {*}
     */
    getLocation: function (type) {
        var _g = this;
        return new Promise(function (resolve, reject) {
            _g.toast({
                title: '请稍等',
                icon: 'loading',
                duration: 1000
            });
            wx.getLocation({
                success: function (data) {
                    var key = 'LN7BZ-O4YC3-HGK3Q-YLMCP-A7YOO-KCFJI';
                    var getAddressUrl = 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + data.latitude + ',' + data.longitude + '&key=' + key + '&get_poi=1';
                    _g.dm.lat = data.latitude;
                    _g.dm.lon = data.longitude;
                    return resolve(data);
                    // wx.request({
                    //     url: getAddressUrl, //仅为示例，并非真实的接口地址
                    //     header: {
                    //         'content-type': 'application/json' // 默认值
                    //     },
                    //     success: function(res) {
                    //         if (res.data.status == 0) {

                    //             _g.dm.addr = res.data.result.address_component;
                    //         }
                    //         return resolve(_g.dm.addr);
                    //     },
                    //     fail: function(err) {
                    //         return reject(err);
                    //     }
                    // });
                },
                fail: function (e) {
                    if (e.errMsg == 'getLocation:fail auth deny') {
                        // _g.toast({title: '用户拒绝授权'});
                    }
                    return reject(e);
                }
            });
        })
    },

    /**
     * 根据配置文件中不同的环境获取不同的host
     * @returns {string}
     */
    getHost: function () {
        var host = '';
        if (_c.env == 'dev') {
            host = _c.host.dev;
        } else if (_c.env == 'test') {
            host = _c.host.test;
        } else if (_c.env == 'pro') {
            host = _c.host.pro;
        }
        return host;
    },

    /**
     * promiseWhile
     * @param condition
     * @param body
     * @returns {*}
     */
    promiseWhile: function (condition, body) {
        var done = _q.defer();

        function loop() {
            if (!condition()) return done.resolve();
            _q.when(body(), loop, done.reject);
        }

        _q.nextTick(loop);
        return done.promise;
    },

    /**
     * 图片处理,替换图片地址,可以动态裁剪
     * @param options
     * @returns {*|string}
     */
    imgGM: function (options) {
        var _g = this;
        var image = options.img || '';
        // console.log('_g.dm.useImgGM ', _g.dm.useImgGM);
        if (_g.dm.useImgGM == 1 && _c.env == 'pro') {
            // if (_c.env == 'pro') {
            if (image) {
                var w = options.width;
                var h = options.height || w;
                image = image.replace(_c.host.pro, _c.host.imgGM) + '?size=' + w + 'x' + h;
            }
        }
        return image;
    },

    /**
     * 分享对象
     * @param options
     * @returns {{title: string, path: string, success: success, fail: fail}}
     */
    shareAppMsg: function (options, successCallback) {
        var options = options || {};
        var _g = this;
        var title = options.title || _c.shareTitle,
            path = options.path || _c.appIndex;
        if (!options.param) options.param = {};
        if (_g.getLS(_c.LSKeys.userInfo)) {
            options.param.promoCode = _g.getLS(_c.LSKeys.userInfo).promoCode;
        }
        _.each(options.param, (val, key) => {
            if (path.indexOf('?') > -1) {
                path += `&${key}=${val}`
            } else {
                path += `?${key}=${val}`
            }
        })
        _g.logger('the path of shareAppMsg is ', path);
        return {
            title: title,
            path: path,
            imageUrl: options.imageUrl,
            success: function (res) {
                // 转发成功
                _g.logger('onShareAppMessage success : ', res);
            },
            fail: function (res) {
                // 转发失败
                _g.logger('onShareAppMessage fail : ', res);
            }
        };

    },

    /**
     * 数组去重
     * @param arr
     * @returns {Array}
     */
    arrUnique: function (arr) {
        var res = [];
        var json = {};
        for (var i = 0; i < arr.length; i++) {
            if (!json[arr[i]]) {
                res.push(arr[i]);
                json[arr[i]] = 1;
            }
        }
        return res;
    },

    /**
     * 输出日志
     * @param str obj
     */
    logger: function () {
        if (!_c.debug || _c.env == 'pro') return;
        this.logger = console.log;
    },

    /**
     * 验证手机号码
     * @param $poneInput
     * @returns {boolean}
     */
    isPhone: function (phone) {
        var myreg = /^[0-9]{11}$/;
        if (!myreg.test(phone)) {
            return false;
        } else {
            return true;
        }
    },

    /**
     * 参数排序
     * @param a
     * @param b
     * @returns {boolean|{}}
     */
    ksort: function (a, b) {
        var e, f, g, c = {},
            d = [],
            h = this,
            i = !1,
            j = {};
        switch (b) {
            case "SORT_STRING":
                e = function (a, b) {
                    return h.strnatcmp(a, b)
                };
                break;
            case "SORT_LOCALE_STRING":
                var k = this.i18n_loc_get_default();
                e = this.php_js.i18nLocales[k].sorting;
                break;
            case "SORT_NUMERIC":
                e = function (a, b) {
                    return a + 0 - (b + 0)
                };
                break;
            default:
                e = function (a, b) {
                    var c = parseFloat(a),
                        d = parseFloat(b),
                        e = c + "" === a,
                        f = d + "" === b;
                    return e && f ? c > d ? 1 : d > c ? -1 : 0 : e && !f ? 1 : !e && f ? -1 : a > b ? 1 : b > a ? -1 : 0
                }
        }
        for (g in a) a.hasOwnProperty(g) && d.push(g);
        for (d.sort(e), this.php_js = this.php_js || {}, this.php_js.ini = this.php_js.ini || {}, i = this.php_js.ini["phpjs.strictForIn"] && this.php_js.ini["phpjs.strictForIn"].local_value && "off" !== this.php_js.ini["phpjs.strictForIn"].local_value, j = i ? a : j, f = 0; f < d.length; f++) g = d[f], c[g] = a[g], i && delete a[g];
        for (f in c) c.hasOwnProperty(f) && (j[f] = c[f]);
        return i || j
    },

    /**
     * 参数格式化
     * @param json
     * @returns {string}
     */
    jsonToPostDataStr: function (json) {
        var PostDataStr = '';
        for (var i in json) {
            PostDataStr += i + '=' + json[i] + '&';
        }
        return PostDataStr == '' ? PostDataStr : PostDataStr.slice(0, -1);
    },

    /**
     * 年份是否是闰年
     * @param year
     * @returns boolean
     */
    isLeapYear: function (year) {
        if (((year % 4) == 0) && ((year % 100) != 0) || ((year % 400) == 0)) {
            return true;
        }
        else return false;
    },

    /**
     * 大小月
     * @param month, isLeap
     * @returns String
     */
    monthSize: function (month, isLeap) {
        const LARGE = [1, 3, 5, 7, 8, 10, 12];
        if (month == 2 && isLeap) return 28;
        if (month == 2 && !isLeap) return 29;
        if (LARGE.indexOf(month) > -1) return 31;
        return 30;
    },

    // async boundingClientRect: function () {
    //     return new Promise((resolve, reject) => {
    //         wx.createSelectorQuery().select('#list').boundingClientRect(function(rect) {
    //             resolve(rect)
    //         }).exec()
    //     })
    // },

    param2Obj: function (str) {
        var obj = {};
        var str1 = str.split('&');
        for (var i = 0; i < str1.length; i++) {
            var str2 = str1[i].split('=');
            obj[str2[0]] = str2[1];
        }
        return obj;
    },

    obj2Param: function (obj) {
        var arr = [];
        for (var key in obj) {
            arr.push(key + '=' + obj[key]);
        }
        console.log(arr.join('&'));
        return arr.join('&');
    },
    chooseImage: function (options) {
        var _g = this;
        return new Promise(function (resolve, reject) {
            wx.chooseImage({
                // count: 9,
                // sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
                // sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有

                // album 从相册选图，camera 使用相机，默认二者都有
                sourceType: options.sourceType || ['album', 'camera'],
                // original 原图，compressed 压缩图，默认二者都有
                sizeType: options.sizeType || 'compressed',
                // 最多可以选择的图片张数，默认9
                count: options.count || 9,

                // 成功则返回图片的本地文件路径列表 tempFilePaths
                success: function (result) {
                    _g.logger('~~~ wx.chooseImage -> success ~~~', result);
                    if (options.success) {
                        options.success(result);
                        return resolve(result);
                    } else {
                        _g.onUpload({
                            imageList: result.tempFilePaths,
                            page: options.page,
                            success: options.uploadSuc
                        });
                        return resolve();
                    }
                },
                // 接口调用失败的回调函数
                fail: function (error) {
                    _g.logger('~~~ wx.chooseImage -> fail ~~~', error);
                    options.fail && options.fail(error);
                    return reject(error);
                }
            });
        });
    },
    onUpload: function (options) {
        var _g = this;
        var imageList = options.imageList;
        var index = 0;
        var allChoseCount = imageList.length;
        var uploadImgs = [];
        _g.promiseWhile(function () {
            return index < allChoseCount;
        }, function () {
            _g.toast({
                title: '上传第' + (index + 1) + '张图片',
                icon: 'loading',
                duration: 100000
            });

            var host = _g.getHost();
            var uploadUrl = host + _c.apiUrls.ajaxUpload;
            return _q.Promise(function (resolve, reject) {
                wx.uploadFile({
                    url: uploadUrl,
                    filePath: imageList[index],
                    name: 'file',
                    formData: {
                        'sessionKey': _g.getLS(_c.LSKeys.SessionKey)
                    },
                    success: function (res) {
                        index++;
                        var response = JSON.parse(res.data);
                        _g.logger(response);
                        if (response.code != 200) {
                            _g.toast({
                                title: response.message,
                                duration: 1000,
                            });
                            return reject(res);
                        }
                        var src = response.data;
                        uploadImgs.push(src);
                        return resolve(src);
                    },
                    fail: function (res) {
                        _g.toast({
                            title: '网络错误',
                            duration: 1000,
                        });
                        return reject(res);
                    }
                });
            });
        }).then(function () {
            setTimeout(function () {
                _g.hideToast();
                if (options.success) {
                    options.success(uploadImgs);
                } else {
                    var self = options.page;
                    self.setData({
                        uploadedImgs: uploadImgs
                    });
                }
            }, 1000);
        }).done();
    },
    requestPayment: function (opts) {
        var _g = this;
        wx.requestPayment({
            timeStamp: opts.timeStamp,
            nonceStr: opts.nonceStr,
            package: opts.package,
            signType: opts.signType,
            paySign: opts.paySign,
            success: function (res) {
                _g.logger(res);
                _g.toast({
                    title: '支付成功~'
                });
                opts.success && opts.success();
            },
            fail: function (err) {
                _g.logger(err);
                opts.fail && opts.fail();
            }
        })
    },
    getSystemInfo: function () {
        let systemInfo;
        wx.getSystemInfo({
            success(res) {
                systemInfo = res;
            }
        });
        return systemInfo;
    },
    getCurrentPage: function () {
        return getCurrentPages()[getCurrentPages().length - 1].__route__;
    },

    // 获取上一个页面
    getPrevPage: function () {
        var _g = this;
        var pages = getCurrentPages();
        if (pages.length < 2) {
            _g.logger("没有上一页");
            return null;
        }
        var prevPage = pages[pages.length - 2]; //上一个页面
        return prevPage;
    },
    getCurrentPageUrl: function () {
        var pages = getCurrentPages(); //获取加载的页面
        var currentPage = pages[pages.length - 1]; //获取当前页面的对象
        var url = currentPage.route; //当前页面url
        return url;
    },
    getAuthorize: function (opts, callback) {
        wx.getSetting({
            success(res) {
                callback && callback(res.authSetting[opts.type]);
            }
        });
    },
    checkSDKVersion: function (compareVersion) {
        //用于检查当前版本是否低于传入的版本号
        const _g = this;
        let nowVersion = _g.getLS(_c.LSKeys.systemInfo).SDKVersion;
        return nowVersion.replace('.', '') >= compareVersion.replace('.', '')
    },
    getDataByUrl: function (search) {
        var theRequest = new Object();
        var strs = search.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
        return theRequest;
    },
    async login(opts) {
        // 用于登录过期
        const _g = this;
        let code = await _wx.login();
        let postData = {
            url: _c.apiUrls.user.login,
            data: {
                jsCode: code,
            },
            lock: true,
            isSync: false
        }
        let ret = ''; // await opts.Http.ajax(postData);
        _g.rmLS('loginExpired');
        setTimeout(() => {
            wx.hideLoading();
        }, 4000)
        _g.setLS(_c.LSKeys.userInfo, ret.data)
        //_g.setLS(_c.LSKeys.SessionKey, ret.data.sessionKey); // 
        if (ret.data.store) {
            _g.setLS(_c.LSKeys.storeInfo, ret.data.store);
        }
        event.emit('loginListener', ret.data);
    },
    checkLogin: function (opts) {
        const _g = this;
        const userInfo = _g.getUserInfo();
        if (userInfo && userInfo.nickname) {
            return true;
        } else {
            if (opts.type == 1) {
                return false
            } else if (opts.type == 2) {
                _g.toast({
                    title: '请先登录'
                })
                return false;
            }
        };
    },
    getLocalPhoto: function (path) {
        var host = _c.host.oss + '/image';
        return host + path;
    },
    getOSSPath: function(path) {
        var host = _c.host.oss;
        return host + path;
    },
    async uploadPhone(pots, self) {
        const _g = this;
        const Http = require('./http');
        let postData = {
            url: api.user.uploadPhone,
            data: {
                iv: pots.detail.iv,
                encryptedData: pots.detail.encryptedData,
            },
            lock: false,
            isSync: true,
        }
        let ret = await Http.ajax(postData);
        _g.toast({
            title: '绑定成功',
        });
        _g.getMyInfo().then((res) => {
            self.setData({
                userInfo: res,
            });
        });
    },
    async userLinkUser(self) {
        const _g = this;
        const Http = require('./http');
        let postData = {
            url: api.user.userLinkUser,
            data: {
                promoCode: _g.getLS(_c.LSKeys.promoCode),
                userId: _g.getLS(_c.LSKeys.userInfo).id
            },
            lock: false,
            isSync: false,
        }
        let ret = await Http.ajax(postData);
        _g.rmLS(_c.LSKeys.promoCode);
        let result = await _g.getMyInfo();
        if (ret.data.result == 1) {
            event.emit('refreshHomeData');
        }
    },
    getPhoto: function(url) {
        const _g = this;
        if (url.indexOf('http') > -1) {
            return url
        } else if (url) {
            return _g.getHost() + url;
        } else {
            return url
        }
    },
	requestMessage: function (tmplIds,callback) {
        let self = this;
        wx.requestSubscribeMessage({
            tmplIds: tmplIds,
            complete (res) {
                callback && callback(res);
            },

        })
    },
    checkUnicode: function(value) {
        let rsAstralRange = '\\ud800-\\udfff',
            rsZWJ = '\\u200d',
            rsVarRange = '\\ufe0e\\ufe0f',
            rsComboMarksRange = '\\u0300-\\u036f',
            reComboHalfMarksRange = '\\ufe20-\\ufe2f',
            rsComboSymbolsRange = '\\u20d0-\\u20ff',
            rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange;
        let reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange + rsComboRange + rsVarRange + ']');

        let rsFitz = '\\ud83c[\\udffb-\\udfff]',
            rsOptVar = '[' + rsVarRange + ']?',
            rsCombo = '[' + rsComboRange + ']',
            rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
            reOptMod = rsModifier + '?',
            rsAstral = '[' + rsAstralRange + ']',
            rsNonAstral = '[^' + rsAstralRange + ']',
            rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
            rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
            rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
            rsSeq = rsOptVar + reOptMod + rsOptJoin,
            rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';
        let reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

        function toArray(val) { // 字符串转成数组
            return hasUnicode(val)
                ? unicodeToArray(val)
                : asciiToArray(val);
        }

        function hasUnicode(val) {
            return reHasUnicode.test(val);
        }

        function unicodeToArray(val) {
            return val.match(reUnicode) || [];
        }

        function asciiToArray(val) {
            return val.split('');
        }
        return toArray(value);
    },
};

base.prototype.constructor = base;
module.exports = new base();
