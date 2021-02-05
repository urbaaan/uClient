/* eslint-disable no-new */
/* eslint-disable node/no-callback-literal */
/* eslint-disable node/no-path-concat */

const {
  app,
  shell,
  BrowserWindow,
  clipboard,
  protocol,
  ipcMain
} = require('electron')

const config = new (require('electron-store'))()

class Start {
  constructor () {
    if (!config.get('capFPS')) {
      app.commandLine.appendSwitch('disable-frame-rate-limit')
      app.commandLine.appendSwitch('disable-gpu-vsync')
    }

    const { normalize } = require('path')
    app.whenReady()
      .then(() => {
        protocol.registerFileProtocol('swap', (request, callback) => {
          callback({
            path: normalize(request.url.replace(/^swap:/, ''))
          })
        })
        if (app.requestSingleInstanceLock()) {
          this.startConfig()
          this.startRPC()
          this.createWindow('https://venge.io')
        } else console.log('ERROR: More than one Application opened...')
      })
      .catch((error) => console.log(error))
  }

  registerShortcut () {
    this.shortcut = require('electron-localshortcut')
    this.shortcut.register(this.gameWindow, 'F1', () => {
      this.gameWindow.loadURL('https://venge.io')
    })
    this.shortcut.register(this.gameWindow, 'F2', () => {
      if (
        new URL(clipboard.readText()).hostname === 'venge.io' &&
        new URL(clipboard.readText()).pathname.charAt(0) === '#'
      ) {
        console.log(clipboard.readText())
        this.gameWindow.loadURL(clipboard.readText())
      } else {
        getLink()
      }

      function getLink () {
        (require('electron-prompt'))({
          title: 'Play',
          label: 'Enter URL:',
          alwaysOnTop: true,
          type: 'input',
          inputAttrs: {
            type: 'url',
            required: true,
            placeholder: 'https://venge.io/#'
          },
          resizable: false,
          height: 200,
          value: 'https://venge.io/#'
        }).then((r) => {
          const a = r.split('#')
          if (
            r.includes('https://venge.io/#') &&
            a.length > 1 &&
            a[1].length > 4
          ) {
            this.gameWindow.loadURL(r)
          } else {
            getLink()
          }
        })
      }
    })
    this.shortcut.register(this.gameWindow, 'F3', () => {
      this.gameWindow.webContents
        .executeJavaScript(
          'pc.app.fire("Chat:Message", "uClient", "Link copied!");'
        )
        .then(() => clipboard.writeText(this.gameWindow.webContents.getURL()))
        .catch((error) => console.log(error))
    })
    this.shortcut.register(this.gameWindow, 'F11', () => {
      this.gameWindow.setSimpleFullScreen(!this.gameWindow.isSimpleFullScreen())
    })
    this.shortcut.register(this.gameWindow, 'F12', () => {
      this.gameWindow.webContents.openDevTools({
        mode: 'right'
      })
    })
    this.shortcut.register(this.gameWindow, 'CommandOrControl+F5', () => {
      this.gameWindow.webContents.reloadIgnoringCache()
    })
    this.shortcut.register('F10', () => {
      this.gameWindow.minimize(!this.gameWindow.isMinimized())
    })
    this.shortcut.register(this.gameWindow, 'Esc', () => {
      this.gameWindow.webContents.executeJavaScript(
        'document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;document.exitPointerLock();'
      )
    })
    this.shortcut.register('Alt+F4', () => {
      app.quit()
    })
  }

  createWindow (url) {
    this.gameWindow = new BrowserWindow({
      width: config.get('dimensions.size.width'),
      height: config.get('dimensions.size.height'),
      fullscreen: config.get('dimensions.fullscreen'),
      show: false,
      x: config.get('dimensions.size.x'),
      y: config.get('dimensions.size.y'),
      webPreferences: {
        preload: `${__dirname}/preload/game.js`
      }
    })

    this.gameWindow.loadURL(url)

    if (config.get('RPC')) {
      this.discord
        .login({
          clientId: '769550318148780115'
        })
        .catch((error) => console.log(error))
      console.log('RPC Activated!')
    }

    this.gameWindow.removeMenu()
    this.gameWindow.hide()
    this.gameWindow.maximize(config.get('dimensions.maximised'))

    this.registerShortcut()
    this.gameWindow.on('page-title-updated', (event) => event.preventDefault())
    this.gameWindow.on('resize', () => {
      config.set('dimensions.size', this.gameWindow.getBounds())
      config.set('dimensions.fullscreen', this.gameWindow.isFullScreen())
      config.set('dimensions.maximised', this.gameWindow.isMaximized())
    })

    this.gameWindow.webContents.on('will-prevent-unload', (event) => event.preventDefault())
    this.gameWindow.webContents.on('dom-ready', () => {
      this.startUpdater()
      this.startSwapper()
      this.createSettings()
      setTimeout(() => {
        this.gameWindow.show()
        app.focus()
      }, 1e3)
    })
    this.gameWindow.webContents.on('new-window', (event, url) => {
      if (new URL(url).hostname !== 'venge.io') {
        event.preventDefault()
        shell.openExternal(url)
      }
    })
  }

