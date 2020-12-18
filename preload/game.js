const {
    ipcRenderer
} = require("electron");

document.addEventListener("DOMContentLoaded", () => {
    //Basically voids all errors.
    document.onerror = true;

    //pc.controls.player.entity.parent.findByGuid("13c7bc23-c999-47d0-8da3-30a6f44b6a99").script.networkManager.players[0] //Network manager
    //setInterval(() => {
    //    pc.app.fire("Fetcher:Reward", !0)
    //},60);

    pc.app.on("start", menuColor);
    pc.app.on("Game:Finish", endGameMessage);
    pc.app.on("Overlay:Info", home);
    pc.app.on("Map:Loaded", mapColor);
    pc.app.on("Game:Start", mapColor);
    pc.app.on("Ads:Preroll", () => {
        SDKLoaded = false;
        isAdsBlocked = true;
        pc.isDisplayingAds = false;
        adplayer = undefined;
    });
    pc.app.on("Ads:BannerSet", (a,b) => {
        setTimeout(() => {
            pc.app.fire("Ads:BannerDestroy",a,b);
        },10);
    });
    pc.app.mouse.on("mousedown", (e) => {
        if (pc.settings.hideArms == true) return;
        if (e.button == 2) ADS1();
        pc.app.mouse.on("mouseup", (e) => {
            if (e.button == 2) ADS2();
            if (e.button == 3) pc.controls.player.movement.triggerKeyF();
            if (e.button == 4) pc.controls.player.movement.triggerKeyE();
        });
    })

    function menuColor() {
        //Ping
        Overlay.prototype.setPing = function(t) {
            this.ping = t;
        }

        RoomManager.prototype.onStart = function() {
            this.app.fire("Analytics:Event", "Invite", "TriedToStart"),
                this.send([this.keys.start]),
                this.app.fire("Analytics:Event", "Invite", "Start")
        }

        MapManager.prototype.onSettingsChange = function() {};

        if (Utils.getItem('endGameMessage') == null || Utils.getItem('endGameMessage') == "null") Utils.setItem('endGameMessage', 'GG!');
        if (Utils.getItem('DisableHands') == null || Utils.getItem('DisableHands') == "null") Utils.setItem('DisableHands', false);
        Utils.setItem("ColourScheme", JSON.stringify({
            r: 0.97254901,
            g: 0.7764705882,
            b: 1
        }));

        var menuColor = {
            r: 0.3882352941,
            g: 0,
            b: 0.72941176
        };

        pc.app.scene.root.findByName("Twitch").element.entity.setLocalPosition(-520, -257, 0);
        pc.app.scene.root.findByName("Twitter").enabled = false;
        pc.app.scene.root.findByGuid("2baa7f22-cb28-4cbb-a175-55b8d4385c6f").enabled = false;
        pc.app.scene.root.findByName("Poki").enabled = false;
        pc.app.scene.root.findByGuid("63e2718e-ce1c-489c-add7-988b7a0d1d75").enabled = false;
        pc.app.scene.root.findByGuid("e0850441-d29d-4e62-ae27-b1853130faec").element.text = "uClient";
        let guid = ["a8864f8b-ae61-470d-99b2-91800ab9c798", "c41b84e4-2613-4f4d-8c4a-7d1c6c26c560", "ed3526e2-16ff-4fa9-a9a5-2dd5908e842e", "6be3609e-10d3-47d3-afd6-31c88ddf1616"];
        for (let a of guid) {
            pc.app.scene.root.findByGuid(a).element.color = menuColor;
        }
    }

    //Slider.
    new MutationObserver(() => {
        const input = document.getElementsByTagName("input");
        var b = 0;
        for (let a = 0; a < input.length; a++) {
            if (input[a].type == 'range') {
                b++;
                if (b == 3) {
                    input[a].max = 140;
                    input[a].value = pc.settings.fov;
                }
                if (b == 4) {
                    input[a].max = 110;
                    input[a].value = pc.settings.resolution * 100;
                }
            }
        }
    }).observe(document.documentElement, {
        childList: true,
        subtree: true
    })

    //End-Game Message.
    ipcRenderer.on("hands", (event, message) => {
        Utils.setItem("DisableHands", JSON.parse(message));
        pc.controls.player.characterArmLeft.enabled = JSON.parse(Utils.getItem("DisableHands"));
    })

    ipcRenderer.on('setEndGameMessage', (event, message) => {
        console.log(message);
        Utils.setItem('endGameMessage', message);
        if (window.location.href.substring("https://venge.io".length).length < 3) pc.app.fire("Alert:Menu", `End-game Message has been set to '${message}'`);
        else pc.app.fire("Chat:Message", "uClient", `End-game message has been switched to '${message}'`);
    });

    ipcRenderer.on("changeColourScheme", (event, message) => {
        Utils.setItem("ColourScheme", JSON.parse({
            r: message[1],
            g: message[2],
            b: message[3]
        }));
        window.location.href = "https://venge.io";
    })

    ipcRenderer.on("ADS", (event, message) => {
        Utils.setItem("ADS", JSON.parse(message));
    })

    ipcRenderer.on("GUI", (event, a) => {
        Utils.setItem("GUI", JSON.parse(a));
    })

    function home() {
        if (window.location.href.substring("https://venge.io".length).length > 2) window.location.href = "https://venge.io";
    };

    function endGameMessage() {
        pc.app.fire("Network:Chat", Utils.getItem('endGameMessage'))
    }

    function mapColor() {
        try {
            var ammoColour = {
                r: 0.866666666667,
                g: 0.55294117,
                b: 1
            }

            //Leaderboard
            guidElement("ebebda7a-5ed8-4895-841d-73c2b1ab560b").element.opacity = 0.1;

            //Weapon
            pc.controls.player.entity.children[0].children[4].setLocalPosition(0.5, 0.58, -0.80);

            //FPS + Ping 
            guidElement("2885c322-8cea-4b70-b591-89266a1bb5a0").element.color = {
                r: 0.51764705,
                g: 0.06274509,
                b: 0.91372549
            };
            guidElement("2885c322-8cea-4b70-b591-89266a1bb5a0").setLocalScale(1.5, 1.5, 1.5);
            guidElement("2885c322-8cea-4b70-b591-89266a1bb5a0").setLocalPosition(5.000009536743164, -5.0001983642578125, 0);

            //Ammo Colour
            guidElement("25aee198-fae3-4780-a2de-f68fce9bafd8").element.color = ammoColour;

            //Health Bar Colour
            pc.colors.health = ammoColour;

            //Universal Colours
            let guid = ["daa5691e-0518-4bd2-bc17-313828af5bb2", "f8763836-19f6-44e6-8682-8da05cc064b6", "9371241a-4fac-4a23-bf29-343c0f0fedd6", "808a452e-7d73-433a-b91e-91d6e1c51286", "df20128a-9f30-4da8-933c-f217ebbfbc88", "a79a0e7c-adb3-44b3-bd25-19ddc6b1161d", "6501a7fd-23ea-4b35-b634-35a95f09280d", "09e900aa-538b-4a7c-ab45-4de687bebd25"];
            for (a of guid) {
                guidElement(a).element.color = JSON.parse(Utils.getItem("ColourScheme"));
            }

            //Hands
            pc.controls.player.characterArmLeft.enabled = JSON.parse(Utils.getItem("DisableHands"));

            //AmbientLight
            pc.app.scene.exposure = 6;
            pc.app.scenes._app.lightmapper.root.children[1].children[0].light.vsmBlurSize = 0;
            pc.app.scenes._app.lightmapper.root.children[1].children[0].light.intensity = 0;


            function guidElement(guid) {
                if (typeof pc.controls.interfaceEntity.findByGuid(guid) != "undefined") return pc.controls.interfaceEntity.findByGuid(guid);
            }
        } catch {
            setTimeout(() => {
                mapColor();
            }, 2e3);
        }
    }


    function ADS1() {
        if (Utils.getItem("ADS") == "false") return;
        pc.app.scene.layers.getLayerByName("NonFOV").enabled = false;
        pc.settings.hideArms = true;
        return;
    }

    function ADS2() {
        setTimeout(() => {
            if (Utils.getItem("ADS") == "false") return;
            pc.app.scene.layers.getLayerByName("NonFOV").enabled = true;
            pc.settings.hideArms = false;
            return;
        }, 10);
    }

    check();

    var username = "a";
    var mode = "a";
    var timeLeft = "a";
    var currentWeapon = "a";

    function check() {
        try {
            if (typeof pc.session.username == "string") username = Utils.cleanUsername(pc.session.username);
            if (typeof pc.currentMode != "undefined") mode = "Playing " + pc.currentMode.charAt(0) + pc.currentMode.toLowerCase().substring(1);
            if (typeof pc.controls != "undefined") {
                currentWeapon = pc.controls.player.movement.currentWeapon.entity.name;
                timeLeft = pc.controls.interfaceEntity.script.overlay.timeEntity.element.text;
            }
        } catch {}
        ipcRenderer.send("RPC", mode, username, currentWeapon, timeLeft);
        setTimeout(() => {
            check();
        }, 2e3);
    }
});
