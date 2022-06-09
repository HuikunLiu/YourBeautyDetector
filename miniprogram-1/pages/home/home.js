// pages/home/home.js
const app = getApp()


Page({

  /**
   * 页面的初始数据
   */
  data: {
    wh: 0,
    //摄像头朝向
    position: 'front',
    //照片路径
    src: '',
    //是否展示照片
    isShowPic: false,
    isShowBox: false,
    //人脸信息
    faceInfo: null,

    //中英文映射关系
    map: {
      expression: {
        "none":"不笑",
        "smile":"微笑",
        "laugh":"大笑"
      },
      face_shape: {
        "square": "正方形",
        "triangle":"三角形",
        "oval": "椭圆",
        "heart": "心形",
        "round": "圆形"
      },
      emotion: {
        angry:"愤怒", 
        disgust:"厌恶" ,
        fear:"恐惧" ,
        happy:"高兴" ,
        sad:"伤心" ,
        surprise:"惊讶" ,
        neutral:"无表情" ,
        pouty: "撅嘴" ,
        grimace:"鬼脸"
      },
      mask: {
        0 : "无",
        1 : "有"
      },
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const sysInfo = wx.getSystemInfoSync()

    this.setData({
      wh: sysInfo.windowHeight
    })

  },

  //切换摄像头
  reverseCamera() {
    const newPosition = this.data.position === 'front' ? 'back' : 'front'
    this.setData({
      position : newPosition
    })

  },

  //拍照
  takePhoto() {
    //创建相机的实例对象
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        //console.log(res.tempImagePath)
        this.setData({
          src: res.tempImagePath,
          isShowPic: true
        },()=>{
          this.getFaceInfo()
        })
      },
      fail: () => {
        console.log("拍照失败!")
        this.setData({
          src: ''
        })
      }
    })
  },

  choosePhoto() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original'],
      sourceType: ['album'],
      success: res=>{
        //console.log(res)
        if(res.tempFilePaths.length > 0){
          this.setData({
            src: res.tempFilePaths[0],
            isShowPic: true
          },()=>{
            this.getFaceInfo()
          })
        }
        
      },
      fail: () => {
        console.log("选择照片失败")
        this.setData({
          src: ''
        })
      }
    })

  },

  //重新选择照片
  reChoose() {
    this.setData({
      isShowPic: false,
      src: '',
      isShowBox: false
    })
  },

  //测颜值的函数
  getFaceInfo() {
    const token = app.globalData.access_token
    if(!token){
      return wx.showToast({
        title: '鉴权失败!',
      })
    }
    wx.showLoading({
      title: '颜值检测中'
    })
    //颜值检测
    //照片转码为base64
    const fileManager = wx.getFileSystemManager()
    const fileStr = fileManager.readFileSync(this.data.src, 'base64')
    
      wx.request({
      url: 'https://aip.baidubce.com/rest/2.0/face/v3/detect?access_token=' + token,
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        image_type: 'BASE64',
        image: fileStr,
        face_field: 'beauty,age,expression,face_shape,emotion,mask,age',
      },
      success: res=>{
        console.log(res)
        if(res.data.result.face_num < 1){
          wx.showToast({
            title: '未检测到人脸！',
          })
        }
        res.data.result.face_list[0].beauty += 20
        res.data.result.face_list[0].beauty = res.data.result.face_list[0].beauty.toFixed(2)
        if(res.data.result.face_list[0].beauty >= 100) res.data.result.face_list[0].beauty = 100

        this.setData({
          faceInfo: res.data.result.face_list[0],
          isShowBox: true
        })
      },
      fail: ()=>{
        wx.showToast({
          title: '颜值检测失败！',
        })
      },
      complete: ()=>{
        wx.hideLoading()
      }

    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})