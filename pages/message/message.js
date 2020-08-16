// pages/message/message.js
var http = require('../../utils/request')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    message: '',
    canSubmit: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  textareaAInput: function(e) {
    this.setData({
      message: e.detail.value,
      canSubmit: e.detail.value && e.detail.value.length > 0
    })
  },

  submit: function(e) {
    //发起网络请求
    http.postRequest('/api/login', {
      message: this.message
    }, function(res) {
      //  成功
      if (res.success) {
        wx.showModal({
          title: '提示',
          content: '已通知HR想看的方向',
          showCancel: false,
          confirmText: '我知道了',
          success (res) {
            wx.navigateBack()
          }
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
        content: '提交想看的方向失败',
        showCancel: false,
        confirmText: '我知道了'
      })
    })
  }
})