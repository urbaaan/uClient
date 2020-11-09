const { ipcRenderer } = require('electron')

ipcRenderer.on('message', (event, messageText) => {
	if (messageText != null) message.innerText = messageText
})

