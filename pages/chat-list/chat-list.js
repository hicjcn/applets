// pages/chat-list/chat-list.js
var http = require('../../utils/request')
import { timeHandle } from '../../utils/util'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageData: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getData()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getData()
  },

  getData() {
    const that = this
    http.getRequest('/api/chats', {}, function(res) {
      if (res.success) {
        let pageData = []
        pageData = pageData.concat(res.data)

        // 处理时间格式
        for (let index = 0; index < pageData.length; index++) {
          let element = pageData[index];
          element.time = timeHandle(element.createTime)
        }

        that.setData({
          pageData: pageData
        })
      } else{
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
    })
  }
})