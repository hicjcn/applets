//index.js
//获取应用实例
const app = getApp()
var http = require('../../utils/request')

Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    userInfo: {},
    pageData: [],
    hasUserInfo: false,
    requesting: false,
    page: 1,
    TabCur: 0,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    this.getPageData()
  },
  getPageData: function(pageNo = 1) {
    const that = this
    that.setData({
			requesting: true
		})

    http.getRequest('/api/candidates', {
      pageNo: pageNo
    }, function(res) {
      that.setData({
				requesting: false
			})

      if (res.success) {
        let pageData = that.data.pageData
        pageData = pageData.concat(res.data)
        console.log(pageData)
        that.setData({
          pageData: pageData
        })
      } else{
        wx.showModal({
          title: '提示',
          content: res.message,
          showCancel: false,
          confirmText: '我知道了',
          success (res) {
            console.log('点击确认')
          }
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
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  onPullDownRefresh:function(){
    this.setData({
      pageData: []
    })
    this.getPageData()
    wx.stopPullDownRefresh()
  },

  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id
    })
  }
})
