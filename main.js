// Modules to control application life and create native browser window

require('v8-compile-cache');

const process = require('process');

const {
	app,
	shell,
	BrowserWindow,
	screen,
	clipboard,
	protocol,
	ipcMain,
	dialog
} = require('electron');

const { autoUpdater } = require("electron-updater");
const Store = require("electron-store");
const config = new Store({
	defaults: {
		capFPS: false,
		RPC: true,
		splashImage: false,
		disableHands: true,
		ADS: false,
		GUI: false,
	}
});

if (config.get("capFPS") == false) {
	app.commandLine.appendSwitch('disable-frame-rate-limit');
	app.commandLine.appendSwitch("disable-gpu-vsync");
}

const prompt = require('electron-prompt');

let gameWindow;

function createGameWindow() {
	// Create the browser window.
	//Gets dimensions of the screen.
	const {
		width,
		height
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
			webSecurity: true,
		}
	})

	const {
		webContents
	} = gameWindow;

	//This purely creates the Venge.io Window and ensures the game works.
	gameWindow.loadURL('https://venge.io', {
		"extraHeaders": "pragma: no-cache\n"
	});

	gameWindow.on('ready-to-show', () => {
		gameWindow.show();
	})

	const RPC = require('discord-rpc');
    const discord = new RPC.Client({
        transport: "ipc",
    });

	discord.login({
		clientId:  "769550318148780115",
	})

	ipcMain.on("RPC",(event,a,b,c,d) => {
		if (config.get("RPC") == false) return;
		var activity = {};
		var mode;
		var username;
		if (a == null || a == undefined) mode = checkURL(webContents.getURL());
		else mode = a;
		if (b == null || b == undefined) username = "uClient";
		else username = b;
		var currentWeapon = c;
		var timeLeft = d;
		const matchDate = new Date();
		if (timeLeft != null) {
			let tokens = timeLeft.split(':');
			timeLeft = matchDate.setTime(Date.now() + (parseInt(tokens[0]) * 60 + parseInt(tokens[1])) * 1000);
		}
	
		updateRPC();
		function updateRPC(){
			if (mode.includes("Playing") && currentWeapon != null && currentWeapon != undefined) {
				activity = {
					largeImageKey: "logo",
					largeImageText: username,
					smallImageKey: currentWeapon.toLowerCase(),
					smallImageText: currentWeapon,
					endTimestamp: timeLeft,
					details: mode
				}
			}
			else {
				activity = {
					largeImageKey: "logo",
					largeImageText: username,
					details: mode
				}
			}
		}	
		discord.setActivity(activity);
	})


	if (process.platform != "darwin"){
		autoUpdater.checkForUpdatesAndNotify();
	
		autoUpdater.once('update-available', () => {
			webContents.executeJavaScript(`alert("Update is available and will be installed in the background.")`)
		})
	
		autoUpdater.on('update-downloaded', () => {
			webContents.executeJavaScript(`alert("The latest update will be installed now.")`).then(() => autoUpdater.quitAndInstall())
		});
	}

	//Configuration 
	gameWindow.removeMenu();
	webContents.reloadIgnoringCache();
	webContents.on('will-prevent-unload', (event) => event.preventDefault());
	webContents.on('dom-ready', (event) => {

		//Bug Fixes.
		webContents.setZoomLevel(0);
		webContents.setZoomFactor(1);

		//Resource Swapper
		const {
			readdirSync,
			mkdir,
			statSync
		} = require("fs");

		let swapFolder = `${app.getPath("documents")}/uClientSwapper`;
		try {
			mkdir(swapFolder, {
				recursive: true
			}, e => {});
		} catch (e) {};
		let swap = {
			filter: {
				urls: []
			},
			files: {}
		};
		
		const allFilesSync = (dir = swapFolder) => {
			try {
				readdirSync(dir).forEach(file => {
					var filePath = `${app.getPath("documents")}/uClientSwapper/files${filePath.split("files")[filePath.split("files").length - 1]}`;
					if (statSync(filePath).isDirectory()) {
						if (!(/\\(docs)$/.test(filePath)))
							allFilesSync(filePath);
					} else {
						if (!(/\.(html|js)/g.test(file))) {
							let venge = `*://venge.io${filePath.replace(swapFolder, '').replace(/\\/g, '/')}*`
							swap.filter.urls.push(venge);
							swap.files[venge.replace(/\*/g, '')] = `swap:/${filePath}`;
						}
					}
				});
			}
			catch (e) {
				console.log(e);
			}
		};
		allFilesSync(swapFolder);
		if (swap.filter.urls.length) {
			webContents.session.webRequest.onBeforeRequest(swap.filter, (details, callback) => {
				console.log(swap.files[details.url.replace(/https|http|(\?.*)|(#.*)|(?<=:\/\/)/gi, '')]);
				callback({
					cancel: false,
					redirectURL: swap.files[details.url.replace(/https|http|(\?.*)|(#.*)|(?<=:\/\/)/gi, '')] || details.url
				});
			});
		}
		gameWindow.setTitle(`uClient V${app.getVersion()}`);
		event.preventDefault();
	})
	webContents.on('new-window', (event, url) => {
		switch (checkURL(url)) {
			case 'Social':
				event.preventDefault();
				gameWindow.loadURL('https://social.venge.io');
				return;
			case 'Unknown':
				if (url == "https://about.venge.io/changes.html") url = "https://github.com/VengeUrban/uClient/";
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
		if (clipboard.readText().includes('https://venge.io/#')) {
			gameWindow.loadURL(clipboard.readText());
		} else {
			getLink();
		}

		function getLink() {
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
				if (r.includes('https://venge.io/#') && e.length > 1 && e[1].length > 4) {
					gameWindow.loadURL(r);
				} else {
					getLink();
				}
			})
		}
	})
	shortcut.register('F3',() => {
		try {
			webContents.executeJavaScript(`
		pc.app.fire("Chat:Message", "uClient", "Link copied!");
		`)
		clipboard.writeText(webContents.getURL());
		}
		catch {}
	})
	shortcut.register('F10', () => {
		createSettings();
	})
	shortcut.register('F11', () => {
		gameWindow.setSimpleFullScreen(!gameWindow.isSimpleFullScreen());
	})
	shortcut.register('F12', () => {
		webContents.openDevTools({mode: 'right'});
	})
	shortcut.register('Esc', () => {
		webContents.executeJavaScript(`
		document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
		document.exitPointerLock();
		`)
	})
	shortcut.register('CommandOrControl+F5', () => {
		webContents.reloadIgnoringCache();
	})
	shortcut.register('Alt+F4', () => {
		app.quit();
	})
	//Checks for the type of URL in the game :D
	function checkURL(url) {
		if (url.includes("social.venge.io") == true) return "Social";
		if (url.includes("https://venge.io") == false) return `Unknown`;
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

	function createSettings(){
		function toggle(e){
			switch(e) {
				case true:
					return "Disable";
				case false:
					return "Enable";
			}
		}

		const options = dialog.showMessageBoxSync(gameWindow, {
			type: "question",
			buttons: [
			  `${toggle(config.get("capFPS"))} Frame Rate Limit Cap`,
			  `${toggle(config.get("RPC"))} Discord RPC`,
			  `Set End Game Message`,
			  `Clear Cache`,
			  //Set Colour Scheme [BETA]`,
			  `${toggle(config.get("disableHands"))} Hands`,
			  `${toggle(config.get("ADS"))} Hide Weapon on ADS`,
			  //`${toggle(config.get("GUI"))} Custom uClient GUI`
			],
			title: "Settings",
			message: "",
			defaultId: 0,
			cancelId: 6999,
		  });
		switch (options){
			case 0:
				config.set("capFPS",!config.get("capFPS"));
				break;
			case 1: 
				config.set("RPC",!config.get("RPC"));
				break;
			case 2:
				prompt({
					title: '',
					label: 'End-Game Message',
					alwaysOnTop: true,
					type: 'input',
					resizable: false,
					height: 200,
			}).then((r) => {
				webContents.send('setEndGameMessage',r);
			
			})
			return;
			case 3: 
				webContents.session.clearStorageData();
				break;
				/*
			case 5:
				colour();
				function colour(){
					prompt({
						title: '',
						label: 'Set Colour Scheme',
						alwaysOnTop: true,
						type: 'input',
						placeholder: 'r: 255, g: 255, b: 255',
						resizable: false,
						height: 200,
					}).then((r) => {
						let a = [];
					
						r.split(':').forEach(element => {
							a.push(parseInt(element) / 255);
						})
						if (a.length < 3) return colour();
						webContents.send('changeColourScheme',a);
					
					})
				}
				return;
				*/
			case 4:
				config.set("disableHands",!config.get("disableHands"));
				webContents.send("hands",config.get("disableHands"));
				return;
			case 5:
				config.set("ADS",!config.get("ADS"));
				webContents.send("ADS",config.get("ADS"));
				return;
			case 6:
				config.set("GUI",!config.get("GUI"));
				webContents.send("GUI",config.get("GUI"));
				return;
			default: return;
		}
		webContents.executeJavaScript(`
			alert("App will restart now.")
		`).then(() => {
			app.relaunch();
			app.quit();
		})
	}
}


app.on('window-all-closed', () => {
	app.quit();
});

protocol.registerSchemesAsPrivileged([{
	scheme: 'swap',
	privileges: { secure: true, corsEnabled: true }
}])

app.whenReady().then(() => {
	protocol.registerFileProtocol('swap', (request, callback) => {
		callback({path: decodeURI(request.url.replace(/^swap:/,''))});
	});
	if (app.requestSingleInstanceLock()) createGameWindow();
	else {
		try {
			gameWindow.focus();
			gameWindow.show();
		}
		catch {}
	}
})
