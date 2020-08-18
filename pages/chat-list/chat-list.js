// pages/chat-list/chat-list.js
var http = require('../../utils/request')
const cachePath = wx.env.USER_DATA_PATH + '/cache/'
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
  },

  downloadFile: function (id, name) {
    // 打开文件
    wx.showLoading({
      title: '加载中',
    })

    wx.downloadFile({
      filePath: cachePath + name,
      url: http.host + '/sysFileInfo/download?id=' + id,
      success: function (res) {
        console.log(res)
        var filePath = cachePath + name
        wx.openDocument({
          showMenu: true,
          filePath: filePath,
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
  },
  goToDetail: function(e) {
    const that = this
    let id = e.currentTarget.dataset.id
    let name = e.currentTarget.dataset.name

    // 检查参数
    if (!id || !name) {
      wx.showToast({
        title: '未获取到文件参数',
        icon: 'none',
        duration: 2000
      })
      return
    }

    // 检查文件夹
    let fm = wx.getFileSystemManager()
    try {
      // 访问成功则存在
      fm.accessSync(cachePath)
    } catch (error) {
      // 不存在则新建
      fm.mkdirSync(cachePath, true)
    }
  
    that.downloadFile(id, name)
    // wx.navigateTo({
    //   url: '../detail/detail?id=' + id,
    // })
  }

})