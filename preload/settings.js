
const Store = require('electron-store')
const config = new Store()
const { remote } = require('electron')
function createUI () {
  console.log('Done Successfully!')
  document.getElementById('FPS_Switch').checked = config.get('capFPS')
  document.getElementById('RPC_Switch').checked = config.get('RPC')
  document.getElementById('HitMarkers_Switch').checked = config.get('hitMarkers')
  document.getElementById('Hands_Switch').checked = config.get('hands')
  document.getElementById('ADS_Switch').checked = config.get('ADS')
  document.getElementById('Advertisement_Switch').checked = config.get('disableAdvertisements')
  document.getElementById('mod').value = config.get('Mod')
}

// It is probably possible to create all the elements via JavaScript, but I'm too lazy.
function toggle_ADS() {
  config.set('ADS', !config.get('ADS'))
  remote.getCurrentWindow().getParentWindow().webContents.send('event', 'ADS', config.get('ADS'))
}

function toggle_Advertisements() {
  config.set('disableAdvertisements', !config.get('disableAdvertisements'))
}

function toggle_FPS_Cap () {
  config.set('capFPS', !config.get('capFPS'))
}

function toggle_RPC () {
  config.set('RPC', !config.get('RPC'))
}

function toggle_Hands () {
  config.set('hands', !config.get('hands'))
  remote.getCurrentWindow().getParentWindow().webContents.send('event', 'HANDS', config.get('hands'))
}

function toggle_HitMarkers () {
  config.set('hitMarkers', !config.get('hitMarkers'))
  remote.getCurrentWindow().getParentWindow().webContents.send('event', 'HITMARKERS', config.get('hitMarkers'))
}

createUI()
