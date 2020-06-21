'use strict'

const { PuppeteerExtraPlugin } = require('puppeteer-extra-plugin')

/**
 * Minimal stealth plugin template, not being used. :-)
 *
 * Feel free to copy this folder as the basis for additional detection evasion plugins.
 */
class Plugin extends PuppeteerExtraPlugin {
  constructor(opts = {}) {
    super(opts)
  }

  get name() {
    return 'stealth/evasions/webrtc.control'
  }

  async onPageCreated(page) {
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(window.navigator, 'keyboard', {
        configurable: true,
        enumerable: true,
        get: function() {
          var resp = (function() {
            var res = {}
            var prot = {}
            if (res)
              Object.defineProperty(res, 'toString', {
                configurable: true,
                enumerable: false,
                get: function() {
                  return function() {
                    return '[object Keyboard]'
                  }
                }
              })
            if (res)
              Object.defineProperty(res, 'valueOf', {
                configurable: true,
                enumerable: false,
                get: function() {
                  return function() {
                    return '[object Keyboard]'
                  }
                }
              })
            prot['lock'] = (function() {
              var res = function() {}
              res.toString = function() {
                return 'function () { [native code] }'
              }
              res.valueOf = function() {
                return 'function () { [native code] }'
              }
              return res
            })()
            prot['unlock'] = (function() {
              var res = function() {}
              res.toString = function() {
                return 'function () { [native code] }'
              }
              res.valueOf = function() {
                return 'function () { [native code] }'
              }
              return res
            })()
            prot['getLayoutMap'] = (function() {
              var res = function() {}
              res.toString = function() {
                return 'function () { [native code] }'
              }
              res.valueOf = function() {
                return 'function () { [native code] }'
              }
              return res
            })()
            Object.setPrototypeOf(res, prot)
            return res
          })()
          return resp
        }
      })
    })
  }
}

module.exports = function(pluginConfig) {
  return new Plugin(pluginConfig)
}
