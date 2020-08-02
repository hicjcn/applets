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
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
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
  },
  getPageData: function(pageNo = 1) {
    const that = this
    http.getRequest('/api/candidates', {
      pageNo: pageNo
    }, function(res) {
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
  noticeHR: function(e) {
    const that = this
    let id = e.currentTarget.dataset.id
    http.getRequest('/api/chat}', {
      id: id
    }, function(res) {
      if (res.success) {
        wx.showModal({
          title: '成功',
          content: '已通知HR沟通此候选人',
          showCancel: false,
          confirmText: '我知道了',
          success (res) {
            console.log('点击确认')
          }
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
    })
  },
  goToDetail: function(e) {
    let id = e.currentTarget.dataset.id
    console.log('id', id)
    // 打开文件
    wx.showLoading({
      title: '加载中',
    })
    wx.downloadFile({
      url: http.host + '/sysFileInfo/download?id=' + id,
      success: function (res) {
        console.log(res)
        var filePath = res.tempFilePath
        wx.openDocument({
          filePath: filePath,
          fileType: 'pdf',
          success: function (res) {
            console.log('打开文档成功')
          },
          fail: function (err) {
            console.log(err)
          }
        })
      },
      complete: function (res) {
        wx.hideLoading()
      }
    })    

    // wx.navigateTo({
    //   url: '../detail/detail?id=' + id,
    // })
  },
    /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      pageData: []
    })
    this.getPageData()
  },

})
