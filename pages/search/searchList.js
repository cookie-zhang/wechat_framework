'use strict'
// js库引入
const app = getApp();
const _g = app.base;
const Http = app.Http;
const api = app.api;
let buttonRect = wx.getMenuButtonBoundingClientRect()
let systemInfo = wx.getSystemInfoSync();
let inputWidth = systemInfo.windowWidth - buttonRect.width - 20 - 44 - (systemInfo.windowWidth - buttonRect.right);

const data = {
    iconSrc: '/search/icon-list.png',
    currentFrist: 0,    //第一级选中下标
    currentSecond: 0,   //第二级选中下标
    showStyle: false, 
    filterData: [],     //第一级筛选数据
    secondData: [],     //第二级筛选数据
    thirdData: [],      //第三级筛选数据
    selectList: {},     //第三级已选择数据ID
    selectTitle: {},    //第三级已选择数据title
    maskOpen: false,    //蒙版控制
    goodsList: [],       //商品列表
    sort: 2,
    classifyIds: '',
    brandIds:'',
    inputWidth: inputWidth,
    headerToTop: systemInfo.statusBarHeight
    //keywords: ''   //关键字
}
const onLoad = function(self) {
    wx.showLoading({
        title: '加载中...',
        mask: true
    })
    let filterData = [{title: '综合'}, 
                      {title: '销量'}, 
                      {title: '价格'},
                      {title: '筛选'}];
    let secondData = [{title: '爱亲自营', isSelect: false},
                        {title: '品牌', isSelect: false, children:[]},
                        {title: '分类', isSelect: false, children:[]}
                    ];
    self.setData({
        filterData: filterData,
        secondData: secondData,
        keywords: self.data.keywords,
        platformFlag: self.data.platformFlag
    });
    self.getGoodsList();
    self.getBrand();
    self.getClassify();
}
const onShow = function(self) {}
const onReady = function(self) {}
const onUnload = function(self) {}
const methods = {
    onBackTap() {
        _g.navigateBack();
    },
    async getBrand(){
        let self = this;
        let postData = {
            url: api.brand.list,
            data:{
                page: 1,
                pageSize: 30
            }
        }
        let ret = await Http.ajax(postData)
        wx.hideLoading()
        if(ret.code == 200){
            let secondData = self.data.secondData;
            secondData[1].children = ret.data.list;
            self.setData({
                secondData:secondData
            })
        }
    },
    async getClassify(){
        let self = this;
        let postData = {
            url: api.classify.allClassify,
            data: {
                page: 0,
                pageSize: 0
            }
        }
        let ret = await Http.ajax(postData)
        wx.hideLoading()
        if(ret.code == 200){
            let list = [];
            let secondData = self.data.secondData;
            ret.data.forEach((it)=>{
                list.push(...it.children)
            })
            secondData[2].children = list;
            self.setData({
                secondData: secondData
            })
        }
    },
     async getGoodsList(){
         let self = this;
         let classifyIds = self.data.classifyIds;
         let param = {
            page: self.data.page,
            pageSize: 10,
            content: self.data.keywords,
            // sortType: self.data.currentFrist + 1,   //V1
            sortField: self.data.currentFrist + 1,  //V2
            // sort: self.data.sort,        //V1
            sortType: self.data.sort,    //V2
            labelIds: self.data.secondData[0].isSelect ? 1:'',
            brandIds: self.data.brandIds,
            classifyIds: classifyIds,
            // platformFlag: self.data.platformFlag,
            // couponGoodsIds: self.data.couponGoodsIds ? self.data.couponGoodsIds : '',
         }
        if (self.data.couponPlatformFlag) {
            param.couponPlatformFlag = self.data.couponPlatformFlag
        }
        if (self.data.couponGoodsIds) {
            param.couponGoodsIds = self.data.couponGoodsIds;
        }
         let postData = {
            //  url: api.goods.getGoodsList,   //V1
             url: api.goods.listV2,         //V2
             data: param,
             lock: false, //是否锁定
             isSync: true, //展示菊花
         }
         let ret = await Http.ajax(postData)
         wx.hideLoading()
         self.setData({
             hasNextPage: ret.data.hasNextPage,
             goodsList: self.data.page ==1 ? ret.data.list : self.data.goodsList.concat(ret.data.list),
         })
         if(ret.data.hasNextPage){
             self.setData({
                 page: self.data.page + 1
             })
         }
    },
    // 切换样式
    onStyleTap: function(){
        let self = this;
        let iconStyleList = ['/search/icon-list.png', '/search/icon-block.png' ];
        let show = self.data.showStyle ? iconStyleList[0] : iconStyleList[1];
        self.setData({
            iconSrc: show,
            showStyle: !self.data.showStyle
        })
    },
    //切换筛选
    onTabChangeTap: function(e){
        let self = this;
        let index = e.currentTarget.dataset.index;
        if(e.currentTarget.dataset.belong == "1"){  //一级切换
            if(index == 2){     //价格搜索
                let sort = self.data.sort;
                if(sort == 1){
                    sort = 2;
                }else {
                    sort = 1;
                }
                self.setData({
                    currentFrist: index,
                    maskOpen: false,
                    sort: sort
                })
            }else {
                self.setData({
                    currentFrist: index,
                    maskOpen: false,
                    sort: 2
                });
            }
            if(index != 3) {  //点击筛选时不刷新数据
                self.setData({
                    page: 1
                })
                self.getGoodsList();
            }
        }else {                                     //二级切换
            let secondData = self.data.secondData;
            // 切换时判断上一个是否已经有选择的
            if(index == 1 || index == 0){
                secondData[2].isSelect = self.data.selectList[2] ? true : false;
            }
            if(index == 2 || index == 0){
                secondData[1].isSelect = self.data.selectList[1] ? true : false;
            }
            secondData[index].isSelect = self.data.selectList[index] ? true : !secondData[index].isSelect;  //选择状态取反
            if(index == self.data.currentSecond && self.data.secondData[index].children) {
                self.setData({
                    maskOpen: !self.data.maskOpen,
                    secondData: secondData
                })
                return ;
            }
            let thirdData = self.data.secondData[index].children ? self.data.secondData[index].children : [];
            thirdData.forEach(element => {
                if(!element.isSelect){
                    element.isSelect = false;
                }
            });
            if(thirdData.length != 0) {  //有第三级
                self.setData({
                    currentSecond: index,
                    thirdData: thirdData,
                    secondData: secondData,
                    maskOpen: true
                })
            }else {  //没有三级
                self.setData({
                    currentSecond: index,
                    thirdData: thirdData,
                    secondData: secondData,
                    maskOpen: false
                })
                self.setData({
                    page: 1
                })
                self.getGoodsList();
            }
            
        }
    },
    //三级选择
    onSelectTap: function(e){
        let self = this;
        let index = e.currentTarget.dataset.index;
        let thirdData = self.data.thirdData;
        thirdData.forEach((item, i)=>{
            if(i == index){
                item.isSelect = !item.isSelect;
            }
        })
        self.setData({
            thirdData: thirdData
        })
    },
    //重置
    onResetTap: function(){
        let self = this;
        let thirdData = self.data.thirdData;
        thirdData.forEach((item, i)=>{
            item.isSelect = false;
        })
        self.setData({
            thirdData: thirdData
        })
    },
    //确定
    onOktap: function(){
        let self = this;
        let thirdData = self.data.thirdData;
        let select = [];
        let selectName = [];
        let selectTitle = self.data.selectTitle;
        let selectList = self.data.selectList;
        let secondData = self.data.secondData;
        let index = self.data.currentSecond;
        thirdData.forEach((item)=>{
            if(item.isSelect) {
                select.push(item.id);
                selectName.push(item.title)
            }
        })
        selectList[index] = select.join(',');       //搜索的ID
        selectTitle[index] = selectName.join(',');  //展示的title
        secondData[index].isSelect = self.data.selectList[index] ? 'true' : !secondData[index].isSelect;  //选择状态取反
        self.setData({
            maskOpen: false,
            selectList: selectList,
            selectTitle: selectTitle,
            secondData: secondData,
            brandIds: selectList[1] ? selectList[1] : '',
            classifyIds: selectList[2] ? selectList[2] : ''
        })
        self.setData({
            page: 1
        })
        self.getGoodsList();
    },
    //点击蒙版
    onCloseTap: function(){
        let self = this;
        self.setData({
            maskOpen: false
        })
    },
    //商品详情
    onGoodsTap(e){
        const self = this;
        const {id,index,type} = e.currentTarget.dataset;
        const item = self.data.goodsList[index];
        _g.navigateTo({
            url: 'pages/goods/detail',
            param: {
                id: id,
                platformFlag: item.platformFlag,
            }
        },self)
    },
    //搜索页
    onSearchTap() {
        const self = this;
        _g.redirectTo({
            url: 'pages/search/index',
            param:{
                platformFlag: self.data.platformFlag
            }
        },self);
    },
    onReachBottom: function(){
        let self = this;
        if(self.data.hasNextPage){
            self.getGoodsList();
        }else {
            // _g.toast({
            //     title: '没有更多数据了'
            // });
        }
    }
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