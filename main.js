
// Modules to control application life and create native browser window

require('v8-compile-cache');

const process = require('process');

const {
  app,
  shell, 
  BrowserWindow,
  screen,
} = require('electron');

var b = 0;
var c = 0; 

for (let j = 0; j < process.argv.length; j++) {
    const a = process.argv[j];
    let o = process.argv[j].split('--');
    if (o.length > 1){
        for (let m = 0; m < o.length; m++){
            if (o[m] == 'cap') {
                b = 1;
            }
            /*
            if (o[m] == '') {
                c = 1;
            }
            */
        }
    }
}

if (b == 0){
  app.commandLine.appendSwitch('disable-frame-rate-limit');
}
app.commandLine.appendSwitch("disable-gpu-vsync");
app.commandLine.appendSwitch("enable-webgl2-compute-context");
app.commandLine.appendSwitch("enable-quic");
app.commandLine.appendSwitch("enable-pointer-lock-options");
app.commandLine.appendSwitch("disable-accelerated-video-decode", false);
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");
app.commandLine.appendSwitch("enable-quic");
app.commandLine.appendSwitch("high-dpi-support", 1);
app.commandLine.appendSwitch('renderer-process-limit', 30);
app.commandLine.appendSwitch('max-active-webgl-contexts', 30);
app.commandLine.appendSwitch("disable-http-cache");
app.commandLine.appendSwitch('ignore-gpu-blacklist', true);

let splashWindow;
let gameWindow;
let menuWindow;

const prompt = require('electron-prompt');
const { ipcMain } = require('electron/main');
const { EventEmitter } = require('events');
function createGameWindow() {
  // Create the browser window.
  //Gets dimensions of the screen.
  const {
      width, height
  } = screen.getPrimaryDisplay().workAreaSize;

  //If there are zero gameWindows, create a new one.
  gameWindow = new BrowserWindow({
      width: width,
      height: height,
      fullscreen: true,
      show: false,
      autoHideMenuBar: true,
      webPreferences: {
          preload: `${__dirname}/preload/game.js`,
          nodeIntegration: true,
          enableRemoteModule: true,
      }
  })

  createMenuWindow();
  const { webContents } = gameWindow;

  //This purely creates the Venge.io Window and ensures the game works.
  gameWindow.loadURL('https://venge.io');
  gameWindow.on('ready-to-show',() => {
      gameWindow.show();
  })
  
  //Configuration 
  gameWindow.removeMenu();
  webContents.on('will-prevent-unload', (event) => event.preventDefault());
  webContents.on('dom-ready', (event) => {

      if (c == 1){
        var filter = {
          urls: ["https://pubads.g.doubleclick.net/*", "https://video-ad-stats.googlesyndication.com/*",
          "https://simage2.pubmatic.com/AdServer/*",
          "https://pagead2.googlesyndication.com/*",
          "https://securepubads.g.doubleclick.net/*",
          "https://googleads.g.doubleclick.net/*"]
        };
       
        webContents.session.webRequest.onBeforeRequest(filter, function(details, callback) {
          console.log(details.url);
          callback({cancel: true});
        });
      }

      //Bug Fixes.
      webContents.setZoomLevel(0);
      webContents.setZoomFactor(1);

      gameWindow.setTitle(`uClient V${app.getVersion()}`);
      event.preventDefault();
  })
  webContents.on('new-window',(event, url) => {
      switch (checkURL(url)){
          case 'Social':
              event.preventDefault();
              gameWindow.loadURL('https://social.venge.io');
              return;
          case 'Unknown':
              event.preventDefault();
              shell.openExternal(url);
              return;
      }
  })


  //Shortcuts
  const shortcut = require('electron-localshortcut');
  shortcut.register('F1', () => {
      gameWindow.loadURL('https://venge.io');
  })
  shortcut.register('F2', () => {
      getLink();
      function getLink(){
          prompt({
              title: 'Play',
              label: 'Enter URL:',
              alwaysOnTop: true,
              type: 'input',
              inputAttrs: {
                  type: 'url',
                  required: true,
                  placeholder: 'https://venge.io/#',
              },
              resizable: false,
              height: 200,
              value: 'https://venge.io/#',
          }).then((r) => {
              let e = r.split('#');
              if (r.includes('https://venge.io/#') == true && e.length > 1 && e[1].length > 4){
                  gameWindow.loadURL(r);
              }
              else {
                  getLink();
              }
          })
      }
  })
  shortcut.register('F10',() => {
      webContents.send('ESCAPE');
  })
  shortcut.register('F11', () => {
      let focusedWindow = BrowserWindow.getFocusedWindow();
      focusedWindow.setSimpleFullScreen(!focusedWindow.isSimpleFullScreen());
  })
  shortcut.register('F12', () => {
      webContents.openDevTools();
  })
  shortcut.register('Esc', () => {
      webContents.send('ESCAPE');
  })
  shortcut.register('CommandOrControl+F5', () => {
      webContents.reloadIgnoringCache();
  })
  shortcut.register('Alt+F4', () => {
      app.quit();
  })
  /*
  shortcut.register('`',() => {
      if (!menuWindow.isVisible() && gameWindow.isVisible()) {
          menuWindow.show();
          gameWindow.focus();
      }
      else {
          menuWindow.hide();
          gameWindow.focus();
      }
  })
  */
  //Checks for the type of URL in the game :D
  function checkURL(url) {
      if (url.includes("social.venge.io") == true) return "Social";
      if (url.includes("https://venge.io") == false) return `Unknown`;
      else return "Game";
  }
}

