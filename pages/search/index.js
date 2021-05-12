'use strict'
// js库引入
const app = getApp();
const _ = app.underscore;
const _g = app.base;
const _c = app.config;
const _t = app.temps;
const event = app.event;
const moment = app.moment;
const Http = app.Http;
const api = app.api;

const config = {

} //页面基本配置,不写入data

const data = {
    hot: [],
    history: [],
    del: false,
    // isWay: true,
    // tabIndex: 1,
    // downIcon: true
}
const onLoad = function (self) {
    self.setData({
        platformFlag: self.data.platformFlag || 1
    })
    self.getHotSearchList();
}
const onShow = function (self) {

}
const onReady = function (self) {
    self.setData({
        history: _g.getLS('SearchData') || []
    })
}
const onUnload = function (self) { }
const methods = {
    async getHotSearchList(){
        let self = this;
        let postData = {
            url: api.platfrom.getHotSearchList,
            data:{
                platformFlag: self.data.platformFlag
            }
        }
        let ret = await Http.ajax(postData)
        if(ret.code == 200){
            self.setData({
                hot: ret.data
            })
        }
    },
  //搜索
  onSearch: function(e){
      let self = this;
      let searchVal = null;
      if(typeof e.detail.value == 'object'){
          searchVal = e.detail.value.search
      }else {
          searchVal = e.detail.value
      }
      if(searchVal != ''){
          let searchData = _g.getLS('SearchData');
          searchData = searchData || [];
          searchData.map(function(item, index){
              if(item == searchVal){
                  searchData.splice(index, 1);
                  return ;
              }
          });
          searchData.unshift(searchVal);
          self.setData({
              history: searchData
          })
          _g.setLS('SearchData', searchData);
      }
      _g.navigateTo({
          url: 'pages/search/searchList',
          param: {
              keywords: searchVal,
              platformFlag: self.data.platformFlag
          }
      },self)
  },
  //删除按钮状态
  onDelStatusTap: function(){
      let self = this;
      if(self.data.history.length != 0){
          _g.rmLS('SearchData');
          self.setData({
              history: []
          })
      }
  },
  // 删除历史记录
  onDelTap: function(e){
      let self = this;
      let searchData = _g.getLS('SearchData');
      searchData = searchData || [];
      searchData.splice(e.currentTarget.dataset.index, 1);
      self.setData({
          history: searchData
      })
      _g.setLS('SearchData', searchData);
  },
  //搜索结果
  onSearchTap(e) {
      const self = this;
      const keywords = e.currentTarget.dataset.keywords;
      _g.navigateTo({
          url: 'pages/search/searchList',
          param: {
              keywords: keywords,
              platformFlag: self.data.platformFlag
          }
      },self)
  },
    // onWayTap() {
    //     const self = this;
    //     self.setData({
    //         isWay: !self.data.isWay
    //     })
    // },
    // onSelectTap(e) {
    //     const self = this;
    //     let { tabindex } = e.currentTarget.dataset;
    //     if (tabindex == 1 || tabindex == 3) {
    //         self.setData({
    //             downIcon: !self.data.downIcon
    //         })
    //     }
    //     self.setData({
    //         tabIndex: tabindex
    //     })
    // }
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