// js库引入
const app = getApp();
const _ = app.underscore;
const _g = app.base;
const _c = app.config;
const event = app.event;
const moment = app.moment;
const Http = app.Http;
const api = app.api;
const  _wx = require('../../libs/wx');
// 初始化数据
const data = {
    lon: 113.403051,
    lat: 23.131432,
    storeInfo:  {},
    markerList: [],
    storeList: [],

};

// 页面onLoad方法
const onLoad = function(self) {
    self.setData({
        storeInfo: _g.getLS('storeInfo')
    })
    self.getLocation();
};

// 页面onShow方法
const onShow = function(self) {

};

const onUnload = function(self) {

};

// 页面中的方法
const methods = {
    async getLocation() {
        const self = this;
        try {
            let location = await _wx.getLocation();
            self.setData({
                lon: location.longitude,
                lat: location.latitude
            });
            self.getPageData();
        } catch (err) {
            self.getPageData();
        }
    },
    async getPageData() {
        const self = this;
        let postData = {
            url: api.platfrom.getStoreList,
            data: {
                page: self.data.page,
                pageSize: 20,
                lon: self.data.lon,
                lat: self.data.lat,
            },
            lock: true,
            isSync: false,
        }
        let {data} = await Http.ajax(postData);
        if (self.data.page == 1) {
            self.setData({
                lon: data.list[0].lon,
                lat: data.list[0].lat,
                storeList: data.list,
                hasNextPage: data.hasNextPage,
                page: ++self.data.page
            });
        } else {
            self.setData({
                storeList: self.data.storeList.concat(data.list),
                hasNextPage: data.hasNextPage,
                page: ++self.data.page
            });
        }
        self.transList();
        
    },
    transList() {
        const self = this;
        self.setData({
            markerList: _.map(self.data.storeList, (item, index) => {
                item.latitude = item.lat;
                item.longitude = item.lon;
                item.iconPath = '/images/tabBar/store_mapIcon.png';
                item.width = 38;
                item.height = 38;
                // item.id = index;
                return item;
            })
        });
    },
    onBubbleTap(e) {
    },
    bindupdated(e) {

    },
    bindregionchange(e) {

    },
    onStoreTap(e) {
        const self = this;
        const opts = e.currentTarget.dataset;
        const storeInfo = self.data.storeList[opts.index];
        _g.setLS(_c.LSKeys.storeInfo, storeInfo);
        self.setStore(storeInfo);
    },
    async setStore(storeInfo) {
        const self = this;
        let postData = {
            url: api.platfrom.selectStore,
            data: {
                selectStoreId: storeInfo.id,
                lon: self.data.lon,
                lat: self.data.lat,
            },
            lock: false,
            isSync: true,
        }
        let ret = await Http.ajax(postData);
        let result = await _g.getMyInfo();
        event.emit('refreshHomeData');
        // setTimeout(() => {
        //     event.emit('refreshShopData');
        // }, 2000);
        _g.navigateBack();
        
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