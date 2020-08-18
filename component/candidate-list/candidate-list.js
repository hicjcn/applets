// component/candidate-list.js
var http = require('../../utils/request')
const cachePath = wx.env.USER_DATA_PATH + '/cache/'

Component({

  /**
   * 使用全局样式
   */
  options: {
    addGlobalClass: true
  },

  /**
   * 组件的属性列表
   */
  properties: {
    data: {
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    noticeHR: function(e) {
      const that = this
      let id = e.currentTarget.dataset.id
      http.getRequest('/api/chat', {
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
  }
})
