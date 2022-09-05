'use strict';
const electron = require('electron');
const qs = require ("querystring");
const fspath = require('path');
//console.log(fspath.resolve(require('electron')));
// console.log(require.resolve('electron'));
const fs = require('fs');
const prompt = require('electron-prompt');//https://www.npmjs.com/package/electron-prompt
// where you import your packages
const mpvAPI = require('node-mpv');
// where you want to initialise the API
var mpv = new mpvAPI();
//const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
//const pdfURLHOME = "http://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";
//const pdfURLHOME = "file://C:/Users/sig/github/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";
const pdfURLHOME = "Dropbox/org/gtd/mygtd.pdf";//\Dropbox\misc\Harrison’s Principles of Internal Medicine, 20th Edition.pdf
//const pdfURLHOME = "Dropbox/misc/Harrison’s Principles of Internal Medicine, 20th Edition.pdf";//\Dropbox\misc\Harrison’s Principles of Internal Medicine, 20th Edition.pdf
const host='http://127.0.0.1:8880/Dropbox/';
// const host2='http://127.0.0.1:6968/';
//const viewerurl='pdf.js/build/generic/web/viewer.html';
const viewerurl='jawatech/pdfjs2021/build/generic/web/viewer.html';
const viewerurl1='electron-pdfjs3/my-mind/index.html';
var webContents = {};
var browserWindows = {};
var mainWindow0 = null;
const ipcMain = require('electron').ipcMain;
const { app, Menu } = require('electron')
const isMac = process.platform === 'darwin'
//require('./menu');
app.on('ready', function() {
  mainWindow0 = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: false,
      webSecurity: true,
	// Load `electron-notification-shim` in rendering view, by requiring it in your preloaded script. 
      //the path of preload script has to be "absolute path".
      //https://github.com/atom/electron/blob/v0.34.3/docs/api/browser-window.md#new-browserwindowoptions
      preload: fspath.join(__dirname, 'preload.js')
    },
  });
  
  const param = qs.stringify({file: pdfURLHOME});
  //console.log(host+'jawatech/pdfjs2021/build/generic/web/viewer.html?' + param);
  //mainWindow.loadURL('file://' + __dirname + '/../pdf.js/web/viewer.html?' + param);
  //file://C:\Users\sig\github\electron-pdfjs/../pdf.js/web/viewer.html
  //mainWindow.loadURL(host+'jawatech/pdfjs2021/build/generic/web/viewer.html?' + param);
  mainWindow0.loadURL(host+'?frame');
  //console.log(host+'jawatech/pdfjs2021/build/generic/web/viewer.html?' + param);
  //mainWindow.webContents.openDevTools();
  webContents[pdfURLHOME]=mainWindow0.webContents;
  mainWindow0['thefile']=pdfURLHOME;
//  browserWindows[pdfURLHOME]=mainWindow;  //don't hide the main window
  //https://github.com/atom/electron/blob/v0.34.3/docs/api/ipc-main-process.md#sending-messages
  //https://github.com/atom/electron/issues/3440
  //http://qiita.com/indometacin/items/018f78757c54a4c2eb5b
  ipcMain.on('retrieve', function(event, arg) {
          // console.log();  // prints "ping"
          // console.log(fspath.join(__dirname, 'preload.js'));
          event.sender.send('asynchronous-reply', 'pong');
        });
  ipcMain.on('retrieve2', function(event, arg) {
          // console.log(arg.pdfViewer._location);          console.log(arg.pdfViewer.linkService);          console.log(arg.url);  // prints "ping"          console.log(arg.pdfDocument.pdfInfo.fingerprint);  // prints "ping"
          event.sender.send('asynchronous-reply', 'pong');
        });
