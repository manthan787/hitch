const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')
const bonjour = require('bonjour')();
const os = require("os");


let win;
let service;

function createWindow() {
    win = new BrowserWindow({width:600, height:500});
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Open the DevTools.
    win.webContents.openDevTools()
    
    service = bonjour.publish({ name: os.hostname(), type: 'discovery', port: 3000 });
    
    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        app.quit();
    });

}

app.on('ready', createWindow);
app.on('quit', function() {
    service.stop();
    bonjour.unpublishAll(function() {
        console.log("Unpublished");
    });
    bonjour.destroy();
});
