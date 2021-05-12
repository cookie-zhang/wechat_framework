// pages/me/bindPhone.js
// js库引入
const app = getApp();
const _ = app.underscore;
const _g = app.base;
const _c = app.config;
const event = app.event;
const Http = app.Http;
const api = app.api;

// 初始化数据
const data = {
    isChange:false,
    isShow:true,
    code: '',
    wechat: '',
    userInfo: ''
};

// 页面onLoad方法
const onLoad = function(self) {
    const userInfo = _g.getUserInfo();
    if(userInfo.wxNo){
        self.setData({
            isShow: false,
            wechat: userInfo.wxNo,
            userInfo: userInfo
        })
    }

};

// 页面onShow方法
const onShow = function(self) {

};

const onUnload = function(self) {

};

// 页面中的方法
const methods = {
    // 输入微信号
    change:function(e){
        let self = this;
        let wechat = e.detail.value;
        self.setData({
            wechat: wechat,
            isChange: true
        })
    },
    // 立即绑定
    async onBindTap(){
        let self = this;
        if(!self.data.isChange){
            return;
        }
        let postData = {
            url: api.user.bindWechat,
            data:{
                wxNo: self.data.wechat
            }
        }
        let ret = await Http.ajax(postData);
        if(ret.code == 200){
            _g.toast('绑定成功');
            self.setData({
                isShow: false
            })
        }
    }
};

// 有引用template时定义
const temps = {};

// 初始化页面page对象
const initPage = _g.initPage({
    data: data,
    onLoad: onLoad,
    onShow: onShow,
    methods: methods,
    onUnload: onUnload
});
Page(initPage);
