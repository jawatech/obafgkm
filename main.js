'use strict';
const qs = require ("querystring");
const electron = require('electron');
const path = require('path');
const fs = require('fs');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
//const pdfURLHOME = "http://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";
//const pdfURLHOME = "file://C:/Users/sig/github/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";
const pdfURLHOME = "Dropbox/org/gtd/mygtd.pdf";
const host='http://127.0.0.1:8080/Dropbox';
const host2='http://127.0.0.1:6968/';
var webContents = {};
var browserWindows = {};
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
  const param = qs.stringify({file: pdfURLHOME});
  //mainWindow.loadURL('file://' + __dirname + '/../pdf.js/web/viewer.html?' + param);
  //file://C:\Users\sig\github\electron-pdfjs/../pdf.js/web/viewer.html
  mainWindow.loadURL(host+'/pdf.js/web/viewer.html?' + param);
  console.log(host+'/pdf.js/web/viewer.html?' + param);
  //mainWindow.webContents.openDevTools();
  webContents[pdfURLHOME]=mainWindow.webContents;
//  browserWindows[pdfURLHOME]=mainWindow;  //don't hide the main window
  //https://github.com/atom/electron/blob/v0.34.3/docs/api/ipc-main-process.md#sending-messages
  //https://github.com/atom/electron/issues/3440
  //http://qiita.com/indometacin/items/018f78757c54a4c2eb5b
  ipcMain.on('retrieve', function(event, arg) {
          console.log();  // prints "ping"
          console.log(path.join(__dirname, 'preload.js'));
          event.sender.send('asynchronous-reply', 'pong');
        });
  ipcMain.on('retrieve2', function(event, arg) {
          console.log(arg.pdfViewer._location);          console.log(arg.pdfViewer.linkService);          console.log(arg.url);  // prints "ping"          console.log(arg.pdfDocument.pdfInfo.fingerprint);  // prints "ping"
          event.sender.send('asynchronous-reply', 'pong');
        });
  mainWindow.webContents.send("incoming");//http://stackoverflow.com/questions/30681639/how-to-access-browserwindow-javascript-global-from-main-process-in-electron
//  webContents.executeJavaScript("getData();");
  //https://github.com/atom/electron/blob/master/docs/api/ipc-main.md
  mainWindow.on('closed', function() {
    for (var mthefile in browserWindows){
        browserWindows[mthefile].close();
        delete browserWindows[mthefile];
    };
    delete webContents[pdfURLHOME];
    mainWindow = null;
  });
});
//____________________________________________________________________________________________
//____________________________________________________________________________________________
var http = require('http');
var url = require("url");

function copybmk(res,ourl) {
  console.log("This is the copybmk page.");
  Object.keys(webContents).map(function(v) { 
    console.log(v); 
    webContents[v].send("incoming2",v);
    });
  res.writeHead(200, {"Content-Type": "text/plain"});
  res.end("This is copybmk page.");
}
 
function gotobmk(res,ourl) {
  console.log("This is the gotobmk page.");
  var thefile=ourl.query['file'];
  console.log('thefile: '+thefile);
  if(!(thefile in webContents)){
    var mainWindow = new BrowserWindow({
        width: 800,
        height: 1000,
        webPreferences: {
          nodeIntegration: false,
          webSecurity: false,
          preload: path.join(__dirname, 'preload.js')
        },
    });
    //console.log(host+'/pdf.js/web/viewer.html'+ourl.search);//?' + param);
    mainWindow.loadURL(decodeURI(host+'/pdf.js/web/viewer.html'+ourl.search));
    webContents[thefile]=mainWindow.webContents;
    browserWindows[thefile]=mainWindow;
    mainWindow.on('closed', function() {
        delete webContents[thefile];
        delete browserWindows[thefile];
    });
    mainWindow.webContents.on('did-finish-load', function() {
        mainWindow.webContents.send("incoming",thefile);//http://stackoverflow.com/questions/30681639/how-to-access-browserwindow-javascript-global-from-main-process-in-electron
    });
  }else{
    webContents[thefile].send("incoming2",'page='+ourl.query['page']+'&zoom='+ourl.query['zoom']);
  }
  for (var mthefile in browserWindows){
    browserWindows[mthefile].setAlwaysOnTop(false);
    browserWindows[mthefile].hide();
  };
  browserWindows[thefile].setAlwaysOnTop(true);
  browserWindows[thefile].show();
  Object.keys(ourl.query).map(function(v) { console.log(v+':'+ourl.query[v]); });
  Object.keys(webContents).map(function(v) { console.log(v); });
//  webContents.send("incoming",res);
  res.writeHead(200, {"Content-Type": "text/plain"});
  res.end("This is gotobmk page.");
}

function route(pathname, res, ourl) {
  var handle = {};
  handle["/copybmk"] = copybmk;
  handle["/gotobmk"] = gotobmk;
  if (typeof handle[pathname] === 'function') {
    return handle[pathname](res,ourl);
  } else {
    console.log("404 Not Found " + pathname);
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end("404 Not Found " + pathname);
  }
}

http.createServer(function (req, res) {
    var ourl = url.parse(req.url,true);
    route(ourl.pathname,res,ourl);
}).listen(6968, '127.0.0.1');