function createMenuWindow(){
 menuWindow = new BrowserWindow({
      width: 800,
      height: 600,
      frame: false,
      skipTaskbar: true,
      resizable: false,
      movable: false,
      show: false,
      parent: gameWindow,
      webPreferences: {
        nodeIntegration: true
   }
  });
  menuWindow.setMenu(null);
  menuWindow.on('closed', () => {menuWindow = null});
}

function createSplashWindow() {
  //Creates a splashWindow.
  splashWindow = new BrowserWindow({
      width: 800,
      height: 400,
      resizable: false,
      frame: false,
      titleBarStyle: 'hiddenInset',
      show: false,
      alwaysOnTop: true,
      webPreferences: {
          preload: `${__dirname}/preload/splash.js`
      }
  });
  
  //Just cool stuff.
  const { webContents } = splashWindow;
  autoUpdate();

  //Loads the URL.
  splashWindow.loadURL(`file://${__dirname}/html/splash.html`)
    
  //Configuration.
  splashWindow.once('ready-to-show', () => {
    splashWindow.show();
  });
  splashWindow.on('closed', () => {
    splashWindow = null;
  });

  function autoUpdate() {
      const {
          autoUpdater
      } = require('electron-updater');
      autoUpdater.checkForUpdatesAndNotify();
      function send(text) {
          webContents.send('message', text);
      }
      autoUpdater.on('checking-for-update', () => {
          send('Checking for update...');
      })
      autoUpdater.on('update-available', () => {
          send('Update available.');
      })
      autoUpdater.on('update-not-available', () => {
          send('Update not available.');
          setTimeout(() => {
            createGameWindow();
            splashWindow.close();
          }, 2e3);
      })
      autoUpdater.on('error', (err) => {
          send('Error in auto-updater: ' + err);
      })
      autoUpdater.on('download-progress', (progressObj) => {
          let log_message = 'Downloaded ' + Math.round(progressObj.percent) + '%';
          send(log_message);
      })
      autoUpdater.on('update-downloaded', () => {
          send('Update downloaded.');
          autoUpdater.quitAndInstall();  
      });
}
}


app.on('window-all-closed', () => {
    app.quit();
  });

app.on('ready',() => {
    createSplashWindow();
})
