import axios from 'axios'

axios.interceptors.response.use(res => {
  if (typeof res.data !== 'object') {
      console.log('服务端异常！')
    return Promise.reject(res)
  }
  if (res.data.status == -1) {
    console.log('出错了==>', res.data.message)
    if (res.data.message) {
        console.log('status == -1', res.data.message)
    }
    // if (res.data.code == 401) {
    //   window.location.href = '/login'
    // }
    // if (res.data.code == 413) {
    //   Toast.show('图片不得超过 50kb')
    // }
    return Promise.reject(res.data)
  }

  return res.data
})

export default axios
