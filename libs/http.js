/**
 * Created by
 */
 // 'use strict'
// const app = getApp();
var _g = require('./base.js');
var _ = require('underscore.js');
var _c = require('config.js');
var _md5 = require('./md5.js');
var moment = require('./moment.min.js');

function Http() {
    this._opts = {
        apiVersions: 'v1', //接口版本号
        appVersion: _c.version, //小程序版本
        deviceCode: 'miniApp', //设备标识
        platform: 0, //平台标识

    };
    this.isLock = false;
    this.isSync = false;
}

Http.prototype = {
    fetchPostData(data) {
        const self = this;
        let postData = _.extend({}, self._opts);
        postData.sessionKey = _g.getLS(_c.LSKeys.SessionKey);
        if (_g.getLS(_c.LSKeys.userInfo)) {
            let userInfo = _g.getLS(_c.LSKeys.userInfo);
            postData.miniUserId = userInfo.id;
            if (userInfo.store) {
                postData.myStoreId = userInfo.store.id;
            }else if(_g.getLS(_c.LSKeys.storeInfo)){
                postData.myStoreId = _g.getLS(_c.LSKeys.storeInfo).id;
            }
        }
        postData.data = JSON.stringify(_g.ksort(data));
        postData.timestamp = Math.round(new Date().getTime() / 1000);
        postData.token = _md5.go(_g.jsonToPostDataStr(_g.ksort(postData)));
        return postData;
    },
    lock() {
        this.isLock = true;
    },
    unlock() {
        getApp().globalData.loading = false;
        if (this.isSync) {
    	    wx.hideLoading();
        }
    },
    /**
     *
     * @param {*} opts
     * @param {Object} customize 自定义弹窗msg
     * @param {Number} customize[code] 响应的状态码
     * @param {String} customize[msg] 自定义msg
     */
    async ajax(opts, customize = {}) {
        const self = this;
        if (!opts.data || !opts.url) return;
        if (self.isLock) return;
        if (opts.lock) self.lock();
        if (opts.isSync) {
            this.isSync = true;
        	wx.hideLoading();
        	wx.showLoading({
                title: '正在获取信息',
                mask: true
            });
        }
        //处理data
        const postData = self.fetchPostData(opts.data);

        if (!opts.host) opts.host = _c.host[_c.env];
        if (opts.url.indexOf('http://') < 0 && opts.url.indexOf('https://') < 0) {
            opts.url = opts.host + opts.url;
        }

        return new Promise((resolve, reject) => {
            wx.request({
                url: opts.url,
                method: opts.method || 'post',
                data: postData,
                header: { 'content-type': 'application/x-www-form-urlencoded' },
                success(res) {
                    const ret = res.data;
                    _g.stopPullDownRefresh();
                    self.unlock();
                    if (_c.debug || _c.env != 'pro'){
                        // console.log(opts.url,opts.data)
                        // console.log(ret)
                    };
                    

                	if (res.statusCode == 200 && ret.code == 200 ) {
                    	resolve(ret);
                	} else if (res.statusCode == 200 && ret.code == 4444) {
                        //重新登录
                        if (_g.getLS('loginExpired')) return;
                        _g.setLS('loginExpired', 1); //登录过期标志
                        _g.login({
                            Http: self
                        })
                        wx.showLoading({
                            title: '正在获取信息',
                            mask: true
                        });
                        _g.rmLS(_c.LSKeys.userInfo);
                        _g.rmLS(_c.LSKeys.SessionKey);
                    } else if (res.statusCode == 200 &&
                            [400,60131,
                             8001,8888,
                             6001,6002,
                             60031,6004,
                             6005,10021].indexOf(ret.code) > -1) {
                        reject(ret);
                        //不打印信息
                    } else if (res.statusCode == 200) {
                        reject(ret);
                        // 如果自定义的code相同，即弹出自定义的msg
                        if (customize.code == ret.code) {
                            _g.toast({
                                title: customize.msg || ret.message //错误信息,如果没有传入自定义msg，即弹出后台返回的message
                            });
                        } else {
                            if (ret.code == 70002) {  // 不允许售后时返回上一页
                                wx.showModal({
                                    title: '提示',
                                    content: ret.message,
                                    showCancel: false,
                                    success: function (res) {
                                        if (res.confirm) {
                                            wx.navigateBack({delta: 1});
                                        }
                                    }
                                })
                            } else {
                                _g.toast({
                                    title: ret.message //错误信息
                                });
                            }
                        }
                	} else {
                		//系统出错
                        reject(ret);
                		_g.toast({
                			title: res.data
                		});
                	}
                },
                fail(err) {
                    self.unlock();
                    reject(err);
                    _g.toast({
            			title: '网络连接失败,请检查网络'
            		});
                }
            })
        })
    },
};

Http.prototype.constructor = Http;
module.exports = new Http();
