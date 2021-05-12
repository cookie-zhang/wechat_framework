const app = getApp();
const _g = app.base;

Component({
    options: {
        multipleSlots: true // 在组件定义时的选项中启用多slot支持
    },
    properties: {
        title: { // 属性名
            type: String, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
            value: '' // 属性初始值（可选），如果未指定则会根据类型选择一个
        },
        hideLeftBtn: { //是否隐藏左边返回按钮
            type: Boolean,
            value: false,
            observer(newVal, oldVal, changedPath) {
                var self = this;
                self.setData({
                    hideLeftBtn: newVal
                });
            }
        },
        bgClass: { // 背景色
            type: String,
            value: '',
            observer(newVal, oldVal, changedPath) {
                var self = this;
                self.setData({
                    bgClass: newVal
                });
            }
        },
        leftIcon: { //设置左边按钮的图片
            type: String,
            value: '/header/icon-back-black.png',
            observer(newVal, oldVal, changedPath) {
                var self = this;
                self.setData({
                    leftIcon: newVal
                });
            }
        },
        bgColor: {
            type: String,
            value: '#ffffff',
            observer(newVal, oldVal, changedPath) {
                var self = this;
                self.setData({
                    bgColor: newVal
                });
            }
        },
        bgImg: {
            type: String,
            value: '',
            observer(newVal, oldVal, changedPath) {
                var self = this;
                self.setData({
                    bgImg: newVal
                });
            }
        },
        titleColor: {
            type: String,
            value: '#333333',
            observer(newVal, oldVal, changedPath) {
                var self = this;
                self.setData({
                    titleColor: newVal
                });
            }
        },
    },
    created() {
        const self = this;
    },
    ready() {

    },
    data: {
        // 弹窗显示控制
        statusBarHeight: _g.getLS('statusBarHeight'),
        leftIcon: '/header/icon-back-black.png',
        hideLeftBtn: false,
        bgColor: '#ffffff',
        bgImg: '',
        titleColor: '#333333',
        bgClass: '',
    },
    methods: {
        onBtnTap() {
            const self = this;
            _g.navigateBack();
        }
    }
});
