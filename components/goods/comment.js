'use strict';
const app = getApp();
const _g = app.base;
const _c = app.config;
const _ = app.underscore;
const Http = app.Http;
const api = app.api;

Component({
    properties: {
        goodsId: {
            type: Number,
            value: 0,
            observer(newVal, oldVal, changedPath) {
                const self = this;
                self.setData({
                    id: newVal
                });
            }
        },
        hiddenComment: {
            type: Boolean,
            value: true,
            observer(newVal, oldVal, changedPath) {
                const self = this;
                if (!self.data.times) {
                    self.data.times = true;
                    self.getList();
                }
                self.setData({
                    hiddenComment: newVal
                });
            }
        }
    },
    data: {
        id: 0,
        list: [],
        statusBarHeight: _g.getLS('statusBarHeight'),
        hideLeftBtn: false,
        bgColor: '#ffffff',
        titleColor: '#333333',
        leftIcon: '/header/icon-back-black.png',
        hiddenComment: true,
        times: 0,
        page: 1,
        host: _c.host[_c.env]
    },
    created() {
        const self = this;

    },
    methods: {
        async getList() {
            const self = this;
            let postData = {
                url: api.goods.commentList,
                data: {
                    goodsId: self.data.id,
                    page: self.data.page,
                    pageSize: 20
                },
                lock: false,
                isSync: true,
            }
            self.data.page++;
            let { data } = await Http.ajax(postData);
            data.list = data.list.map((item) => {
                if (item.imgUrls) {
                    item.photos = item.imgUrls.split(',');
                }
                return item;
            })
            self.setData({
                list: data.list,
                hasNextPage: data.hasNextPage
            })
        },
        onReachBottom() {
            const self = this;
            if (self.data.hasNextPage) {
                self.getList();
            }
        },
        // ????????????
        onImgTap(e) {
            const self = this;

            const listIndex = e.currentTarget.dataset.index;    // ????????????
            const imgIndex = e.currentTarget.dataset.subindex;  // ????????????
            
            let item = self.data.list[listIndex].imgUrls.split(',');

            let listImgArr = item;   // ??????????????????
            let currentImg = item[imgIndex];  // ?????????????????????

            // ????????????
            currentImg = self.data.host + currentImg;
            listImgArr = _.map(listImgArr, (item) => {
                return self.data.host + item;
            })

            wx.previewImage({
                current: currentImg, // ?????????????????????http??????
                urls: listImgArr // ?????????????????????http????????????
            })
        },
    }
})