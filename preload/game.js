require('v8-compile-cache');

const {
    ipcRenderer
} = require('electron');

const Store = require('electron-store');
const config = new Store();

var utils = {
    get: function(str) {
            return config.get(str);
        },
        set: function(str, val) {
            return config.set(str, val);
        }
}


document.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.on('ESCAPE', () => {
        document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
        document.exitPointerLock();
    })
    const RPC = require('discord-rpc');
    const ClientRPC = new RPC.Client({
        transport: "ipc",
    });

    function login() {
        try {
            ClientRPC.login({
                clientId: "769550318148780115",
            });
        } catch {
            login();
        }
    }

    login()

    ClientRPC.on('ready', () => {
        const date = Date.now();
        const matchDate = new Date();
        setInterval(() => {
            updateRPC();
        }, 3e3);


        function updateRPC() {
            let ign;
            let timeRemaining;

            if (timeLeft != null) {
                let tokens = timeLeft.split(':');
                timeLeft = parseInt(tokens[0]) * 60 + parseInt(tokens[1]);
                timeRemaining = matchDate.setTime(Date.now() + timeLeft * 1000);
            } else timeRemaining = date;

            if (username != null) {
                let e = username.split('[/color]]');
                let i = username.split('[[color');
                if (i.length > 1) {
                    let a = i[1].split('[/color]]');
                    let b = a[0].split(']');
                    ign = `[${b[1]}] ${e[1]}`;
                } else ign = `${e[0]}`
            } else {
                ign = `uClient`;
            }

            //Gets the type of URL.
            if (getURLType() == 'Playing a Match') {
                if (mode != null) {
                    let e = mode.slice(1);
                    e = e.toLowerCase();
                    let a = mode.slice(0, 1);
                    update(`Playing ${a}${e}`);
                } else {
                    update(`In Menu`);
                }
            } else update(getURLType());

            function update(msg) {
                if (msg.includes('Playing') == true) {
                    ClientRPC.setActivity({
                        largeImageKey: "logo",
                        largeImageText: `${ign}`,
                        smallImageKey: `${currentWeapon.toLowerCase()}`,
                        smallImageText: `${currentWeapon}`,
                        endTimestamp: timeRemaining,
                        details: `${msg}`,
                    })
                } else {
                    ClientRPC.setActivity({
                        largeImageKey: "logo",
                        largeImageText: `${ign}`,
                        details: `${msg}`,
                    })
                }
            }

            function getURLType() {
                const url = window.location.href;
                if (url.includes('social.venge.io') == true) return 'Browsing Socials';
                let t = url.split('#');
                if (t.length < 2) return 'In Menu';
                else {
                    let u = t[t.length - 1];
                    if (u.length > 1) {
                        let i = u.split(':');
                        if (i.length > 1 && i[0] == 'Spectate') return 'Spectating a Match';
                        else return 'Playing a Match';
                    } else return 'Searching for a Match'
                }
            }
        }
    })
})

