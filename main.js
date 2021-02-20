const {
    app,
    shell,
    BrowserWindow,
    clipboard,
    protocol,
    ipcMain,
    screen
} = require('electron')

/*
 *** DEFINE VARIABLES ***
 */
let win

const store = new(require('electron-store'))()
const STORE_CONFIG = {
    capFPS: false,
    RPC: true,
    disableAdvertisements: true,
    disableHands: true,
    ADS: false,
    hitMarkers: true,
}

Object.keys(STORE_CONFIG).map((keys) => (store.get(keys) === null) ? store.set(keys, CONFIG[keys]) : console.log('VALUE ALREADY EXISTS'))

if (store.get('capFPS') === false) {
    app.commandLine.appendSwitch('disable-frame-rate-limit')
    app.commandLine.appendSwitch('disable-gpu-vsync')
}

if (store.get('RPC')) {
    const discord = new(require('discord-rpc').Client)({
        transport: 'ipc'
    })

    discord.login({
            clientId: '769550318148780115'
        })
        .then(() => set(0), ipcMain.on('RPC', (event, json) => set(JSON.parse(json))))
        .catch((error) => console.log(error))

}

/*
 *** INITIALIZATION OF CLIENT ***
 */

app.whenReady().then(() => {
    (app.requestSingleInstanceLock()) ? (INIT_CLIENT(), protocol.registerFileProtocol('swap', (request, callback) => callback({
        path: require('path').normalize(request.url.replace(/^swap:/, ''))
    }))) : app.quit()
})

function INIT_CLIENT() {
    const {
        width,
        height
    } = screen.getPrimaryDisplay().workAreaSize

    /*
     *** CREATE WINDOW ***
     */

    win = new BrowserWindow({
        width: width,
        height: height,
        fullscreen: true,
        show: false,
        title: 'uClient',
        webPreferences: {
            preload: __dirname + '/preload/preload.js'
        }
    })

    win.loadURL('https://venge.io')
    win.removeMenu()

    /*
     *** CREATE LISTENERS ***
     */

    win.on('ready-to-show', () => win.show())
    win.on('page-title-updated', (event) => event.preventDefault())
    win.on('unresponsive', () => app.quit())
    win.webContents.on('will-prevent-unload', (event) => event.preventDefault())
    win.webContents.on('dom-ready', () => startUpdater(), startSwapper())
    win.webContents.on('new-window', (event, url) => (new URL(url).hostname === 'venge.io') ? 0 : (event.preventDefault(), shell.openExternal(url)))

    /*
     *** CREATE SHORTCUTS ***
     */

    const shortcut = require('electron-localshortcut')
    const SHORTCUT_CONFIG = {
        'F1': () => win.loadURL('https://venge.io'),
        'F2': () => (typeof clipboard.readText === 'string') ? ((new URL(clipboard.readText()).hostname && new URL(clipboard.readText()).pathname.length > 1) ? win.loadURL(clipboard.readText()) : getLink()) : getLink(),
        'F3': () => {
            win.webContents.executeJavaScript("Utils.copyToClipboard(window.location.href), pc.app.fire('Chat:Message', 'uClient', 'Link copied!')")
        },
        'F5': () => win.webContents.reloadIgnoringCache(),
        'F10': () => (win.isMinimized()) ? win.minimize() : win.restore(),
        'F11': () => win.setSimpleFullScreen(!win.isSimpleFullScreen()),
        'F12': () => (win.webContents.isDevToolsOpened()) ? win.webContents.closeDevTools() : win.webContents.openDevTools(),
        'Alt+F4': () => app.quit(),
        'Escape': () => {
            win.webContents.executeJavaScript('document.disablePointerLock()')
        }
    }

    Object.keys(SHORTCUT_CONFIG).forEach((keys) => shortcut.register(((process.platform === 'darwin') ? 'CommandOrControl+' + keys : keys), SHORTCUT_CONFIG[keys]))

    /*
     *** SETTINGS ***
     */

    const settings = new BrowserWindow({
        width: 1440 / 2,
        height: 900 / 2,
        center: true,
        show: false,
        frame: false,
        resizable: false,
        fullscreenable: false,
        modal: true,
        parent: win,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    })

    settings.loadURL(`file://${__dirname}/html/settings.html`)
    shortcut.register(settings, '=', () => {
        (settings.isVisible()) ? (settings.hide(), app.focus(), win.focus()) : settings.show()
    })

}

/*
 *** FUNCTIONS ***
 */

function set(json) {
    discord.setActivity({
        largeImageKey: 'logo',
        largeImageText: json.username || 'uClient',
        endTimestamp: new Date().setTime(Date.now() + json.time) || undefined,
        state: json.map || undefined,
        details: json.mode || 'In Menu'
    })
}

function startUpdater() {
    const {
        autoUpdater
    } = require('electron-updater')
    autoUpdater.checkForUpdatesAndNotify()

    autoUpdater.on('update-available', () => {
        win.webContents.executeJavaScript(
            'alert("Update is available and will be installed in the background.")'
        )
    })

    autoUpdater.on('update-downloaded', () => {
        win.webContents
            .executeJavaScript('alert("The latest update will be installed now.")')
            .then(() => autoUpdater.quitAndInstall())
            .catch((error) => console.log(error))
    })
}

function startSwapper() {
    const {
        readdirSync,
        mkdir,
        statSync
    } = require('fs')

    const swapFolder = `${app.getPath('documents')}/uClientSwapper`
    try {
        mkdir(
            swapFolder, {
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
    if (store.get('disableAdvertisements')) {
        swap.filter.urls = ['https://pubads.g.doubleclick.net/*', 'https://video-ad-stats.googlesyndication.com/*',
            'https://simage2.pubmatic.com/AdServer/*',
            'https://pagead2.googlesyndication.com/*',
            'https://securepubads.g.doubleclick.net/*',
            'https://googleads.g.doubleclick.net/*',
            'https://adclick.g.doubleclick.net/*'
        ]
    }

    function resourceSwap(directory) {
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
        win.webContents.session.webRequest.onBeforeRequest(
            swap.filter,
            (details, callback) => {
                if (details.url.includes('venge.io')) {
                    callback({
                        cancel: false,
                        redirectURL: swap.files[
                            details.url.replace(/https|http|(\?.*)|(#.*)|(?<=:\/\/)/gi, '')
                        ] || details.url
                    })
                } else callback({
                    cancel: true
                })
            }
        )
    }
}

function getLink() {
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
            win.loadURL(r)
        } else {
            getLink()
        }
    })
}
