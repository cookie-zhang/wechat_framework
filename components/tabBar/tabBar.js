const app = getApp();
const _g = app.base;
const event = app.event;
const Http = app.Http;
const api = app.api;

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        selected: {
            type: Number,
            value: 0,
            observer(newVal, oldVal, changedPath) {
                var self = this;
                self.setData({
                    selected: newVal
                });
            }
        },
        isHide: {
            type: Boolean,
            value: false,
            observer(newVal, oldVal, changedPath) {
                var self = this;
                self.setData({
                    selected: newVal
                });
            }
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        list: [{
                url: '/images/tabBar/store_icon1.png',
                selectUrl: '/images/tabBar/store_red_icon.png',
                title: '首页',
                pagePath: '/pages/home/index',
            },
            {
                url: '/images/tabBar/me_icon1.png',
                selectUrl: '/images/tabBar/me_red_icon.png',
                title: '我的',
                pagePath: '/pages/me/index',
            },
        ],
        selected: 0,
        safeAreaBottom: 0,
        cartNum: 0
    },
    ready() {
        const self = this;
        self.setData({
            safeAreaBottom: _g.getLS('hasSafeArea') ? 14 : 0
        });
        self.getCartNum();
        event.on('refreshCartData', self, () => {
            self.getCartNum();
        });
    },
    /**
     * 组件的方法列表
     */
    methods: {
        onChooseTap: function(e) {
            let self = this;
            let index = e.currentTarget.dataset.index;
            wx.switchTab({
                url: self.data.list[index].pagePath
            })
        },
        async getCartNum() {
        }
    }
})