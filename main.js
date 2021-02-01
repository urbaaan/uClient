/* eslint-disable node/no-callback-literal */
/* eslint-disable node/no-path-concat */

const {
  app,
  shell,
  BrowserWindow,
  clipboard,
  protocol,
  ipcMain,
  session
} = require('electron')

console.log('Starting...')
const DEVELOPMENT = true

if (DEVELOPMENT === false) {
  const process = require('process')
  const { spawn } = require('child_process')

  if (process.env.GPUSET !== 'true') {
    spawn(process.execPath, process.argv, {
      env: {
        ...process.env,
        SHIM_MCCOMPAT: '0x800000001',
        GPUSET: true
      },
      detached: true
    })
    process.exit(0)
  }
}
const DEFAULT_CONFIG = {
  capFPS: false,
  RPC: true,
  test: 0,
  test2: 1,
  tet: 1,
  a: 1,
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
const { autoUpdater } = require('electron-updater')
const config = new (require('electron-store'))({
  defaults: DEFAULT_CONFIG
})

Object.keys(DEFAULT_CONFIG).forEach((keys) => {
  if (!config.get(keys)) {
    config.set(keys, DEFAULT_CONFIG[keys])
  }
})
// RPC
console.log('Starting Discord Client...')
const discord = new (require('discord-rpc').Client)({
  transport: 'ipc'
})
if (config.get('RPC') === true) {
  discord
    .login({
      clientId: '769550318148780115'
    })
    .catch((error) => console.log(error))
}
console.log('Discord Client Running!')

const prompt = require('electron-prompt')
const { normalize } = require('path')

app.commandLine.appendSwitch('disable-http-cache')
if (config.get('capFPS') === false) {
  app.commandLine.appendSwitch('disable-frame-rate-limit')
  app.commandLine.appendSwitch('disable-gpu-vsync')
}

function createGameWindow () {
  console.log('Creating Window...')
  const gameWindow = new BrowserWindow({
    width: config.get('dimensions.size.width'),
    height: config.get('dimensions.size.height'),
    fullscreen: config.get('dimensions.fullscreen'),
    x: config.get('dimensions.size.x'),
    y: config.get('dimensions.size.y'),
    show: false,
    title: 'uClient',
    webPreferences: {
      preload: `${__dirname}/preload/game.js`,
      v8CacheOptions: 'bypassHeatCheckAndEagerCompile'
    }
  })
  gameWindow.removeMenu()
  gameWindow.maximize(config.get('dimensions.maximised'))
  console.log('Creation of Window Successful!')

  const { webContents } = gameWindow

  // This purely creates the Venge.io Window and ensures the game works.
  gameWindow.loadURL('https://venge.io')
  console.log('Loading Content...')

  console.log('Fix Caching...')
  session.fromPartition('persist:name', { cache: false })

  // Listening to Events.
  console.log('Initializing Listeners...')
  gameWindow.on('page-title-updated', (event) => event.preventDefault())
  gameWindow.on('ready-to-show', () => {
    gameWindow.show()
    app.focus()
  })
  gameWindow.on('resize', () => {
    config.set('dimensions.size', gameWindow.getBounds())
    config.set('dimensions.fullscreen', gameWindow.isFullScreen())
    config.set('dimensions.maximised', gameWindow.isMaximized())
  })

  // Configuration
  webContents.on('will-prevent-unload', (event) => event.preventDefault())
  webContents.on('dom-ready', () => {
    // Autoupdater
    autoUpdater.checkForUpdatesAndNotify()

    autoUpdater.once('update-available', () => {
      webContents.executeJavaScript(
        'alert("Update is available and will be installed in the background.")'
      )
    })

    autoUpdater.once('update-downloaded', () => {
      webContents
        .executeJavaScript('alert("The latest update will be installed now.")')
        .then(() => autoUpdater.quitAndInstall())
        .catch((error) => console.log(error))
    })

    function setActivity (value) {
      discord.setActivity({
        largeImageKey: 'logo',
        largeImageText: value.username || 'uClient',
        endTimestamp: new Date().setTime(Date.now() + value.time) || undefined,
        state: value.map || undefined,
        details: value.mode || 'In Menu'
      })
    }

    setActivity(0) // Sets RPC to Default.

    ipcMain.on('RPC', (event, json) => {
      setActivity(JSON.parse(json))
    })

    // Settings
    createSettingsWindow()

    // Resource Swapper
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
      webContents.session.webRequest.onBeforeRequest(
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
  })

  webContents.on('new-window', (event, url) => {
    if (new URL(url).hostname !== 'venge.io') {
      event.preventDefault()
      shell.openExternal(url)
    }
  })

  // Shortcuts
  const shortcut = require('electron-localshortcut')
  shortcut.register(gameWindow, 'F1', () => {
    gameWindow.loadURL('https://venge.io')
  })
  shortcut.register(gameWindow, 'F2', () => {
    if (
      new URL(clipboard.readText()).hostname === 'venge.io' &&
      new URL(clipboard.readText()).pathname.charAt(0) === '#'
    ) {
      gameWindow.loadURL(clipboard.readText())
    } else {
      getLink()
    }

    function getLink () {
      prompt({
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
          gameWindow.loadURL(r)
        } else {
          getLink()
        }
      })
    }
  })
  shortcut.register(gameWindow, 'F3', () => {
    webContents
      .executeJavaScript(
        'pc.app.fire("Chat:Message", "uClient", "Link copied!");'
      )
      .then(() => clipboard.writeText(webContents.getURL()))
      .catch((error) => console.log(error))
  })
  shortcut.register(gameWindow, 'F11', () => {
    gameWindow.setSimpleFullScreen(!gameWindow.isSimpleFullScreen())
  })
  shortcut.register(gameWindow, 'F12', () => {
    webContents.openDevTools({
      mode: 'right'
    })
  })
  shortcut.register(gameWindow, 'CommandOrControl+F5', () => {
    webContents.reloadIgnoringCache()
  })
  shortcut.register(gameWindow, 'F10', () => {
    gameWindow.maximize(!gameWindow.isMaximized())
  })
  shortcut.register(gameWindow, 'Esc', () => {
    webContents.executeJavaScript(
      'document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;document.exitPointerLock();'
    )
  })
  shortcut.register('Alt+F4', () => {
    app.quit()
  })

  function createSettingsWindow () {
    const settings = new BrowserWindow({
      width: 1440 / 2,
      height: 900 / 2,
      center: true,
      show: false,
      frame: false,
      resizable: false,
      fullscreenable: false,
      modal: true,
      parent: gameWindow,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true
      }
    })
    settings.loadURL(`file://${__dirname}/html/settings.html`)
    shortcut.register('=', () => {
      if (settings.isVisible()) {
        settings.hide()
        app.focus()
        gameWindow.focus()
      } else settings.show()
    })
    shortcut.register(settings, 'F12', () => {
      settings.openDevTools()
    })

    ipcMain.on('relaunch', () => {
      app.relaunch()
      app.quit()
    })
  }
}
app.on('window-all-closed', () => {
  app.quit()
})

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'swap',
    privileges: {
      secure: true,
      corsEnabled: true
    }
  }
])

app.whenReady().then(() => {
  protocol.registerFileProtocol('swap', (request, callback) => {
    callback({
      path: normalize(request.url.replace(/^swap:/, ''))
    })
  })
  if (app.requestSingleInstanceLock()) createGameWindow()
  else console.log('ERROR: More than one Application opened...')
})
