const { ipcRenderer } = require('electron')

window.addEventListener('DOMContentLoaded', () => {
    const DEFAULT_STORAGE = {
        ADS: false,
        MOD: 'uClient-Default.js',
        HANDS: false,
        HITMARKER: true
    }

    Object.keys(DEFAULT_STORAGE).forEach((keys) => (localStorage.getItem(keys) === null) ? localStorage.setItem(keys, DEFAULT_STORAGE[keys]) : 0)
    const req = new XMLHttpRequest();
    req.open('GET', 'https://raw.githubusercontent.com/urbaaan/uClient/main/mods/' + localStorage.getItem('MOD'), true)
    req.send()

    req.onreadystatechange = function () {
        if (req.readyState === req.DONE) {
            const script = document.createElement('script')
            script.appendChild(document.createTextNode(req.responseText))
            document.head.appendChild(script)
        }
    }

    ipcRenderer.on('event', (event, change, bool) => {
        Utils.setItem(change, bool)
        console.log(change)
        if (change === 'HANDS' && pc.controls) pc.controls.player.characterArmLeft.enabled = JSON.parse(Utils.getItem('HANDS'))
        if (change === 'MOD') window.location.reload()
    })
    
    const uClientAddons = {
        HITMARKER: {
            event: ['Hit:Point', 'Hit:Headshot'],
            action: () => pc.controls.interfaceEntity.findByGuid('f8763836-19f6-44e6-8682-8da05cc064b6').enabled = JSON.parse(Utils.getItem('HITMARKERS'))
        },
        HANDS: {
            event: ['Game:Start'],
            action: () => pc.controls.player.characterArmLeft.enabled = JSON.parse(Utils.getItem('HANDS'))
        },
        RPC: {
            event: ['Game:Start','Game:Overtime', 'Game:Finish', 'Map:Loaded'],
            action: () => doRPC()
        },
        ADS: {
            event: ['Game:Start'],
            action: () => {
                pc.app.mouse.on('mousedown', (event) => {
                    if (!pc.settings.hideArms) {
                        (event.button === 2) ? ADS_DOWN() : 0
                        pc.app.mouse.on('mouseup', (event) => {
                            if (event.button === 2) ADS_UP()
                            if (event.button === 3) pc.controls.player.movement.triggerKeyF()
                            if (event.button === 4) pc.controls.player.movement.triggerKeyE()
                        })
                    }
                })
            }
        },
        'AUTO-OVERLAY': {
            event: ['Overlay:Info'],
            action: () => (new URL(window.location.href).pathname.length > 0) ? window.location.href = 'https://venge.io' : 0
        },

        'BUG-FIXES': {
            event: ['start'],
            action: () => {
                window.Overlay.prototype.setPing = new Proxy(window.Overlay.prototype.setPing, {
                    apply(target, that, [ping]) {
                        return that.ping = ping
                    }
                })

                window.MapManager.prototype.onSettingsChange = new Proxy(window.MapManager.prototype.onSettingsChange, {
                    apply() { return console.log('Fixed Swapper') }
                })
            }
        }
    }
    
    Object.keys(uClientAddons).forEach((keys) => {
        for (let events in uClientAddons[keys].event) {
            pc.app.on((uClientAddons[keys].event[events]), uClientAddons[keys].action)
        }
    })
    

    function doRPC() {
        const RPC = {
            mode: 'Playing ' + pc.currentMode.charAt(0) + pc.currentMode.toLowerCase().slice(1) || 'Playing Venge.io',
            time: (Number.parseInt(pc.controls.interfaceEntity.script.overlay.timeEntity.element.text.split(':')[0]) * 60000) + (Number.parseInt(pc.controls.interfaceEntity.script.overlay.timeEntity.element.text.split(':')[1]) * 1000) || Number.parseInt(pc.controls.interfaceEntity.script.overlay.timeEntity.element.text) || 0,
            username: Utils.cleanUsername(pc.session.username || 'uClient'),
            map: 'on ' + pc.currentMap || null
        }
        return ipcRenderer.send('RPC', JSON.stringify(RPC))
    }

    function ADS_DOWN() {
        if (!JSON.parse(Utils.getItem('ADS'))) return
        pc.app.scene.layers.getLayerByName('NonFOV').enabled = false
        pc.settings.hideArms = true
    }

    function ADS_UP () {
      if (!JSON.parse(Utils.getItem('ADS'))) return
      pc.app.scene.layers.getLayerByName('NonFOV').enabled = true
      pc.settings.hideArms = false
    }
})
