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
    isPhone:true,
    code: '',
    phone: '',
    time: 60,
    text: '获取验证码'
};

// 页面onLoad方法
const onLoad = function(self) {
    const userInfo = _g.getUserInfo();
    if(userInfo.phone){
        self.setData({
            isPhone: false,
            phone: userInfo.phone,
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
    // 输入手机号
    change:function(e){
        let self = this;
        let phone = e.detail.value;
        self.setData({
            phone: phone
        })
    },
    //获取验证码
    onCodeTap: function(){
        let self = this;
        let myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
        if(myreg.test(self.data.phone)){
            //发送验证码
            self.countDown();
            self.setData({
                isChange: true
            })
        }else {
            _g.toast('手机号码格式不正确');
        }
    },
    countDown(){
        let self = this;
        setTimeout(function(){
            if(self.data.time > 0) {
                self.setData({
                    time: self.data.time - 1,
                    text: self.data.time - 1 + 's后重新获取'
                })
                self.countDown();
            }else {
                self.setData({
                    time: 60,
                    text: '获取验证码'
                })
            }
        },1000)
    },
    //输入验证码
    onCodeChange: function(e){
        let self = this;
        let code = e.detail.value;
        self.setData({
            code: code
        })
    },
    // 立即绑定
    async onBindTap(){
        let self = this;
        let myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
        if(!myreg.test(self.data.phone)){
            _g.toast('手机号码格式不正确');
            return ;
        }
        if(self.data.code == ''){
            _g.toast('验证码不能为空');
            return ;
        }
        let postData = {
            url: api.user.bindPhone,
            data:{
                phone: self.data.phone,
                code: self.data.code
            }
        }
        let ret = await Http.ajax(postData);
        if(ret.code == 200){
            _g.toast('绑定成功');
            self.setData({
                isPhone: false
            })
        }
    },
    onPhoneChangeTap: function(){
        let self = this;
        self.setData({
            isPhone: true
        })
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
