'use strict'

const { PuppeteerExtraPlugin } = require('puppeteer-extra-plugin')

/**
 * Fix WebGL Vendor/Renderer being set to Google in headless mode
 */
class Plugin extends PuppeteerExtraPlugin {
  constructor(opts = {}) {
    super(opts)
  }

  get name() {
    return 'stealth/evasions/webgl.vendor'
  }

  /* global WebGLRenderingContext */
  async onPageCreated(page) {
    // Chrome returns undefined, Firefox false
    await page.exposeFunction('exposedDebugTwo', params => {
      this.debug(params)
    })
    await page.evaluateOnNewDocument(() => {
      try {
        var config = {
          random: {
            value: function() {
              return Math.random()
            },
            item: function(e) {
              var rand = e.length * config.random.value()
              return e[Math.floor(rand)]
            },
            array: function(e) {
              var rand = config.random.item(e)
              return new Int32Array([rand, rand])
            },
            items: function(e, n) {
              var length = e.length
              var result = new Array(n)
              var taken = new Array(length)
              if (n > length) n = length
              //
              while (n--) {
                var i = Math.floor(config.random.value() * length)
                result[n] = e[i in taken ? taken[i] : i]
                taken[i] = --length in taken ? taken[length] : length
              }
              //
              return result
            }
          },
          spoof: {
            webgl: {
              buffer: function(target) {
                const bufferData = target.prototype.bufferData
                Object.defineProperty(target.prototype, 'bufferData', {
                  value: function() {
                    exposedDebugTwo('WegGL FP detected')
                    var index = Math.floor(config.random.value() * 10)
                    var noise =
                      0.1 * config.random.value() * arguments[1][index]
                    arguments[1][index] = arguments[1][index] + noise
                    return bufferData.apply(this, arguments)
                  }
                })
              },
              parameter: function(target) {
                Object.defineProperty(target.prototype, 'getParameter', {
                  value: function() {
                    var float32array = new Float32Array([1, 8192])
                    //
                    exposedDebugTwo('WegGL FP detected: ' + arguments[0])
                    if (arguments[0] === 3415) return 0
                    else if (arguments[0] === 3414) return 24
                    else if (arguments[0] === 35661) return 256
                    else if (arguments[0] === 3386) return 16384
                    else if (arguments[0] === 36347) return 4096
                    else if (arguments[0] === 36349) return 1024
                    else if (arguments[0] === 34047 || arguments[0] === 34921)
                      return 8
                    else if (
                      arguments[0] === 7937 ||
                      arguments[0] === 33901 ||
                      arguments[0] === 33902
                    )
                      return float32array
                    else if (
                      arguments[0] === 34930 ||
                      arguments[0] === 36348 ||
                      arguments[0] === 35660
                    )
                      return 32
                    else if (
                      arguments[0] === 34076 ||
                      arguments[0] === 34024 ||
                      arguments[0] === 3379
                    )
                      return config.random.item([16384, 32768])
                    else if (
                      arguments[0] === 3413 ||
                      arguments[0] === 3412 ||
                      arguments[0] === 3411 ||
                      arguments[0] === 3410 ||
                      arguments[0] === 34852
                    )
                      return 16
                    else if (arguments[0] === 37445) {
                      return 'Google Inc.'
                    } else if (arguments[0] === 37446) {
                      return 'ANGLE (NVIDIA GeForce 615 Direct3D11 vs_5_0 ps_5_0)'
                    } else {
                      return 512
                    }
                  }
                })
              }
            }
          }
        }
        //
        config.spoof.webgl.buffer(WebGLRenderingContext)
        config.spoof.webgl.buffer(WebGL2RenderingContext)
        config.spoof.webgl.parameter(WebGLRenderingContext)
        config.spoof.webgl.parameter(WebGL2RenderingContext)
      } catch (err) {
        console.warn(err)
      }
    })
  }
}

module.exports = function(pluginConfig) {
  return new Plugin(pluginConfig)
}
