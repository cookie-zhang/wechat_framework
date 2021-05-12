'use strict'
// js库引入
const app = getApp();
const _g = app.base;
const _c = app.config;
const event = app.event;
const moment = app.moment;
const Http = app.Http;
const api = app.api;
const _wx = require('../../libs/wx');
let buttonRect = wx.getMenuButtonBoundingClientRect();

const data = {
    cardCur: 0,
    swiperList: [{
      id: 0,
      type: 'image',
      url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big84000.jpg'
    }, {
      id: 1,
        type: 'image',
        url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big84001.jpg',
    }, {
      id: 2,
      type: 'image',
      url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big39000.jpg'
    }, {
      id: 3,
      type: 'image',
      url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big10001.jpg'
    }, {
      id: 4,
      type: 'image',
      url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big25011.jpg'
    }, {
      id: 5,
      type: 'image',
      url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big21016.jpg'
    }, {
      id: 6,
      type: 'image',
      url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big99008.jpg'
    }],
    tab:['代理房', '二手房'],
    TabCur: 0,
    scrollLeft:0,
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar

}
const onLoad = async function (self) {
    self.towerSwiper('swiperList');
    // 初始化towerSwiper 传已有的数组名即可
   
    wx.hideTabBar();
}
const onShow = function (self) {
   
}
const onReady = function (self) {
  
}
const onUnload = function (self) {
    // event.remove('refreshHomeData', self);
    // clearTimeout(self.data.timer);
}
const methods = {
    // 置顶
    onTopTap() {
        const self = this;
        wx.pageScrollTo({
            scrollTop: 0
        })
    },
    tabSelect(e) {
        this.setData({
          TabCur: e.currentTarget.dataset.id,
          scrollLeft: (e.currentTarget.dataset.id-1)*60
        })
      },
    
    towerSwiper(name) {
        let list = this.data[name];
        for (let i = 0; i < list.length; i++) {
          list[i].zIndex = parseInt(list.length / 2) + 1 - Math.abs(i - parseInt(list.length / 2))
          list[i].mLeft = i - parseInt(list.length / 2)
        }
        this.setData({
          swiperList: list
        })
      },
      isCard(e) {
        this.setData({
          isCard: e.detail.value
        })
      },


    
   
    //授权时
    // authorizeSuc() {
    //     const self = this;
    //     self.setLoginData();
    // },
    getData: function () {
       
    },
   
  
}

// 初始化页面page对象
const initPage = _g.initPage({
    data: data,
    onLoad: onLoad,
    onUnload: onUnload,
    onReady: onReady,
    onShow: onShow,
    methods: methods,
});
Page(initPage);