<template>
  <div id="app">
    <div class="container">
      <h1 class="title">相机畸变校正参数计算器</h1>

      <div>
        <label style="height: 36px; line-height: 36px">常用参数选择</label>
        <a-select style="width: 100%" @change="cameraSelected">
          <a-select-opt-group v-for="(group, i) in cameras" :key="'g' + i">
            <span slot="label">{{ group.groupName }}</span>
            <a-select-option
              v-for="(camera, j) in group.cameras"
              :key="'g' + i + 'i' + j"
              :value="i + '-' + j"
            >
              {{ camera.name }}
            </a-select-option>
          </a-select-opt-group>
        </a-select>
      </div>

      <div class="separate"></div>

      <div class="camera-parameter">
        <h1 style="font-size: 1.4rem">相机参数</h1>

        <div class="sensor">
          <h1 style="font-size: 1rem">传感器尺寸(mm)</h1>
          <a-row>
            <a-col :span="4" class="label-after" style="text-align: end"
              ><label style="height: 36px; line-height: 36px">宽</label></a-col
            >
            <a-col :span="8">
              <a-input-number v-model="camera.sensor.width" style="width: 100%"
            /></a-col>
            <a-col :span="4" class="label-after" style="text-align: end"
              ><label style="height: 36px; line-height: 36px">高</label></a-col
            >
            <a-col :span="8">
              <a-input-number
                v-model="camera.sensor.height"
                style="width: 100%"
            /></a-col>
          </a-row>
        </div>

        <div class="resolution">
          <h1 style="font-size: 1rem">全尺寸分辨率</h1>
          <a-row>
            <a-col :span="4" class="label-after" style="text-align: end"
              ><label style="height: 36px; line-height: 36px">宽</label></a-col
            >
            <a-col :span="8">
              <a-input-number
                v-model="camera.resolution.width"
                style="width: 100%"
            /></a-col>

            <a-col :span="4" class="label-after" style="text-align: end"
              ><label style="height: 36px; line-height: 36px">高</label></a-col
            >
            <a-col :span="8">
              <a-input-number
                v-model="camera.resolution.height"
                style="width: 100%"
            /></a-col>
          </a-row>
        </div>

        <div class="pix-size">
          <a-row>
            <a-col :span="12" class="label-after" style="text-align: end">
              <label style="height: 36px; line-height: 36px"
                >像元大小(μm)</label
              ></a-col
            >
            <a-col :span="12" class="label-after" style="text-align: start">
              <label style="height: 36px; line-height: 36px">{{
                pixelSize
              }}</label></a-col
            >
          </a-row>
        </div>

        <div class="use-resolution">
          <h1 style="font-size: 1rem">使用分辨率</h1>
          <a-row>
            <a-col :span="4" class="label-after" style="text-align: end">
              <label style="height: 36px; line-height: 36px">照片比例</label>
            </a-col>
            <a-col :span="20" class="label-after" style="text-align: start">
              <a-radio-group
                v-model="aspectRatioSelectedIndex"
                button-style="solid"
                @change="aspectRatioChange"
              >
                <a-radio-button
                  v-for="(ar, i) in aspectRatios"
                  :key="i"
                  :value="i"
                >
                  {{ ar.name }}
                </a-radio-button>

                <a-radio-button :value="-1000"> 自定义 </a-radio-button>
                <a-input
                  v-if="aspectRatioSelectedIndex === -1000"
                  v-model="userInputAspectRatio"
                  style="width: 76px; height: 36px; margin-left: 10px"
                />
              </a-radio-group>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="4" class="label-after" style="text-align: end"
              ><label style="height: 36px; line-height: 36px">宽</label></a-col
            >
            <a-col :span="8">
              <label style="height: 36px; line-height: 36px">
                {{ useResolutionWidthHeight[0] }}</label
              >
            </a-col>

            <a-col :span="4" class="label-after" style="text-align: end"
              ><label style="height: 36px; line-height: 36px">高</label></a-col
            >
            <a-col :span="8">
              <label style="height: 36px; line-height: 36px">
                {{ useResolutionWidthHeight[1] }}</label
              >
            </a-col>
          </a-row>
        </div>
      </div>

      <div class="separate"></div>

      <div class="calibrate-parameter">
        <div>
          <h1 style="font-size: 1.4rem">校正参数</h1>
          <div class="open">
            <a-button type="primary" @click="showDJICalibrateInputModal">
              大疆畸变参数自动解析填入
            </a-button>
            <a-modal
              v-model="djiCalibrateInputModalVisible"
              title="大疆畸变参数自动解析填入"
              cancelText="取消"
              okText="确定"
              @ok="djiCalibrateInputModalOK"
            >
              <p>任意一张照片右键以记事本方式打开，搜索「DewarpData」</p>
              <p>复制后面的值填入，复制引号中的内容，类似这样的</p>
              <p style="word-break: break-all">
                2020-05-13;3714.07,3707.07,-8.28,-17.52,-0.279234,0.125598,0.00118779,-0.000255019,-0.0410782
              </p>
              <a-input v-model="djiCalibrateValue" />
            </a-modal>
          </div>
        </div>

        <div class="focal-length-in-pix">
          <h1 style="font-size: 1rem">焦距</h1>
          <a-row>
            <a-col :span="4" class="label-after" style="text-align: end"
              ><label style="height: 36px; line-height: 36px"
                >fx(pixel)</label
              ></a-col
            >
            <a-col :span="8">
              <a-input-number
                v-model="calibrate.focal.focalLenInPix_X"
                style="width: 100%"
            /></a-col>
            <a-col :span="4" class="label-after" style="text-align: end"
              ><label style="height: 36px; line-height: 36px"
                >fy(pixel)</label
              ></a-col
            >
            <a-col :span="8">
              <a-input-number
                v-model="calibrate.focal.focalLenInPix_Y"
                style="width: 100%"
            /></a-col>
          </a-row>
          <a-row>
            <a-col :span="4" class="label-after" style="text-align: end"
              ><label style="height: 36px; line-height: 36px"
                >焦距(pixel)</label
              ></a-col
            >
            <a-col :span="8">
              <label style="height: 36px; line-height: 36px">{{
                focalLenInPix
              }}</label></a-col
            >
            <a-col :span="4" class="label-after" style="text-align: end"
              ><label style="height: 36px; line-height: 36px"
                >焦距（mm）</label
              ></a-col
            >
            <a-col :span="8">
              <label style="height: 36px; line-height: 36px">{{
                focalLenInMillimeter
              }}</label></a-col
            >
          </a-row>
        </div>

        <div class="image-main-point-in-pix">
          <h1 style="font-size: 1rem">像主点坐标</h1>
          <a-row>
            <a-col :span="4" class="label-after" style="text-align: end"
              ><label style="height: 36px; line-height: 36px"
                >cx(中心)</label
              ></a-col
            >
            <a-col :span="8">
              <a-input-number v-model="calibrate.mainPoint.centerCX"
            /></a-col>
            <a-col :span="4" class="label-after" style="text-align: end"
              ><label style="height: 36px; line-height: 36px"
                >cy(中心)</label
              ></a-col
            >
            <a-col :span="8">
              <a-input-number v-model="calibrate.mainPoint.centerCY"
            /></a-col>
          </a-row>
          <a-row>
            <a-col :span="4" class="label-after" style="text-align: end"
              ><label style="height: 36px; line-height: 36px"
                >cx(左上角)</label
              ></a-col
            >
            <a-col :span="8"
              ><label style="height: 36px; line-height: 36px">{{
                leftTopCX
              }}</label></a-col
            >
            <a-col :span="4" class="label-after" style="text-align: end"
              ><label style="height: 36px; line-height: 36px"
                >cy(左上角)</label
              ></a-col
            >
            <a-col :span="8"
              ><label style="height: 36px; line-height: 36px">{{
                leftTopCY
              }}</label></a-col
            >
          </a-row>
        </div>

        <div class="radial-direction-calibrate">
          <h1 style="font-size: 1rem">径向畸变校正参数</h1>
          <a-row>
            <a-col :span="2" class="label-after" style="text-align: end"
              ><label style="height: 36px; line-height: 36px">k1</label></a-col
            >
            <a-col :span="6">
              <a-input v-model="calibrate.radialDirection.k1"
            /></a-col>
            <a-col :span="2" class="label-after" style="text-align: end"
              ><label style="height: 36px; line-height: 36px">k2</label></a-col
            >
            <a-col :span="6">
              <a-input v-model="calibrate.radialDirection.k2"
            /></a-col>
            <a-col :span="2" class="label-after" style="text-align: end"
              ><label style="height: 36px; line-height: 36px">k3</label></a-col
            >
            <a-col :span="6">
              <a-input v-model="calibrate.radialDirection.k3"
            /></a-col>
          </a-row>
        </div>

        <div class="tangential-direction-calibrate">
          <h1 style="font-size: 1rem">切向畸变校正参数</h1>
          <a-row>
            <a-col :span="6" class="label-after" style="text-align: end"
              ><label style="height: 36px; line-height: 36px">p1</label></a-col
            >
            <a-col :span="6">
              <a-input v-model="calibrate.tangentialDirection.p1"
            /></a-col>
            <a-col :span="6" class="label-after" style="text-align: end"
              ><label style="height: 36px; line-height: 36px">p2</label></a-col
            >
            <a-col :span="6">
              <a-input v-model="calibrate.tangentialDirection.p2"
            /></a-col>
          </a-row>
        </div>
      </div>

      <div class="separate"></div>

      <a-button type="primary" @click="ok" style="display: none">
        确定
      </a-button>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import {
  Button,
  Row,
  Col,
  Input,
  InputNumber,
  Select,
  Radio,
  Modal
} from 'ant-design-vue'
Vue.use(Modal)
export default {
  name: 'App',
  data() {
    return {
      camera: {
        sensor: {
          width: 0,
          height: 0
        },
        resolution: {
          width: 0,
          height: 0
        }
      },
      calibrate: {
        focal: {
          focalLenInPix_X: 0,
          focalLenInPix_Y: 0
        },
        mainPoint: {
          centerCX: 0,
          centerCY: 0
        },
        radialDirection: {
          k1: 0,
          k2: 0,
          k3: 0
        },
        tangentialDirection: {
          p1: 0,
          p2: 0
        }
      },
      aspectRatioSelectedIndex: 0,
      userInputAspectRatio: '',
      djiCalibrateInputModalVisible: false,
      djiCalibrateValue: '',

      cameras: [
        {
          groupName: '大疆',
          cameras: [
            {
              sensor: {
                width: 13.2,
                height: 8.8
              },
              resolution: {
                width: 5472,
                height: 3648
              },
              name: '大疆精灵4RTK（FC6310R）'
            },
            {
              sensor: {
                width: 7.4,
                height: 5.6
              },
              resolution: {
                width: 5184,
                height: 3888
              },
              name: '大疆禅思ZenmuseH20主相机（变焦相机）'
            }
          ]
        },
        {
          groupName: '赛尔',
          cameras: [
            {
              sensor: {
                width: 23.5,
                height: 15.6
              },
              resolution: {
                width: 6000,
                height: 4000
              },
              name: '赛尔102S(定焦)'
            },
            {
              sensor: {
                width: 35.9,
                height: 24
              },
              resolution: {
                width: 7952,
                height: 5304
              },
              name: '赛尔202S下视'
            },
            {
              sensor: {
                width: 35.7,
                height: 23.8
              },
              resolution: {
                width: 9504,
                height: 6336
              },
              name: '赛尔6100(40/56mm定焦)'
            }
          ]
        }
      ],
      aspectRatios: [
        {
          aspectRatio: 1.3333333333333333,
          name: '4:3'
        },
        {
          aspectRatio: 1.5,
          name: '3:2'
        },
        {
          aspectRatio: 1,
          name: '1:1'
        },
        {
          aspectRatio: 1.7777777777777778,
          name: '16:9'
        }
      ]
    }
  },
  components: {
    AButton: Button,
    ARow: Row,
    ACol: Col,
    AInput: Input,
    AInputNumber: InputNumber,
    ASelect: Select,
    ASelectOption: Select.Option,
    ASelectOptGroup: Select.OptGroup,
    ARadioGroup: Radio.Group,
    ARadioButton: Radio.Button,
    AModal: Modal
  },
  computed: {
    focalLenInPix() {
      return (
        (this.calibrate.focal.focalLenInPix_X +
          this.calibrate.focal.focalLenInPix_Y) /
        2
      )
    },

    focalLenInMillimeter() {
      return (this.pixelSize * this.focalLenInPix) / 1000
    },

    pixelSize() {
      let x = this.camera.sensor.width / this.camera.resolution.width
      let y = this.camera.sensor.height / this.camera.resolution.height
      return (x < y ? x : y) * 1000
    },

    leftTopCX() {
      let resolutionWidth = this.useResolutionWidthHeight[0]
      return resolutionWidth / 2 + this.calibrate.mainPoint.centerCX
    },

    leftTopCY() {
      let resolutionHeight = this.useResolutionWidthHeight[1]
      return resolutionHeight / 2 + this.calibrate.mainPoint.centerCY
    },

    userInputAspectRatioValue() {
      let aspectRatio = 0
      let user = this.userInputAspectRatio
      if (user.indexOf(':') > 0) {
        let ar = user.split(':')
        aspectRatio = ar[0] / ar[1]
      } else if (user.indexOf('：') > 0) {
        let ar = user.split('：')
        aspectRatio = ar[0] / ar[1]
      }
      if (
        isNaN(aspectRatio) ||
        aspectRatio === null ||
        aspectRatio === undefined
      ) {
        aspectRatio = 0
      }
      return aspectRatio
    },

    useResolutionWidthHeight() {
      let sensorAR =
        this.camera.resolution.width / this.camera.resolution.height
      if (
        isNaN(sensorAR) ||
        sensorAR === null ||
        sensorAR === undefined ||
        sensorAR === 0
      ) {
        return [0, 0]
      }

      let ar = 0
      if (this.aspectRatioSelectedIndex === -1000) {
        ar = this.userInputAspectRatioValue
      } else {
        ar = this.aspectRatios[this.aspectRatioSelectedIndex].aspectRatio
      }
      if (isNaN(ar) || ar === null || ar === undefined || ar === 0) {
        return [0, 0]
      }

      if (ar >= sensorAR) {
        return [this.camera.resolution.width, this.camera.resolution.width / ar]
      } else {
        return [
          this.camera.resolution.height * ar,
          this.camera.resolution.height
        ]
      }
    }
  },
  methods: {
    cameraSelected(value) {
      const indexes = value.split('-')
      const camera = this.cameras[indexes[0]].cameras[indexes[1]]
      this.camera.sensor.width = camera.sensor.width
      this.camera.sensor.height = camera.sensor.height
      this.camera.resolution.width = camera.resolution.width
      this.camera.resolution.height = camera.resolution.height
    },
    aspectRatioChange(e) {
      this.aspectRatioSelectedIndex = e.target.value
    },
    showDJICalibrateInputModal() {
      this.djiCalibrateInputModalVisible = true
    },
    djiCalibrateInputModalOK() {
      let calibrate = this.djiCalibrateValue
      calibrate = calibrate.replaceAll('"', '')
      let date_info = calibrate.split(';')
      let info = date_info[1]
      let infos = info.split(',')

      let fx = infos[0]
      let fy = infos[1]
      let cx = infos[2]
      let cy = infos[3]
      let k1 = infos[4]
      let k2 = infos[5]
      let p1 = infos[6]
      let p2 = infos[7]
      let k3 = infos[8]

      this.calibrate.focal.focalLenInPix_X = Number(fx)
      this.calibrate.focal.focalLenInPix_Y = Number(fy)
      this.calibrate.mainPoint.centerCX = Number(cx)
      this.calibrate.mainPoint.centerCY = Number(cy)
      this.calibrate.radialDirection.k1 = Number(k1)
      this.calibrate.radialDirection.k2 = Number(k2)
      this.calibrate.radialDirection.k3 = Number(k3)
      this.calibrate.tangentialDirection.p1 = Number(p1)
      this.calibrate.tangentialDirection.p2 = Number(p2)

      this.djiCalibrateInputModalVisible = false
    },

    ok() {
      console.log('fly height', this.flyingHeight)
      console.log('camera', this.camera)
      console.log('aspectRatio', this.aspectRatio)
    }
  }
}
</script>

