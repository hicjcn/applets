const host = 'https://test.1xhitech.com/api'

/**
 * 请求头 'Authorization': "Bearer " + wx.getStorageSync("token"),
 */
var header = {
  'content-type': 'application/json',
  'os': 'android',
  'version': '1.0.0',
  'device_token': 'ebc9f523e570ef14',
}

/**
 * 供外部post请求调用  
 */
function post(url, params, onSuccess, onFailed, auth = true) {
  console.log("请求方式：", "POST")
  request(url, params, "POST", onSuccess, onFailed, auth);

}

/**
 * 供外部get请求调用
 */
function get(url, params, onSuccess, onFailed, auth = true) {
  console.log("请求方式：", "GET")
  request(url, params, "GET", onSuccess, onFailed, auth);
}

/**
 * function: 封装网络请求
 * @url URL地址
 * @params 请求参数
 * @method 请求方式：GET/POST
 * @onSuccess 成功回调
 * @onFailed  失败回调
 * @auth  是否带上token
 */

function request(url, params, method, onSuccess, onFailed, auth = true) {
  console.log('请求url：' + url);
  wx.showLoading({
    title: "正在加载中...",
  })

  let token = wx.getStorageSync("token")
  if (auth && token) {
    header.Authorization = "Bearer " + token
  }

  console.log("请求头：", header)
  wx.request({
    url: host + url,
    data: dealParams(params),
    method: method,
    header: header,
    success: function(res) {
      wx.hideLoading();
      console.log('响应：', res.data);

      if (res.data) {
        /** start 根据需求 接口的返回状态码进行处理 */
        if (res.statusCode == 200) {
          onSuccess(res.data); //request success
        } else {
          onFailed(res.data.message); //request failed
        }
        /** end 处理结束*/
      }
    },
    fail: function(error) {
      onFailed(""); //failure for other reasons
    }
  })
}

/**
 * function: 根据需求处理请求参数：添加固定参数配置等
 * @params 请求参数
 */
function dealParams(params) {
  console.log("请求参数:", params)

  // 遍历移除null参数
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const element = params[key];
      if (element === null) {
        delete params[key]
      }
    }
  }

  return params;
}


// 1.通过module.exports方式提供给外部调用
module.exports = {
  host: host,
  postRequest: post,
  getRequest: get,
}
