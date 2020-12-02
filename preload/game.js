const {
    ipcRenderer
} = require("electron");
document.addEventListener('DOMContentLoaded', () => {

    var username = null;
    var mode = null;
    var timeLeft = null;
    var currentWeapon = null;

    async function getGameVariable(val) {
        while (!window.hasOwnProperty(val)) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    };

    getGameVariable("Menu").then(() => {
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
        var isMatchEnd = 0;
        if (Utils.getItem('endGameMessage') == null || Utils.getItem('endGameMessage') == "null") Utils.setItem('endGameMessage', 'GG!');
        Utils.setItem('locationHref', 'https://google.com');

        //Ping
        Overlay.prototype.setPing = function(t) {
            this.ping = t;
        }

        RoomManager.prototype.onStart = function() {
            this.app.fire("Analytics:Event", "Invite", "TriedToStart"),
                this.send([this.keys.start]),
                this.app.fire("Analytics:Event", "Invite", "Start")
        }

        check();


        function check(){
            if (Utils.getItem("locationHref") != window.location.href){
                doThings();
                Utils.setItem("locationHref", window.location.href);
            }
            console.log(Utils.getItem("locationHref"));
            setTimeout(() => {
                check();
            }, 500);
        }
    

        function doThings() {
            RPC();

            function RPC() {
                try {
                    try {
                        if (typeof pc.session.username == "string") username = Utils.cleanUsername(pc.session.username);
                        if (typeof pc.currentMode != "undefined") mode = "Playing " + pc.currentMode.charAt(0) + pc.currentMode.toLowerCase().substring(1);
                        if (typeof pc.controls.player.movement.currentWeapon.entity.name != "undefined") currentWeapon = pc.controls.player.movement.currentWeapon.entity.name;
                        if (typeof pc.controls.interfaceEntity.script.overlay.timeEntity.element.text != "undefined") timeLeft = pc.controls.interfaceEntity.script.overlay.timeEntity.element.text;

                    } catch {}
                
                    if (window.location.href.substring("https://venge.io".length).length < 3) {
                        if (pc.app.scene.root.findByGuid("e0850441-d29d-4e62-ae27-b1853130faec").element.text == "uClient") return;
                        pc.app.scene.root.findByName("Twitch").element.entity.setLocalPosition(-520, -257, 0);
                        pc.app.scene.root.findByName("Challenges").element.entity.setLocalScale(0.7, 0.7, 0);
                        pc.app.scene.root.findByName("Challenges").element.entity.setLocalPosition(-175, 110.1, 0);
                        pc.app.scene.root.findByName("Twitch").element.entity.setLocalScale(1.2, 1.2, 1.2);
                        pc.app.scene.root.findByName("Twitter").enabled = false;
                        pc.app.scene.root.findByGuid("2baa7f22-cb28-4cbb-a175-55b8d4385c6f").enabled = false;
                        pc.app.scene.root.findByName("Poki").enabled = false;
                        pc.app.scene.root.findByGuid("63e2718e-ce1c-489c-add7-988b7a0d1d75").enabled = false;
                        pc.app.scene.root.findByGuid("019bfc08-7caa-49fe-a4b1-681dc7060a80").setLocalPosition(175, 2, 1);
                        pc.app.scene.root.findByGuid("72fadb2f-bcce-4848-9c17-f66bfce97edf").setLocalPosition(115, 2, 1);
                        pc.app.scene.root.findByGuid("e0850441-d29d-4e62-ae27-b1853130faec").setLocalPosition(100, -32, 0);
                        pc.app.scene.root.findByGuid("e0850441-d29d-4e62-ae27-b1853130faec").element.text = "uClient";
                        pc.app.scene.root.findByGuid("e0850441-d29d-4e62-ae27-b1853130faec").setLocalScale(1.3, 1.3, 1.3);
                        pc.app.scene.root.findByGuid("a8864f8b-ae61-470d-99b2-91800ab9c798").element.color = {
                            r: 0.3882352941,
                            g: 0,
                            b: 0.72941176
                        };
                        pc.app.scene.root.findByGuid("c41b84e4-2613-4f4d-8c4a-7d1c6c26c560").element.color = {
                            r: 0.3882352941,
                            g: 0,
                            b: 0.72941176
                        };
                        pc.app.scene.root.findByGuid("ed3526e2-16ff-4fa9-a9a5-2dd5908e842e").element.color = {
                            r: 0.3882352941,
                            g: 0,
                            b: 0.72941176
                        };
                        pc.app.scene.root.findByGuid("6be3609e-10d3-47d3-afd6-31c88ddf1616").element.color = {
                            r: 0.3882352941,
                            g: 0,
                            b: 0.72941176
                        };
                    } else {

                        //Auto Back-to-Menu
                        if (typeof pc.controls.interfaceEntity.script.overlay.infoEntity.enabled == "boolean") {
                            if (pc.controls.interfaceEntity.script.overlay.infoEntity.enabled == true) {
                                window.location.href = "https://venge.io";
                            }
                        }
                        if (typeof pc.isFinished == "boolean") {
                            if (pc.isFinished == true) {
                                if (isMatchEnd == 0) {
                                    isMatchEnd++;
                                    pc.app.fire("Network:Chat", Utils.getItem('endGameMessage'));
                                }
                            } else isMatchEnd = 0;
                        }
                        if (pc.app.scenes._app.lightmapper.root.children[1].children[0].light.intensity == 0) return;
                        if (typeof pc.currentMode == "string") {
                                pc.app.scene.exposure = 6;
                                pc.app.scenes._app.lightmapper.root.children[1].children[0].light.vsmBlurSize = 0;
                                pc.app.scenes._app.lightmapper.root.children[1].children[0].light.intensity = 0;
                            }
                            if (typeof pc.controls.player.entity.children[0].children[4] != "undefined") {
                                pc.controls.player.entity.children[0].children[4].setLocalPosition(0.5, 0.58, -0.80);
                            }
                        }
                        if (typeof guidElement("2885c322-8cea-4b70-b591-89266a1bb5a0") != "undefined") {
                            guidElement("2885c322-8cea-4b70-b591-89266a1bb5a0").element.color = {
                                r: 0.51764705,
                                g: 0.06274509,
                                b: 0.91372549
                            };
                            guidElement("2885c322-8cea-4b70-b591-89266a1bb5a0").setLocalScale(1.5, 1.5, 1.5);
                            guidElement("2885c322-8cea-4b70-b591-89266a1bb5a0").setLocalPosition(5.000009536743164, -5.0001983642578125, 0);
                        }
                        if (typeof guidElement("25aee198-fae3-4780-a2de-f68fce9bafd8") != "undefined") {
                            guidElement("25aee198-fae3-4780-a2de-f68fce9bafd8").element.color = {
                                r: 0.866666666667,
                                g: 0.55294117,
                                b: 1
                            };
                        }
                       
                        if (typeof pc.colors != "undefined") {
                            pc.colors.health = {
                                r: 0.97254901,
                                g: 0.7764705882,
                                b: 1
                            };
                        }
                        if (typeof guidElement("ebebda7a-5ed8-4895-841d-73c2b1ab560b") != "undefined") {
                            guidElement("ebebda7a-5ed8-4895-841d-73c2b1ab560b").element.opacity = 0.1;
                        }
                        
                        var guid = ["daa5691e-0518-4bd2-bc17-313828af5bb2","f8763836-19f6-44e6-8682-8da05cc064b6","9371241a-4fac-4a23-bf29-343c0f0fedd6","808a452e-7d73-433a-b91e-91d6e1c51286","df20128a-9f30-4da8-933c-f217ebbfbc88","a79a0e7c-adb3-44b3-bd25-19ddc6b1161d","6501a7fd-23ea-4b35-b634-35a95f09280d","09e900aa-538b-4a7c-ab45-4de687bebd25"];
                        for (let a = 0; a < guid.length; a++) {
                            if (typeof guidElement(guid[a]) != "undefined") {
                                guidElement(guid[a]).element.color = {
                                    r: 0.97254901,
                                    g: 0.7764705882,
                                    b: 1
                                }
                            }
                            else continue;
                        }
                        function guidElement(guid){
                            if (typeof pc.controls.interfaceEntity.findByGuid(guid) != "undefined") return pc.controls.interfaceEntity.findByGuid(guid);
                        }
                     
                   


                } catch {
                    setTimeout(() => {
                        doThings()
                    }, 200);
                }
                
            ipcRenderer.send("RPC", mode, username, currentWeapon, timeLeft);
            }
        }
    })

    getGameVariable("Chat").then(() => {
        ipcRenderer.on('setEndGameMessage', (event, message) => {
            console.log(message);
            Utils.setItem('endGameMessage', message);
            if (window.location.href.substring("https://venge.io".length).length < 3) pc.app.fire("Alert:Menu", `End-game Message has been set to '${message}'`);
            else pc.app.fire("Chat:Message", "uClient", `End-game message has been switched to '${message}'`);

        });

        Chat.prototype.sendMessage = function() {
            if (!this.inputEntity.enabled)
                return !1;
            var t = this.inputEntity.script.input.getValue();
            //Input commands here.
            var f = ['!end', '!def', '!help'];
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
                                    Utils.setItem('endGameMessage', list.join(' '));
                                    this.app.fire("Chat:Message", "uClient", `End-game message has been switched to '${Utils.getItem('endGameMessage')}'`);
                                } else {
                                    this.app.fire("Chat:Message", "uClient", `Invalid Syntax: Missing Variable after '${i[0]}'`);
                                }
                                break;
                            case 1:
                                this.app.fire("Chat:Message", "uClient", `End-game message is '${Utils.getItem('endGameMessage')}'`);
                                break;
                            case 2:
                                this.app.fire("Chat:Message", "uClient", `Below are the list of commands:`);
                                this.app.fire("Chat:Message", "uClient", `!help : This command.`);
                                this.app.fire("Chat:Message", "uClient", `!end <msg> : Sets your end-game message. Default message is 'GG!'`);
                                break;
                        }
                        this.inputEntity.script.input.setValue('');
                        this.blur();
                    }
                }
            } else {
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

    })
})
