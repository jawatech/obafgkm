'use strict';
const qs = require ("querystring");
const electron = require('electron');
const path = require('path');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const pdfURL = "http://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";
var webContents = null;
var mainWindow = null;
const ipcMain = require('electron').ipcMain;
app.on('ready', function() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      webSecurity: false,
	// Load `electron-notification-shim` in rendering view, by requiring it in your preloaded script. 
      //the path of preload script has to be "absolute path".
      //https://github.com/atom/electron/blob/v0.34.3/docs/api/browser-window.md#new-browserwindowoptions
      preload: path.join(__dirname, 'preload.js')
		      
    },
  });
  const param = qs.stringify({file: pdfURL});

  mainWindow.loadURL('file://' + __dirname + '/../pdf.js/web/viewer.html');//?' + param);
  mainWindow.webContents.openDevTools();
  webContents = mainWindow.webContents;
  //https://github.com/atom/electron/blob/v0.34.3/docs/api/ipc-main-process.md#sending-messages
  //https://github.com/atom/electron/issues/3440
  //http://qiita.com/indometacin/items/018f78757c54a4c2eb5b
  ipcMain.on('retrieve', function(event, arg) {
          console.log(arg);  // prints "ping"
          console.log(path.join(__dirname, 'preload.js'));
          event.sender.send('asynchronous-reply', 'pong');
        });
  webContents.send("incoming");//http://stackoverflow.com/questions/30681639/how-to-access-browserwindow-javascript-global-from-main-process-in-electron
//  webContents.executeJavaScript("getData();");
  //https://github.com/atom/electron/blob/master/docs/api/ipc-main.md
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});

//____________________________________________________________________________________________
//____________________________________________________________________________________________
//____________________________________________________________________________________________
//____________________________________________________________________________________________
//____________________________________________________________________________________________

var ipc=require('node-ipc');

/***************************************\
 *
 * You should start both hello and world
 * then you will see them communicating.
 *
 * *************************************/

ipc.config.id = 'world';
ipc.config.retry= 1500;
ipc.config.maxConnections=1;

ipc.serveNet(
    function(){
        ipc.server.on(
            'message',
            function(data,socket){
                //webContents.executeJavaScript("getData();");
                webContents.send("incoming");
                ipc.log('got a message : '.debug, 'hi');//webContents);//.document.PDFViewerApplication);//PDFViewerApplication.pdfViewer.currentPageNumber);//data);
                ipc.server.emit(
                    socket,
                    'message',
                    data+' world!'
                );
            }
        );

        ipc.server.on(
            'socket.disconnected',
            function(data,socket){
                console.log(arguments);
            }
        );
    }
);

ipc.server.on(
    'error',
    function(err){
        ipc.log('Got an ERROR!'.warn,err);
    }
);

ipc.server.start();