var username = null;
var mode = null;
var timeLeft = null;
var currentWeapon = null;
if (utils.get('endGameMessage') == null) utils.set('endGameMessage', 'GG!');
if (utils.get('FOV') == null) utils.set('FOV', 120);
if (utils.get('RES') == null) utils.set('RES', 120);
const loadGame = () => {
    try {
        if (utils.get('defaultGun') == null) utils.set('defaultGun','Scar');
        //Join solo game.
        RoomManager.prototype.onStart = function() {
            this.app.fire("Analytics:Event", "Invite", "TriedToStart"),
                this.send([this.keys.start]),
                this.app.fire("Analytics:Event", "Invite", "Start")
        }

        //Also required solely for Discord RPC.
        Menu.prototype.onProfileData = function(e) {
            if (this.isMatchFound)
                return !1;
            if (e && (pc.session.hash = e.hash,
                pc.session.username = e.username,
                username = e.username,
                Utils.setItem("Hash", e.hash),
                e.username && this.miniProfileEntity && this.miniProfileEntity.element)) {
                var t = this.miniProfileEntity.findByName("Username").element.width;
                this.miniProfileEntity.element.width = 355 + t
            }
        }

        //Also meant for Discord RPC.
        Overlay.prototype.onTick = function(t, e) {
            this.isOvertime ? (this.timeEntity.element.text = t,
                    timeLeft = t,
                    this.timeEntity.element.color = pc.colors.health,
                    this.timeEntity.element.fontSize = 35) : (this.timeEntity.element.text = Utils.mmss(e),
                    timeLeft = Utils.mmss(e),
                    this.timeEntity.element.color = pc.colors.white,
                    this.timeEntity.element.fontSize = 25),
                t < 0 && !pc.isFinished ? (this.alreadyStarted.enabled = !0,
                    this.alreadyStartedCount.element.text = 20 + t) : this.alreadyStarted.enabled = !1,
                t >= 0 && t <= 5 ? (this.countBackEntity.enabled = !0,
                    this.countBackEntity.element.text = t,
                    this.entity.sound.play("Count")) : (this.countBackEntity.enabled = !1,
                    this.isOvertime && !pc.isFinished && this.entity.sound.play("Overtime-Count"))
        }

        //Chat feature
        Chat.prototype.sendMessage = function() {
            if (!this.inputEntity.enabled)
                return !1;
            var t = this.inputEntity.script.input.getValue();

            //Twitch chat feature here.
            const tmi = require('tmi.js');
            const client = new tmi.Client({
                connection: {
                    secure: true,
                    reconnect: true
                },
                channels: [channelName]
            })
            client.connect();
            client.on('message', (channel, tags, message, self) => {
                this.app.fire("Chat:Message",`${tags.username}`,`${message}`);
            });
            //Input commands here.
            var f = ['!end', '!def','!gun','!fov','!help','!res'];
            let i = t.split(' ');
            if (t.startsWith('!')) {
                for (let j = 0; j < f.length; j++) {
                    if (i[0] == f[j]) {
                        //Command configurations.
                        switch (j) {
                            case 0:
                                if (i.length > 1) {
                                    let list = [];
                                    for (let a = 1; a < i.length; a++) {
                                        list.push(i[a]);
                                    }
                                    utils.set('endGameMessage', list.join(' '));
                                    this.app.fire("Chat:Message", "uClient", `End-game message has been switched to '${utils.get('endGameMessage')}'`);
                                } else {
                                    this.app.fire("Chat:Message", "uClient", `Invalid Syntax: Missing Variable after '${i[0]}'`);
                                }
                                break;
                            case 1:
                                this.app.fire("Chat:Message", "uClient", `End-game message is '${utils.get('endGameMessage')}'`);
                                break;
                            case 2:
                                if (i.length == 2){
                                    let k = i[1].slice(1);
                                    k = k.toLowerCase();
                                    let l = i[1].slice(0,1);
                                    l = l.toUpperCase();
                                    let guns = ['Scar','Shotgun','Sniper','Tec-9'];
                                    for (let v = 0; v < guns.length; v++){
                                        if (`${l}${k}` == guns[v]) {
                                            utils.set('defaultGun',guns[v]);
                                            this.app.fire("Chat:Message", "uClient", `Gun that will be used next round is '${guns[v]}'`);
                                            this.inputEntity.script.input.setValue('');
                                            this.blur();
                                            return;
                                        }
                                    }
                                    this.app.fire("Chat:Message", "uClient", `Invalid Gun Choice.`);
                                }
                                else {
                                    this.app.fire("Chat:Message", "uClient", `Invalid Syntax.`);
                                }
                                break;
                            case 3:
                                if (i.length == 2){
                                    try {
                                        utils.set('FOV',parseInt(i[1]));
                                        this.app.fire("Chat:Message", "uClient", `FOV is now ${i[1]}.`);
                                    }
                                    catch {
                                        this.app.fire("Chat:Message", "uClient", `Invalid Syntax.`);
                                    }
                                }
                                else {
                                    this.app.fire("Chat:Message", "uClient", `Invalid Syntax.`);
                                }
                                break;
                            case 4:
                                this.app.fire("Chat:Message", "uClient", `Below are the list of commands:`);
                                this.app.fire("Chat:Message", "uClient", `!def : Shows your end-game message.`);
                                this.app.fire("Chat:Message", "uClient", `!help : This command.`);
                                this.app.fire("Chat:Message", "uClient", `!end <msg> : Sets your end-game message. Default message is 'GGWP!'`);
                                this.app.fire("Chat:Message", "uClient", `!fov <number> : Sets your FOV to that number.`);
                                this.app.fire("Chat:Message", "uClient", `!gun <gun name> : Configures your gun for the matches to come.`);
                                break;
                            case 5:
                                try {
                                    if (i.length == 2){
                                        utils.set('RES',parseInt(i[1]));
                                        this.app.fire("Chat:Message", "uClient", `Resolution is now ${i[1]}.`);
                                    }
                                }
                                catch {this.app.fire("Chat:Message", "uClient", `Invalid Syntax.`);}
                        }
                        this.inputEntity.script.input.setValue('');
                        this.blur();
                    }
                }
            }
            else {
                if (t.length <= 0)
                    return !1;
                if (t.startsWith(' ')) {
                    if (t.length < 2) {
                        return !1;
                    } else {
                        t = t.slice(1);
                    }
                }
                this.app.fire('Network:Chat', t);
                this.inputEntity.script.input.setValue('');
                this.blur();
                this.lastMessageDate = Date.now();
            }
        }

        //Chooses whatever gun you put as what gun you will start out with next round.
        Player.prototype.onStart = function() {
            pc.session && void 0 !== pc.session.character ? this.app.fire("Player:Character", pc.session.character) : this.app.fire("Player:Character", this.characterName),
            this.movement.setAmmoFull(),
            this.setWeapon(utils.get('defaultGun'),!1);
            this.cards = [],
            this.killCount = 0,
            this.deathCount = 0,
            this.app.fire("Digit:KillCount", this.killCount),
            this.app.fire("Digit:DeathCount", this.deathCount),
            setTimeout(function(t) {
                t.fireNetworkEvent("connected", !0)
            }, 800, this)
        }
        
        //End Game Message
        Result.prototype.initialize = function() {
            for (var t in this.players = [],
            this.rankOpacity = 0,
            this.mapEntities = [],
            this.time = this.maxTime,
            this.tick(),
            this.rowEntity.enabled = !1,
            this.resultHolder.enabled = !0,
            this.scoresEntity.enabled = !1,
            pc.currentMap && (this.mapNameEntity.element.text = pc.currentMap + ""),
            !0 === pc.isSpectator ? this.showMessage("OVER") : pc.isVictory ? this.showMessage("VICTORY") : this.showMessage("DEFEAT"),
            setTimeout(function(t) {
                t.showScoreTable(pc.stats)
            }, 3e3, this),
            this.app.fire("Overlay:Gameplay", !1),
            this.app.fire("Network:Chat", utils.get('endGameMessage')),
            this.app.mouse.disablePointerLock(),
            pc.isFinished = !0,
            this.app.fire("Player:Lock", !1),
            this.app.fire("Game:Finish", !0),
            this.currentSkillIndex = 0,
            this.skills = [],
            pc.stats) {
                var e = pc.stats[t];
                e.isMe && (this.skills = [{
                    name: "Experience",
                    score: e.experience
                }, {
                    name: "Bonus XP",
                    score: e.bonus
                }, {
                    name: "Total Experience",
                    score: e.experience + e.bonus
                }],
                this.app.fire("Miniplay:Save", "kills", e.kill),
                this.app.fire("Miniplay:Save", "deaths", e.death),
                this.app.fire("Miniplay:Save", "objective_score", e.totalCardPoint),
                this.app.fire("Miniplay:Save", "assist", e.assist),
                this.app.fire("Miniplay:Save", "headshot", e.headshot),
                this.app.fire("Miniplay:Save", "reward", e.reward),
                this.app.fire("Miniplay:Save", "score", e.score))
            }
            this.skillPoints = [],
            this.voteBar.setLocalScale(.001, 1, 1),
            pc.isPrivate ? this.skillHolder.enabled = !1 : this.skillHolder.enabled = !0,
            this.on("state", this.onStateChange, this),
            this.entity.on("destroy", this.onDestroy, this),
            this.app.on("Result:Preroll", this.onPreroll, this),
            this.onStateChange(!0),
            this.rewardButtonTimer = setTimeout(function(t) {
                pc.app.fire("Result:DestroyBanner", !0)
            }, 18e3, this),
            "undefined" != typeof PokiSDK && PokiSDK.gameplayStop(),
            this.app.on("Result:Banner", this.setBanner, this),
            this.app.on("Result:DestroyBanner", this.destroyBanner, this),
            window.onbeforeunload = !1
        }
        Spectator.prototype.initialize = function() {
            pc.settings || (pc.settings = {}),
            pc.settings.sensivity || (pc.settings.sensivity = 1),
            this.targets = [],
            this.targetIndex = 0,
            this.sensivity = .1;
            var t = 1;
            this.speed = t,
            this.isZooming = !1,
            this.zoomOutTween = !1,
            this.isMouseLocked = !1,
            this.currentCameraFov = 50,
            this.currentState = !0,
            this.lookX = 0,
            this.lookY = 0,
            this.targetVector = new pc.Vec3(0,0,0),
            this.app.mouse.on("mouseup", this.onMouseUp, this),
            this.app.mouse.on("mousemove", this.onMouseMove, this),
            this.app.mouse.on("mousedown", this.onMouseDown, this),
            this.app.mouse.on("mousewheel", this.onMouseWheel, this),
            document.addEventListener("pointerlockchange", this.setMouseState.bind(this)),
            window.oncontextmenu = function() {
                return !1
            }
            ,
            this.app.on("Map:Loaded", this.onMapLoaded, this),
            this.app.on("Game:PlayerJoin", this.onPlayerJoin, this),
            this.app.on("Camera:State", this.onCameraState, this)
        }
        Movement.prototype.update = function(t) {
            this.lastDelta += t,
            this.setCameraAngle(),
            mode = pc.currentMode,
            currentWeapon = this.currentWeapon.entity.name,
            pc.settings.resolution = utils.get('RES');
            pc.controls.player.movement.defaultFov = utils.get('FOV');
            this.setKeyboard(),
            this.setGravity(),
            this.setMovement(),
            this.setDamping(t);
            var e = this.lastDelta;
            e > pc.dt - .001 && (this.setHandAngle(e),
            this.setCurrentValues(e),
            this.setMovementAnimation(e),
            this.checkGlitches(e),
            this.setShooting(e),
            this.isMobile && this.updateAutoLock(),
            this.timestamp += e,
            this.lastDelta = 0)
        }
        console.log('Everything has been loaded!');

    } catch {
        window.requestAnimationFrame(loadGame);
    }
}

const loadStart = () => {
    try {
        let image = document.getElementById('animated-loading-image-1');
        image.parentElement.removeChild(image);
        window.requestAnimationFrame(loadGame);
    } catch {
        window.requestAnimationFrame(loadStart);
    }
}
window.requestAnimationFrame(loadStart);
