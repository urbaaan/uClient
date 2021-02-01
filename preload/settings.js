
const Store = require('electron-store')
const config = new Store()
const { remote } = require('electron')
function createUI () {
  console.log('Done Successfully!')
  document.getElementById('FPS_Switch').checked = config.get('capFPS')
  document.getElementById('RPC_Switch').checked = config.get('RPC')
  document.getElementById('HitMarkers_Switch').checked = config.get('hitMarkers')
  document.getElementById('Hands_Switch').checked = config.get('disableHands')
}

// It is probably possible to create all the elements via JavaScript, but I'm too lazy.
function toggle_FPS_Cap () {
  config.set('capFPS', !config.get('capFPS'))
}

function toggle_RPC () {
  config.set('RPC', !config.get('RPC'))
}

function toggle_Hands () {
  config.set('disableHands', !config.get('disableHands'))
  remote.getCurrentWindow().getParentWindow().webContents.send('hands', config.get('disableHands'))
}

function toggle_HitMarkers () {
  config.set('hitMarkers', !config.get('hitMarkers'))
  remote.getCurrentWindow().getParentWindow().webContents.send('hitMarkers', config.get('hitMarkers'))
}

createUI()