//20220224  // mainWindow0.webContents.send("incoming",'page=2');//http://stackoverflow.com/questions/30681639/how-to-access-browserwindow-javascript-global-from-main-process-in-electron
//  webContents.executeJavaScript("getData();");
  //https://github.com/atom/electron/blob/master/docs/api/ipc-main.md
  mainWindow0.on('closed', function() {
    for (var mthefile in browserWindows){
        browserWindows[mthefile].close();
        delete browserWindows[mthefile];
    };
    delete webContents[pdfURLHOME];
    mainWindow0 = null;
  });
});
const template = [
  // { role: 'appMenu' }
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startSpeaking' },
            { role: 'stopSpeaking' }
          ]
        }
      ] : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ])
    ]
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
        { role: 'close' }
      ])
    ]
  },
  {
    label: 'PDF',
    submenu: [
      {
        label: 'Copy link',
        accelerator:'ctrl+F9',
        click:function(){
          var thefile=BrowserWindow.getFocusedWindow()['thefile'];
          // console.log('copy current PDF view as bookmark:'+thefile);
          BrowserWindow.getFocusedWindow().send("copyBookmark",thefile,'nullhash');
          // Object.keys(webContents).map(function(v) { 
          //   console.log("copyBookmark: v="+v+', thefile: '+thefile); 
          //   webContents[v].send("copyBookmark",v,'nullhash');
          //   });
        }
      }
    ]
  },
  {
    label: 'Audio/Video',
    submenu: [
      {
        label: 'open',
        accelerator:'ctrl+o',
        click:function(){
          prompt({
            title: 'Input audio/vedio stream url',
            label: 'URL:',
            value: 'https://www.youtube.com/watch?v=MpsVE60iRLM',
            inputAttrs: {
                type: 'url'
            },
            type: 'input'
          })
          .then((r) => {
              if(r === null) {
                  console.log('user cancelled');
              } else {
                  console.log('result=', r);
              }
              mpv.load(r);
          })
          .catch(console.error);
          // console.log('copy current PDF view as bookmark:'+thefile);
          // Object.keys(webContents).map(function(v) { 
          //   console.log("copyBookmark: v="+v+', thefile: '+thefile); 
          //   webContents[v].send("copyBookmark",v,'nullhash');
          //   });
        }
      }
    ]
  },
  {
    label: 'MindMap',
    submenu: [
      {
        label: 'New map',
        // accelerator:'ctrl+F9',
        click:function(){
          var mainWindow = new BrowserWindow({
            width: 1400,
            height: 2200,
            webPreferences: {
              nodeIntegration: false,
              webSecurity: true,
              preload: fspath.join(__dirname, 'preload.js')
            },
          });
          mainWindow.loadURL(decodeURI(host+viewerurl1));
        }
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://electronjs.org')
        }
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

//____________________________________________________________________________________________
//____________________________________________________________________________________________
var http = require('http');
var url = require("url");

function copybmk(res,ourl,req) {
  // console.log("This is the copybmk page.");
  Object.keys(webContents).map(function(v) { 
    // console.log(v); 
    webContents[v].send("incoming2",v);
    });
  //res.writeHead(200, {"Content-Type": "text/plain","Access-Control-Allow-Origin": req.headers.origin});
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
  res.end("This is copybmk page.");
}

function copybmks(res,ourl,req) {
  // console.log("This is the copybmks page. ourl="+ourl);
  Object.keys(webContents).map(function(v) { 
    // console.log("copybmks: v="+v); 
    webContents[v].send("copybmks",v,'nullhash');
    });
  res.writeHead(200, {"Content-Type": "text/plain","Access-Control-Allow-Origin": req.headers.origin});
//  res.writeHead(200, {"Content-Type": "text/plain"});
  res.end("This is copybmks page.");
}
 
function drawmap(res,ourl,req, body) {
  var mainWindow = new BrowserWindow({
    width: 1400,
    height: 2200,
    webPreferences: {
      nodeIntegration: false,
      webSecurity: false, //true,
      preload: fspath.join(__dirname, 'preload.js')
    },
  });
  mainWindow.loadURL(decodeURI(host+viewerurl1));
  mainWindow.on('closed', function() {
      delete mainWindow.webContents;
      // delete mainWindow;
  });
  mainWindow.webContents.on('did-finish-load', function() {
    mainWindow.webContents.send("drawmap",body);
  });//.finally(function() {webContents[thefile].send("incoming2",'page='+ourl.query['page']+'&zoom='+ourl.query['zoom']);});

  // res.writeHead(200, {"Content-Type": "text/plain","Access-Control-Allow-Origin": req.headers.origin});
  res.writeHead(200, {"Content-Type": "text/plain"});
  res.end("This is drawmap page.");
}
 
function gotobmk(res,ourl,req) {
  // console.log("This is the gotobmk page.");
  var thefile=ourl.query['file'];
  // console.log('thefile: '+thefile);
  if(!(thefile in webContents)){
    var mainWindow = new BrowserWindow({
        width: 1400,
        height: 2200,
        webPreferences: {
          contextIsolation: false,
          nodeIntegration: false,
          webSecurity: true,
          preload: fspath.join(__dirname, 'preload.js')
        },
    });
    mainWindow['thefile']=thefile;
    // console.log(host+viewerurl+'=='+ourl.search+'=='+ourl.hash);//?' + param);
    if(ourl.search.startsWith('?file=/'))
        mainWindow.loadURL(decodeURI(host+viewerurl+ourl.search));
    else        
        mainWindow.loadURL(decodeURI(host+viewerurl+'?file=/'+ourl.search.substring(6)));
    webContents[thefile]=mainWindow.webContents;
    browserWindows[thefile]=mainWindow;
    mainWindow.on('closed', function() {
        delete webContents[thefile];
        delete browserWindows[thefile];
    });
    mainWindow.webContents.on('did-finish-load', function() {
        if(typeof ourl.query['page'] !== 'undefined'){
            // console.log("typeof ourl.query['page'] !== 'undefined'");
            mainWindow.webContents.send("incoming",thefile,'page='+ourl.query['page']+'&zoom='+ourl.query['zoom']);//
        }else if(ourl.query['nameddest']!=''){
            // console.log("ourl.query['nameddest'] : "+ourl.query['nameddest']);
            mainWindow.webContents.send("incoming",thefile,ourl.query['nameddest']);//            
        }
//        mainWindow.webContents.send("incoming2",'page='+ourl.query['page']+'&zoom='+ourl.query['zoom']);
//        mainWindow.webContents.send('pagechange');
    });//.finally(function() {webContents[thefile].send("incoming2",'page='+ourl.query['page']+'&zoom='+ourl.query['zoom']);});
  }else{
        if(typeof ourl.query['page'] !== 'undefined'){
            // console.log("typeof ourl.query['page'] !== 'undefined'");
            webContents[thefile].send("incoming2",'page='+ourl.query['page']+'&zoom='+ourl.query['zoom']);
        }else if(ourl.query['explicitDest']　!== 'undefined'){
            webContents[thefile].send("incoming2",ourl.query['explicitDest']);
        }else if(ourl.query['nameddest']　!== 'undefined'){
            webContents[thefile].send("incoming2",ourl.query['nameddest']);
        }
  }
  // Object.keys(ourl.query).map(function(v) { console.log(v+':'+ourl.query[v]); });
  // Object.keys(webContents).map(function(v) { console.log(v); });
//  webContents.send("incoming",res);
  res.writeHead(200, {"Content-Type": "text/plain"});
  res.end("This is gotobmk page.");
}

function gotompv(res,ourl,req) {
  var thefile=ourl.query['file'];
  var thestart=ourl.query['start'];
  console.log('thefile: '+thefile);
  console.log('thestart: '+thestart);
  console.log('isRunning : '+mpv.isRunning());
    // await mpv.start();
    // await mpv.load('ytdl://www.youtube.com/watch?v=MpsVE60iRLM');
  if(mpv.isRunning()){
    mpv.getProperty('filename')
    .then((property) => {
        console.log('filename ' + property);
    }).catch((error)=>{
      console.log(error);
      console.log("Maybe the mpv player could not be started; Maybe the video file does not exist or couldn't be loaded");
      mpv.load('https://www.youtube.com/watch?v='+thefile);
    })
  }else{
    mpv = new mpvAPI();
    mpv.start(['--script=~/Dropbox/electron-pdfjs3/copyTime.js'])
    mpv.load('https://www.youtube.com/watch?v='+thefile);
  }
  mpv.goToPosition(parseFloat(thestart));
  res.writeHead(200, {"Content-Type": "text/plain"});
  res.end("This is gotompv page.");
}

function route(pathname, res, ourl, req) {
  var handle = {};
  //copyXXX 的動作理論上由 ui 直接操作比較直觀，未來應該不會在此實作
  handle["/copybmk"] = copybmk;
  handle["/copybmks"] = copybmks;
  // gotoXXX 的動作在此實作相當合理，未來會支援更多種類
  handle["/gotobmk"] = gotobmk;
  handle["/gotompv"] = gotompv;

  if (typeof handle[pathname] === 'function') {
    return handle[pathname](res,ourl, req);
  } else {
    // console.log("404 Not Found " + pathname);
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end("404 Not Found " + pathname);
  }
}

function route2(pathname, res, ourl, req, body) {
  var handle = {};
  handle["/drawmap"] = drawmap;
  if (typeof handle[pathname] === 'function') {
    return handle[pathname](res,ourl, req, body);
  } else {
    // console.log("404 Not Found " + pathname);
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end("404 Not Found " + pathname);
  }
}

http.createServer(function (request, response) {
  if (request.method == 'POST') { //https://stackoverflow.com/questions/12006417/node-js-server-that-accepts-post-requests
    var body = ''
    request.on('data', function(data) {
      body += data
      // console.log('Partial body: ' + body)
    })
    request.on('end', function() {
      console.log('Body: ' + JSON.stringify(JSON.parse(body)))
      var ourl = url.parse(request.url,true);
      route2(ourl.pathname,response,ourl,request,body)
      // response.writeHead(200, {'Content-Type': 'text/html'}) //, "Access-Control-Allow-Origin": request.headers.origin})
      // response.end('post received')
    })
  } else {
    console.log('request.url: ' + request.url);
    
    var ourl = url.parse(request.url,true);
    route(ourl.pathname,response,ourl,request);
  }
}).listen(6968, '127.0.0.1');
// console.log();
// console.log("### Starting local server");

var WebServer = require("../jawatech/pdfjs2021/test/webserver.js").WebServer;
var server = new WebServer();
server.port = 8880;
server.root = "../..";
//server.root = "../../../..";
server.start();
mpv.start(['--script=~/Dropbox/electron-pdfjs3/copyTime.js'])
// .then(() => {
//     return mpv.load('https://www.youtube.com/watch?v=MpsVE60iRLM');
// })
// .then(() => {
//     return mpv.getDuration();
// })
// .then((duration) => {
//     console.log(duration);
//     // return mpv.getProperty('someProperty');
// })
// // .then((property) => {
// //     console.log(property);
// // })
// // catches all possible errors from above
.catch((error) => {
    // Maybe the mpv player could not be started
    // Maybe the video file does not exist or couldn't be loaded
    // Maybe someProperty is not a valid property
    console.log(error);
})
// var someAsyncFunction = asnyc () => {
//   try{
//     await mpv.start();
//     await mpv.load('ytdl://www.youtube.com/watch?v=MpsVE60iRLM');
//     console.log(await mpv.getDuration());
//     console.log(await mpv.getProperty('someProperty'));
//   }
//   catch (error) {
//     // Maybe the mpv player could not be started
//     // Maybe the video file does not exist or couldn't be loaded
//     // Maybe someProperty is not a valid property
//     console.log(error);
//   }
// }