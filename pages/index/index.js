//index.js
//获取应用实例
const app = getApp()
var http = require('../../utils/request')
const waitTime = 1000

Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    userInfo: {},
    pageData: [],
    tabData: [],
    hasUserInfo: false,
    requesting: false,
    page: 1,
    TabCur: null,
    searchWord: null,
    isMyTab: false,
    countTime: waitTime,          //延迟搜索 时间
    searchWaiting: false,  //是否等待搜索倒计时中
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad: function () {
    const that = this
    if (app.globalData.userInfo) {
      that.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      // 尝试登陆
      that.login()
    } else {
      // 查看是否授权
      wx.getSetting({
        success (res){
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称
            wx.getUserInfo({
              success: function(res) {
                that.getUserInfo(res)
              }
            })
          }
        }
      })
    }
    this.getTabData()
  },
  getPageData: function(pageNo = 1) {
    const that = this
    that.setData({
			requesting: true
		})

    http.getRequest('/api/candidates', {
      pageNo: pageNo,
      tagCode: that.data.TabCur,
      search: that.data.searchWord
    }, function(res) {
      that.setData({
				requesting: false
			})

      if (res.success) {
        let pageData = []
        pageData = pageData.concat(res.data)
        that.setData({
          pageData: pageData
        })
      } else{
        wx.showModal({
          title: '提示',
          content: res.message,
          showCancel: false,
          confirmText: '我知道了'
        })
      }
    }, function(err) {
      wx.showToast({
        title: '获取数据失败',
        icon: 'none',
        duration: 2000
      })

      that.setData({
				requesting: false
			})
    })
  },
  getUserInfo: function(e) {
    console.log(e)
    let detail = e.detail || e
    if (detail.errMsg !== 'getUserInfo:ok') {
      return
    }
    // 保存用户信息
    app.globalData.userInfo = detail.userInfo
    this.setData({
      userInfo: detail.userInfo,
      hasUserInfo: true
    })

    // 尝试登陆
    this.login()
  },

  login: function() {
    wx.login({
      success: (res) => {
        console.log('微信登陆Res', res)
        if (res.code) {
          //发起网络请求
          http.postRequest('/api/login', {
            code: res.code,
            userInfo: app.globalData.userInfo
          }, function(res) {
            // 成功登录 保存token
            if (res.success && res.data) {
              app.globalData.token = res.data
              wx.setStorageSync('token', res.data)
            } else{
              wx.showModal({
                title: '提示',
                content: res.message,
                showCancel: false,
                confirmText: '我知道了'
              })
            }
          }, function (res) {
            // 登录失败提示
            wx.showModal({
              title: '提示',
              content: '用户账户登录失败',
              showCancel: false,
              confirmText: '我知道了'
            })
          })
        } else {
          wx.showToast({
            title: '获取微信登陆Code失败',
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: (res) => {
        console.log(res)
        wx.showToast({
          title: '微信登陆失败，请重新进入小程序重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  
  getTabData () {
    const that = this
    //发起网络请求
    http.getRequest('/api/tags', {}, function(res) {
      //  Tab数据
      if (res.success && res.data && res.data.length > 0) {
        that.setData({
          tabData: res.data,
          TabCur: res.data[0].code
        })
        that.getPageData()
      } else{
        wx.showModal({
          title: '提示',
          content: res.message,
          showCancel: false,
          confirmText: '我知道了'
        })
      }
    }, function (res) {
      // 登录失败提示
      wx.showModal({
        title: '提示',
        content: '获取标签分类失败',
        showCancel: false,
        confirmText: '我知道了'
      })
    })
  },

  onPullDownRefresh:function(){
    this.setData({
      pageData: []
    })
    this.getPageData()
    wx.stopPullDownRefresh()
  },

  toMy() {
    this.setData({
      isMyTab: true
    })
  },

  toHome(){
    this.setData({
      isMyTab: false
    })
  },

  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id
    })
    this.getPageData()
  },

  search (e) {
    this.setData({
      countTime:waitTime,
      searchWord: e.detail.value
    })
    //是否处于搜索倒计时中
   if (!this.data.searchWaiting){
    this.timer()
   }
  },

  /**
   *  延迟搜索  
   */
  timer: function () {
   
    var that=this;
   
    this.setData({
      searchWaiting: true
    })

    let promise = new Promise((resolve, reject) => {
      let setTimer = setInterval(
        () => {
          console.log('搜索倒计时: ' + that.data.countTime);
          this.setData({
            countTime: this.data.countTime - 500
          })
          if (this.data.countTime <= 0) {
            console.log('开始搜索: ' + that.data.searchWord);

            this.setData({
              countTime: waitTime,
              searchWaiting: false,
            })
            resolve(setTimer)
          }
        }
        , 500)
    })
    promise.then((setTimer) => {
      that.getPageData();//获取列表
      clearInterval(setTimer)//清除计时器
    })
  },
  

  toChatList(){
    wx.navigateTo({
      url: '/pages/chat-list/chat-list'
    })
  },

  toMessage(){
    wx.navigateTo({
      url: '/pages/message/message'
    })
  }

})