<style>
.jt-camera-calibrate-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff url('./assets/r.jpg') no-repeat center;
  background-size: cover;
  width: 100%;
  height: 100%;
  z-index: 0;
}
</style>
<style scoped>
* {
  margin: 0;
  padding: 0;
  font-family: 'Avenir Next', 'Helvetica Neue', sans-serif, Arial,
    'Source Sans Pro', -apple-system, Roboto, BlinkMacSystemFont, 'Segoe UI' !important;
  font-size: 16px;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
  color: #000;
}

.title {
  font-size: 1.8rem;
  text-align: center;
}

#app {
  width: 960px;
  height: 100%;
  display: flex;
  position: relative;
  z-index: 1;
}

#app::before {
  content: '';
  position: absolute;
  background-color: #fff;
  background: rgba(255 255 255 /0.75);
  filter: blur(3rem);
  z-index: -1;
  width: 100%;
  height: 100%;
  top: 0px;
  left: 0px;
  overflow: hidden;
}

.container {
  margin: auto;
  max-width: 960px;
  width: 100%;
  padding: 30px;
  background: rgba(255 255 255 /0.85);
  border-radius: 1rem;
  -webkit-box-shadow: #666 0px 0px 10px;
  -moz-box-shadow: #666 0px 0px 10px;
  box-shadow: #666 0px 0px 10px;
}

.label-after {
  padding-right: 1rem;
}

.ant-radio-button-wrapper {
  margin: 0;
  padding: 0 15px;
  color: rgba(0, 0, 0, 0.65);
}

.ant-radio-group input {
  padding: 4px 11px;
  color: rgba(0, 0, 0, 0.65);
}

.open .ant-btn-primary {
  padding: 0 12px;
  color: #fff;
}

.separate {
  width: 100%;
  height: 2px;
  background-color: rgba(220 220 220 /1);
  margin-top: 10px;
  margin-bottom: 10px;
}

@media (max-width: 960px) {
  .container {
    padding: 30px;
    border-radius: 0;
  }
}
@media (max-width: 660px) {
  .container {
    padding: 10px;
    border-radius: 0;
  }
}
@media (max-width: 500px) {
  .title {
    font-size: 1.4rem;
    text-align: center;
  }
}
</style>
