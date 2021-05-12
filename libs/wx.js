/**
 * 
 * 把微信异步方法封装成promise
 */
const _g = require('base.js');

function _wx() {}

_wx.prototype = {
    // 登录
    async login() {
        return new Promise((resolve, reject) => {
            wx.login({
                success(res) {
                    if (res.code) {
                        resolve(res.code)
                    } else {
                        reject();
                    }
                },
                fail(err) {
                    reject();
                }
            })
        });
    },
    // 获取地址
    async getLocation() {
        return new Promise((resolve, reject) => {
            wx.getLocation({
                success(res) {
                    resolve({
                        latitude: res.latitude,
                        longitude: res.longitude
                    })
                },
                fail(err) {
                    reject();
                }
            })
        })
    },
    // 下载文件
    async downloadFile(path) {
        return new Promise((resolve, reject) => {
            wx.downloadFile({
                url: path,
                success(res) {
                    resolve(res)
                },
                fail(err) {
                    reject(err);
                }
            })
        })
    },
    async uploadFile() {
        return new Promise((resolve, reject) => {})
    },
    async requestPayment(opts) {
        return new Promise((resolve, reject) => {
            let postData = { ...opts };
            postData.success = (res) => {
                resolve(res)
            };
            postData.fail = (err) => {
                reject(err);
            };
            wx.requestPayment(postData);
        })
    },
    async getAuthorize(opts) {
        return new Promise((resolve, reject) => {
            wx.getSetting({
                success(res) {
                    resolve(res.authSetting[opts.type])
                },
                fail(err) {
                    reject();
                }
            });
        })
    },
    async chooseLocation() {
        return new Promise((resolve, reject) => {
            wx.chooseLocation({
                success(res) {
                    resolve(res)
                },
                fail(err) {
                    reject();
                }
            })
        });
    },
    async getLocationDetail(lon, lat) {
        return new Promise((resolve, reject) => {
            var key = '73LBZ-I2OKW-F7JRD-OEY5T-46H4E-3FFIM';
            var getAddressUrl = 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + lat + ',' + lon + '&key=' + key + '&get_poi=1';
            wx.request({
                url: getAddressUrl,
                header: {
                    'content-type': 'application/json' // 默认值
                },
                success: function(res) {
                    var addr;
                    if (res.data.status == 0) {
                        addr = res.data.result.address_component;
                    }
                    return resolve(addr);
                },
                fail: function(err) {
                    return reject();
                }
            });
        })
    },
    async getCodeByName (keyword) {
        return new Promise((resolve, reject) => {
            var key = '73LBZ-I2OKW-F7JRD-OEY5T-46H4E-3FFIM';
            var getAddressUrl = 'https://apis.map.qq.com/ws/district/v1/search?&keyword='+keyword+'&key='+key;
            wx.request({
                url: getAddressUrl,
                header: {
                    'content-type': 'application/json' // 默认值
                },
                success: function(res) {
                    if (res.data.status == 0) {
                        if (res.data.result.length && res.data.result[0].length) {
                            return resolve(res.data.result[0][0]);
                        }
                    } else {
                        return reject();
                    }
                },
                fail: function(err) {
                    return reject();
                }
            });
        })
    },
    async getSystemInfo() {
        return new Promise((resolve, reject) => {
            wx.getSystemInfo({
                success(res) {
                    resolve(res)
                }
            })
        });
    },
    async selectorQuery(id, self) {
        return new Promise((resolve, reject) => {
            const query = wx.createSelectorQuery().in(self)
            query.select('#'+id).boundingClientRect()
            query.selectViewport().scrollOffset()
            query.exec(function(res) {
                resolve(res)
            })
        })
    },
    async saveImageToPhotosAlbum(filePath) {
        return new Promise((resolve, reject) => {
            wx.saveImageToPhotosAlbum({
                filePath,
                success(res) {
                    resolve(res)
                },
                fail(err) {
                    reject(err);
                }
            })
        });
    },
    async saveVideoToPhotosAlbum(filePath) {
        return new Promise((resolve, reject) => {
            wx.saveVideoToPhotosAlbum({
                filePath,
                success(res) {
                    resolve(res)
                },
                fail(err) {
                    reject(err);
                }
            })
        });
    },
    async setClipboardData(text) {
        return new Promise((resolve, reject) => {
            wx.setClipboardData({
                data: text,
                success(res) {
                    resolve(res)
                },
                fail(err) {
                    reject(err);
                }
            })
        });
    },
    async getScrollOffset() {
        return new Promise((resolve, reject)=>{
            wx.createSelectorQuery().selectViewport().scrollOffset(function(res){
                resolve(res)
                // res.id      // 节点的ID
                // res.dataset // 节点的dataset
                // res.scrollLeft // 节点的水平滚动位置
                // res.scrollTop  // 节点的竖直滚动位置
            }).exec()
        });
    }
};

_wx.prototype.constructor = _wx;
module.exports = new _wx();
