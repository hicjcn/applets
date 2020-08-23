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
    tabData: [{value: "算法", code: "sf"}, {value: "数据", code: "sj"}, {value: "工程", code: "gc"}],
    hasUserInfo: false,
    requesting: false,
    page: 1,
    TabCur: 'sf',
    TabCurIndex: 0,
    aheight: 700,
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

  onReady() {
    this.computeScrollViewHeight()
  },

  //计算 scroll-view 的高度
  computeScrollViewHeight() {
    let that = this
    let screenHeight = wx.getSystemInfoSync().windowHeight
    that.setData({
      aheight: screenHeight - 155
    })
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
        that.setData({
          pageData: res.data
        })
      } else{
        if (res.code === 1011009) {
          wx.showModal({
            title: '提示',
            content: '请先登录后查看数据',
            showCancel: false,
            confirmText: '我知道了',
            success: () => {
              // 转跳到我的界面
              that.toMy()
            }
          })
          return
        }
        if (res.code === 1011008) {
          wx.showModal({
            title: '提示',
            content: '登录身份已过期，请重新进入小程序刷新',
            showCancel: false,
            confirmText: '我知道了'
          })
          return
        }
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
    const that = this
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
              content: '用户账户登录失败',
              showCancel: false,
              confirmText: '我知道了'
            })
          }, false)
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
    }, false)
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

  toHome(e){
    const that = this
    let diffTouch = this.touchEndTime - this.touchStartTime;
    let curTime = e.timeStamp;
    let lastTime = this.lastTapDiffTime;
    this.lastTapDiffTime = curTime;
    
    this.setData({
      isMyTab: false
    })

    //两次点击间隔小于300ms, 认为是双击
    let diff = curTime - lastTime;
    if (diff < 300) {
      console.log("双击刷新")
      wx.startPullDownRefresh()
    }
  },

  tabSelect(e) {
    let code = e.currentTarget.dataset.id
    let index = 0
    for (; index < this.data.tabData.length; index++) {
      const element = this.data.tabData[index];
      if (element.code === code) {
        break
      }
    }
    this.setData({
      TabCur: code,
      TabCurIndex: index
    })
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
  },

  swiperTabView (e) {
    this.setData({
      TabCur: this.data.tabData[e.detail.current].code
    })
  }
})
