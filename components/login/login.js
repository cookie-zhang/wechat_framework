'use strict'
const app = getApp();
const _g = app.base;
const _c = app.config;
const event = app.event;
const Http = app.Http;
const api = app.api;
const _wx = require('../../libs/wx.js');

Component({
    properties: {
        hiddenLoginPopup: {
            type: Boolean,
            value: true,
            observer(newVal, oldVal, changedPath) {
                const self = this;
                self.setData({
                    hiddenLoginPopup: newVal
                });
            }
        }
    },
    onShow(){
        // this.getCode();
    },
    data: {
        hiddenLoginPopup: true,
    },
    methods: {
        async getCode() {
            let code = await _wx.login();
            this.setData({ code });
        },
        onCancelTap() {
            const self = this;
            self.setData({
                hiddenLoginPopup: true
            })
        },
        async onGotUserInfo(e) {
            const self = this;
            const userData = e.detail.userInfo;
            let postData = {
                url: api.user.authorize,
                data: {
                    rawData: e.detail.rawData,
                    jsCode: self.data.code
                },
                lock: false,
                isSync: false,
            };
            let ret = await Http.ajax(postData);
            if (ret.code === 200) {
                let userInfo = _g.getLS(_c.LSKeys.userInfo);
                userInfo.avatar = userData.avatarUrl;
                userInfo.nickname = userData.nickName;
                _g.setLS(_c.LSKeys.userInfo, userInfo);
                event.emit('authorizeListener') 
                self.onCancelTap();
            }
        },

    }
})