//app.js
'use strict'
App({
    onLaunch: function(opts) {
        // 引入相关js
        this.base = require('/libs/base.js');
        this.promise = require('/libs/q.js');
        this.underscore = require('/libs/underscore.js');
        this.event = require('/libs/event.js');
        this.config = require('/libs/config.js');
        this.moment = require('/libs/moment.min.js');
        this.temps = require('/templates/temps.js');
        this.Http = require('/libs/http.js');
        this.api = require('/libs/api.js');
        this._wx = require('/libs/wx.js');
        var self = this;
        var _g = this.base;
        const updateManager = wx.getUpdateManager();
        updateManager.onUpdateReady(function() {
            wx.showModal({
                title: '更新提示',
                content: '新版本已经准备好，是否重启应用？',
                showCancel: false,
                success: function(res) {
                    if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate()
                    }
                }
            })
        })
        // 获取手机系统消息
        const systemInfo = wx.getSystemInfoSync();
        // 缓存手机信息
        // statusBarHeight：状态栏的高度，单位px
        _g.setLS('statusBarHeight', systemInfo.statusBarHeight);
        _g.setLS('systemInfo', systemInfo);
        // 是否有安全区域
        let hasSafeArea = false;
        if (systemInfo.model.indexOf('iPhone X') > -1) {
            hasSafeArea = true;
        }
        if (systemInfo.model.indexOf('iPhone 11') > -1) {
            hasSafeArea = true;
        }
        _g.setLS('hasSafeArea', hasSafeArea);
    },
    globalData: {
        loading: false
    }
});
