// js库引入
const app = getApp();
const _g = app.base;
const _c = app.config;
const Http = app.Http;
const api = app.api;
const _wx = require('../../libs/wx.js')

// 初始化数据
const data = {};

// 页面onLoad方法
const onLoad = function(self) {};

// 页面中的方法
const methods = {
    async onGotUserInfo(e) {
        const self = this;
        try {
            let postData = {
                url: api.user.authorize,
                data: {
                    jsCode: self.data.jsCode,
                    rawData: e.detail.rawData,
                },
                lock: true,
                isSync: true
            }
            let ret = await Http.ajax(postData);
            await _g.getMyInfo();
            _g.switchTab({
                url: 'pages/home/shop'
            }, self);
        } catch (e) {
            const code = await _wx.login();
            self.setData({
                jsCode: code
            });
            _g.toast({
                title: '授权失败,请重试'
            });
        }
    },
    onProtocolTap() {
        _g.navigateTo({
            url: 'pages/home/notice',
            param: {
                urlParam: `type=notice&id=11`
            }
        }, this);
    },
    onCloseTap() {
        _g.switchTab({
            url: 'pages/home/shop'
        }, this);
    }
};

// 有引用template时定义
const temps = {};

// 初始化页面page对象
const initPage = _g.initPage({
    data: data,
    onLoad: onLoad,
    methods: methods,
});
Page(initPage);