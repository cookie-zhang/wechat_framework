'use strict'
// js库引入
const app = getApp();
const _ = app.underscore;
const _g = app.base;
const _c = app.config;
const event = app.event;
const Http = app.Http;
const api = app.api;
const _wx = app._wx;

const data = {
    showModalStatus: 0,//0隐藏 1输入框 2邀请人信息
    hiddenLoginPopup: true,
    incite: '',  //邀请人
}
const onLoad = function (self) {
   
}
const onShow = function (self) {
}
const onReady = function (self) {
   
}
const onUnload = function (self) { }

const methods = {
    
}
const temps = {}


// 初始化页面page对象
const initPage = _g.initPage({
    data: data,
    onLoad: onLoad,
    onUnload: onUnload,
    onReady: onReady,
    onShow: onShow,
    methods: methods,
    temps: temps,
});
Page(initPage);
