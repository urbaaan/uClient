/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const {
  ipcRenderer
} = require('electron')

document.addEventListener('DOMContentLoaded', () => {
  // pc.controls.player.entity.parent.findByGuid("13c7bc23-c999-47d0-8da3-30a6f44b6a99").script.networkManager.players[0] //Network manager
  // setInterval(() => {
  //    pc.app.fire("Fetcher:Reward", !0)
  // },60);

  let RPC = {
    mode: 'string',
    time: 0,
    username: 'string'
  }
  console.log('Starting...')
  // End-Game Message.
  // Suggestion: Only Have One ipcRenderer.
  ipcRenderer.on('hands', (event, message) => {
    Utils.setItem('DisableHands', JSON.parse(message))
    pc.controls.player.characterArmLeft.enabled = JSON.parse(Utils.getItem('DisableHands'))
  })

  ipcRenderer.on('setEndGameMessage', (event, message) => {
    console.log(message)
    Utils.setItem('endGameMessage', message)
    if (window.location.href.slice('https://venge.io'.length).length < 3) { pc.app.fire('Alert:Menu', `End-game Message has been set to '${message}'`) } else { pc.app.fire('Chat:Message', 'uClient', `End-game message has been switched to '${message}'`) }
  })

  ipcRenderer.on('ADS', (event, message) => {
    Utils.setItem('ADS', JSON.parse(message))
  })

  ipcRenderer.on('hitMarkers', (event, b) => {
    Utils.setItem('hitMarkers', JSON.parse(b))
  })

  // Sets Colour of Menu.
  pc.app.on('start', menuColor)

  // Says Custom End-Game Message.
  pc.app.on('Game:Finish', () => {
    enableRPC()
    if (Utils.getItem('endGameMessage' !== 'GG!')) { pc.app.fire('Network:Chat', Utils.getItem('endGameMessage')) }
  })

  pc.app.on('Game:Overtime', () => {
    enableRPC()
  })

  // Returns to "https://venge.io".
  pc.app.on('Overlay:Info', () => {
    if (window.location.href.slice('https://venge.io'.length).length > 2) { window.location.href = 'https://venge.io' }
  })

  // Disable Hitmarkers.
  pc.app.on('Hit:Point', () => {
    if (Utils.getItem('hitMarkers') === 'false') { pc.controls.interfaceEntity.findByGuid('f8763836-19f6-44e6-8682-8da05cc064b6').enabled = false }
  })

  pc.app.on('Hit:Headshot', () => {
    if (Utils.getItem('hitMarkers') === 'false') { pc.controls.interfaceEntity.findByGuid('f8763836-19f6-44e6-8682-8da05cc064b6').enabled = false }
  })

  // Just ensures that it loads fully.
  pc.app.on('Map:Loaded', () => {
    mapColor()
    setTimeout(() => {
      enableRPC()
    }, 500)
  })
  pc.app.on('Game:Start', () => {
    mapColor()
  })

  function enableRPC () {
    RPC = {
      mode: 'Playing ' + pc.currentMode.charAt(0) + pc.currentMode.toLowerCase().slice(1) || 'Playing Venge.io',
      time: (Number.parseInt(pc.controls.interfaceEntity.script.overlay.timeEntity.element.text.split(':')[0]) * 60000) + (Number.parseInt(pc.controls.interfaceEntity.script.overlay.timeEntity.element.text.split(':')[1]) * 1000) || Number.parseInt(pc.controls.interfaceEntity.script.overlay.timeEntity.element.text) || 0,
      username: Utils.cleanUsername(pc.session.username) || 'uClient'
    }
    console.log(JSON.stringify(RPC))
    ipcRenderer.send('RPC', JSON.stringify(RPC))
  }

  // Disable All Advertisements.
  pc.app.on('Ads:Preroll', () => {
    SDKLoaded = false
    isAdsBlocked = true
    pc.isDisplayingAds = false
    adplayer = undefined
  })

  pc.app.on('Ads:BannerSet', (a, b) => {
    setTimeout(() => {
      pc.app.fire('Ads:BannerDestroy', a, b)
    }, 10)
  })

  // Mouse Button Stuff
  pc.app.mouse.on('mousedown', (event) => {
    if (pc.settings && pc.settings.hideArms) { return }
    if (event.button === 2) { ADS1() }
    pc.app.mouse.on('mouseup', (event) => {
      if (event.button === 2) { ADS2() }
      if (typeof pc.controls !== 'undefined') {
        if (event.button === 4) { pc.controls.player.movement.triggerKeyF() }
        if (event.button === 3) { pc.controls.player.movement.triggerKeyE() }
      }
    })
  })

  function menuColor () {
    // Ping
    Overlay.prototype.setPing = function (t) {
      this.ping = t
    }

    RoomManager.prototype.onStart = function () {
      this.app.fire('Analytics:Event', 'Invite', 'TriedToStart')
      this.send([this.keys.start])
      this.app.fire('Analytics:Event', 'Invite', 'Start')
    }

    MapManager.prototype.onSettingsChange = function () {}

    const menuColor = {
      r: 0.3882352941,
      g: 0,
      b: 0.72941176
    }

    const KEYS = {
      endGameMessage: 'GG!',
      DisableHands: false,
      hitMarkers: true,
      ADS: true,
      menuColor: menuColor
    }

    Object.keys(KEYS).forEach((keys) => {
      if (!localStorage.getItem(keys)) {
        localStorage.setItem(keys, KEYS[keys])
        console.log('Patched ' + localStorage.getItem(keys))
      }
    })
    pc.app.scene.root.findByGuid('63e2718e-ce1c-489c-add7-988b7a0d1d75').enabled = false
    pc.app.scene.root.findByName('Twitch').element.entity.setLocalPosition(-50, -357, 0)
    pc.app.scene.root.findByName('Twitter').enabled = false
    pc.app.scene.root.findByGuid('58aad250-a3ee-484c-a580-f6dfc9b5c8ad').enabled = false
    pc.app.scene.root.findByGuid('2baa7f22-cb28-4cbb-a175-55b8d4385c6f').enabled = false
    pc.app.scene.root.findByName('Poki').enabled = false
    pc.app.scene.root.findByGuid('63e2718e-ce1c-489c-add7-988b7a0d1d75').enabled = false
    pc.app.scene.root.findByGuid('e0850441-d29d-4e62-ae27-b1853130faec').element.text = 'uClient'
    const guid = ['a8864f8b-ae61-470d-99b2-91800ab9c798', 'c41b84e4-2613-4f4d-8c4a-7d1c6c26c560', 'ed3526e2-16ff-4fa9-a9a5-2dd5908e842e', '6be3609e-10d3-47d3-afd6-31c88ddf1616']
    for (const a of guid) {
      pc.app.scene.root.findByGuid(a).element.color = menuColor
    }
  }

  function guidElement (guid) {
    if (typeof pc.controls.interfaceEntity.findByGuid(guid) !== 'undefined') { return pc.controls.interfaceEntity.findByGuid(guid) }
  }

  function mapColor () {
    try {
      const ammoColour = {
        r: 0.866666666667,
        g: 0.55294117,
        b: 1
      }

      // Shrinks Crosshair Size
      guidElement('25495d1f-9a61-4dc8-b126-1a69c25f0dc1').setLocalScale(0.8, 0.78, 0.8)

      // Leaderboard
      guidElement('ebebda7a-5ed8-4895-841d-73c2b1ab560b').element.opacity = 0.1

      // Weapon
      pc.controls.player.entity.children[0].children[4].setLocalPosition(0.5, 0.58, -0.8)

      // FPS + Ping
      guidElement('2885c322-8cea-4b70-b591-89266a1bb5a0').element.color = {
        r: 0.51764705,
        g: 0.06274509,
        b: 0.91372549
      }

      guidElement('2885c322-8cea-4b70-b591-89266a1bb5a0').setLocalScale(1.5, 1.5, 1.5)
      guidElement('2885c322-8cea-4b70-b591-89266a1bb5a0').setLocalPosition(5.000009536743164, -5.0001983642578125, 0)

      // Ammo Colour
      guidElement('25aee198-fae3-4780-a2de-f68fce9bafd8').element.color = ammoColour

      // Health Bar Colour
      pc.colors.health = ammoColour

      // Universal Colours
      const guid = ['daa5691e-0518-4bd2-bc17-313828af5bb2', 'f8763836-19f6-44e6-8682-8da05cc064b6', '9371241a-4fac-4a23-bf29-343c0f0fedd6', '808a452e-7d73-433a-b91e-91d6e1c51286', 'df20128a-9f30-4da8-933c-f217ebbfbc88', 'a79a0e7c-adb3-44b3-bd25-19ddc6b1161d', '6501a7fd-23ea-4b35-b634-35a95f09280d', '09e900aa-538b-4a7c-ab45-4de687bebd25']
      for (a of guid) {
        guidElement(a).element.color = ammoColour
      }

      // Hands
      pc.controls.player.characterArmLeft.enabled = JSON.parse(Utils.getItem('DisableHands'))

      // AmbientLight
      pc.app.scene.exposure = 6
      pc.app.scenes._app.lightmapper.root.children[1].children[0].light.vsmBlurSize = 0
      pc.app.scenes._app.lightmapper.root.children[1].children[0].light.intensity = 0
    } catch {
      requestAnimationFrame(mapColor)
    }
  }

  function ADS1 () {
    if (Utils.getItem('ADS') === 'false') return
    pc.app.scene.layers.getLayerByName('NonFOV').enabled = false
    pc.settings.hideArms = true
  }

  function ADS2 () {
    setTimeout(() => {
      if (Utils.getItem('ADS') === 'false') return
      pc.app.scene.layers.getLayerByName('NonFOV').enabled = true
      pc.settings.hideArms = false
    }, 10)
  }
})