  startUpdater () {
    const { autoUpdater } = require('electron-updater')
    autoUpdater.checkForUpdatesAndNotify()

    autoUpdater.once('update-available', () => {
      this.gameWindow.webContents.executeJavaScript(
        'alert("Update is available and will be installed in the background.")'
      )
    })

    autoUpdater.once('update-downloaded', () => {
      this.gameWindow.webContents
        .executeJavaScript('alert("The latest update will be installed now.")')
        .then(() => autoUpdater.quitAndInstall())
        .catch((error) => console.log(error))
    })
  }

  startSwapper () {
    const { readdirSync, mkdir, statSync } = require('fs')

    const swapFolder = `${app.getPath('documents')}/uClientSwapper`
    try {
      mkdir(
        swapFolder,
        {
          recursive: true
        },
        (event) => {}
      )
    } catch {}
    const swap = {
      filter: {
        urls: []
      },
      files: {}
    }

    function resourceSwap (directory) {
      readdirSync(directory).forEach((file) => {
        const filePath = `${directory}/${file}`
        if (statSync(filePath).isDirectory()) resourceSwap(filePath)
        else {
          const venge = `*://venge.io${filePath
            .replace(swapFolder, '')
            .replace(/\\/g, '/')}*`
          swap.filter.urls.push(venge)
          swap.files[venge.replace(/\*/g, '')] = `swap:/${filePath}`
        }
      })
    }

    resourceSwap(swapFolder)

    if (swap.filter.urls.length > 0) {
      this.gameWindow.webContents.session.webRequest.onBeforeRequest(
        swap.filter,
        (details, callback) => {
          console.log(
            swap.files[
              details.url.replace(/https|http|(\?.*)|(#.*)|(?<=:\/\/)/gi, '')
            ]
          )
          callback({
            cancel: false,
            redirectURL:
              swap.files[
                details.url.replace(/https|http|(\?.*)|(#.*)|(?<=:\/\/)/gi, '')
              ] || details.url
          })
        }
      )
    }
  }

  startConfig () {
    const DEFAULT_CONFIG = {
      capFPS: false,
      RPC: true,
      disableHands: true,
      ADS: false,
      hitMarkers: true,
      dimensions: {
        fullscreen: true,
        maximised: true,
        size: {
          width: 1920,
          height: 1080,
          x: 0,
          y: 0
        }
      }
    }

    Object.keys(DEFAULT_CONFIG).forEach((keys) => {
      if (!config.get(keys)) {
        config.set(keys, DEFAULT_CONFIG[keys])
      }
    })
  }

  startRPC () {
    this.discord = new (require('discord-rpc').Client)({
      transport: 'ipc'
    })
    this.discord.once('ready', () => {
      this.set(0)
      ipcMain.on('RPC', (event, json) => {
        this.set(JSON.parse(json))
      })
    })
  }

  set (value) {
    this.discord.setActivity({
      largeImageKey: 'logo',
      largeImageText: value.username || 'uClient',
      endTimestamp: new Date().setTime(Date.now() + value.time) || undefined,
      state: value.map || undefined,
      details: value.mode || 'In Menu'
    })
  }

  createSettings () {
    this.settings = new BrowserWindow({
      width: 1440 / 2,
      height: 900 / 2,
      center: true,
      show: false,
      frame: false,
      resizable: false,
      fullscreenable: false,
      modal: true,
      parent: this.gameWindow,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true
      }
    })

    this.settings.loadURL(`file://${__dirname}/html/settings.html`)
    this.shortcut.register('=', () => {
      if (this.settings.isVisible()) {
        this.settings.hide()
        app.focus()
        this.gameWindow.focus()
      } else this.settings.show()
    })
    this.shortcut.register(this.settings, 'F12', () => {
      this.settings.openDevTools()
    })

    ipcMain.on('relaunch', () => {
      app.relaunch()
      app.quit()
    })
  }
}

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'swap',
    privileges: {
      secure: true,
      corsEnabled: true
    }
  }
])

new Start()
