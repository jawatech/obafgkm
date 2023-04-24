//var ipc = ipcRenderer;//require("electron").ipcRenderer;
var ipc = require("electron").ipcRenderer;
// import { repo } from "./my-mind/src/command/command.ts";
// var repo=require('./my-mind/my-mind.js').repo;
// var repo=require('./my-mind/src/command/command.ts').repo;
//var PDFViewerApplication = require('pdf.js');
//

//https://discuss.atom.io/t/ipc-send-dom-object/26554
function setData(thefile, thehash){
  function wait(condition, callback) { //https://stackoverflow.com/questions/41328534/waiting-until-a-variable-exists-with-typeof-causes-an-infinite-loop
      if ((typeof condition() !== "undefined")){//&&(typeof PDFViewerApplication.pdfViewer !== "undefined")&&(typeof PDFViewerApplication.pdfViewer.firstPagePromise !== "undefined")) {
          callback();
          return;
      }
      alert('setTimeout');
      setTimeout(function () {
          wait(condition, callback);
      }, 100000);
  }
  // console.log("thefile: "+thefile);
  setTimeout(function () {wait(
        getPdfva
    , function(){
        getPdfva().initialBookmark = thehash;
        })}, 1000);
}

function copyToClipboard(text) {//https://komsciguy.com/js/a-better-way-to-copy-text-to-clipboard-in-javascript/
  const listener = function(ev) {
    ev.preventDefault();
    ev.clipboardData.setData('text/plain', text);
  };
  document.addEventListener('copy', listener);
  document.execCommand('copy');
  document.removeEventListener('copy', listener);
}

function copyBookmark() {
  if(window.getSelection().toString()=='')
    result='[[pdfbmk:'+encodeURI(getPdfva().url)+'&'+encodeURI(getPdfva().pdfViewer._location.pdfOpenParams.slice(1))+']]';
  else
    result='[[pdfbmk:'+encodeURI(getPdfva().url)+'&'+encodeURI(getPdfva().pdfViewer._location.pdfOpenParams.slice(1))+']['+window.getSelection().toString()+']]';
  // console.log(result);
  copyToClipboard(result);
}

function copyBookmark2() {
  var seltext=getFrame0().window.getSelection().toString();
  if(seltext=='')
    result='[[epubbmk:'+(getWindow().document.location.search.substring(10))+encodeURI(getWindow().document.location.hash)+']]';
  else
    result='[[epubbmk:'+(getWindow().document.location.search.substring(10))+encodeURI(getWindow().document.location.hash)+']['+seltext+']]';
  // console.log(result);
  copyToClipboard(result);
}

function setHash(thehash){
  // console.log("thehash "+thehash);
  PDFViewerApplication.pdfLinkService.setHash(thehash);
//  console.log("PDFViewerApplication.pdfViewer._location.pdfOpenParams: "+PDFViewerApplication.pdfViewer._location.pdfOpenParams);
//  ipc.send("retrieve2", PDFViewerApplication);//document);
}

function setHashEpub(thehash){
  var thewindow=  getWindow();
  if(thewindow!=null)
    thewindow.reader.book.rendition.display(thehash);
}

function visit(node,parent){
  parent["text"]=node[1]["raw-value"];
  if(node.length>2){
    parent["children"]=[];
    for (let index = 2; index < node.length; index++) {
      var child={};
      parent["children"].push(child);
      const element = node[index];
      visit(element,child);
    }
  }
}

function drawmap(body){
  var themap=JSON.parse(body)
  // console.log(themap[2])
  var root={"root":{"layout": "graph-right"}}
  // storages[3].loadDone(JSON.parse('{ "root": { "text": "My Mind Map2", "layout": "graph-right"  } }'));
  visit(themap[2],root["root"])
  console.log(root)
  storages[3].loadDone(root);
}

ipc.on("incoming2", function(event,thehash){
  // console.log("incoming2: "+thehash);
  setHash(thehash);
});

ipc.on("incoming3", function(event,thehash){
  // console.log("incoming2: "+thehash);
  setHashEpub(thehash);
});

ipc.on("drawmap", function(event,body){
  // console.log("incoming2: "+thehash);
  drawmap(body);
});

ipc.on("incoming", function(event, thefile, thehash){
  // console.log("incoming "+thefile+", hash: "+thehash);
  setData(thefile, thehash);
});

ipc.on("copyBookmark", function(event, thefile, thehash){
  // console.log("copyBookmark ");
  copyBookmark();
});

ipc.on("copybmks", function(event, thefile, thehash){
  var pdfva=getPdfva();
  // console.log("copybmks called on: "+thefile+", hash: "+thehash+', PDFViewerApplication: '+((typeof PDFViewerApplication== "undefined")?'undefined':'defined'));
  // console.log('PDFViewerApplication: '+getPdfOutlines(pdfva));
  copyToClipboard(getPdfOutlines(pdfva));
//  console.log('pdfViewer: '+pdfViewer);
//  setData(thefile, thehash);
});

ipc.on("copybmks2", function(event){
  // console.log("copybmks2 called on: "+getWindow().document.location.search+", hash: "+getWindow().document.location.hash+', getWindow().reader.book.navigation.toc: '+((typeof getWindow().reader.book.navigation.toc)));
  var result="* outline\n";
  var fn=getWindow().document.location.search.substring(10);
  function traversal(node,level){
    result=result+('*'.repeat(level))+' [[epubbmk:'+fn+'#'+node.href+']['+node.label.trim()+']]\n';
    node.subitems.forEach(function(chapter) {
      traversal(chapter,level+1);
    });
  }
  getWindow().reader.book.navigation.toc.forEach(function(chapter) {
    traversal(chapter,2);
  });
  copyToClipboard(result);
  // console.log(result);
});

ipc.on("copyBookmark2", function(event){
  // console.log("copyBookmark2 ");
  copyBookmark2();
});

function getPdfOutlines(pdfva){
    var result="* outline\n";
     /**
     * Use recursive method to traverse the first orderDOMtree
     * @param node root node
     */
    function traversal(node,level){
      //YesnodeTreatment
      //result=result+','+('*'.repeat(level))+' '+node.tagName+((node.tagName=='DIV')?'('+node.className+')':'')+':'+node.children.length+"\n";
      if(node.tagName=='A'){
        result=result+('*'.repeat(1+level/2))+' '+node.text+"\n";
        const url = new URL(node.href);
        var path = url.search.split('&')[0].split('=')[1];
        result+='[[pdfbmk:'+path+'&';
        result+=url.hash.substring(1)+']['+node.text+"]]\n";
      }
      var i = 0, children = node.children,item;
      for(; i < children.length ; i++){
        item = children[i];
        if(item.nodeType === 1){
          //Recursive traversal sub node
          traversal(item,level+1);
        }
      }
    }
    traversal(pdfva.pdfOutlineViewer.container,0);
    var OutlinesText=result;
    return OutlinesText;
}

function getPdfva(){
  var pdfva=null;
  if(typeof PDFViewerApplication== "undefined"){
    console.log('frames:'+frames);
    if(typeof frames[0]== "undefined")
      pdfva=frames.window.PDFViewerApplication;
    else
      pdfva=frames[0].window.PDFViewerApplication;
  }
  else
    pdfva=PDFViewerApplication;
  return pdfva;
}

function getWindow(){
  console.log('typeof frames[0]: '+typeof frames[0]+', window.reader: '+typeof window.reader+', window.PDFViewerApplication: '+typeof window.PDFViewerApplication+', window.location: '+window.location);
  if ('undefined'==typeof frames[0])// first time access after page load; window object already valid
    return null;
  if(typeof frames[0].frames[0]== "undefined"){
    return window;
  }
  else return frames[0].window;
  //frames[0].reader.book
  //
}

function getFrame0(){
  if(frames[0].name== "pdf"){
    return frames[0].frames[0];
  }
  else return frames[0];
  //frames[0].reader.book
  //
}

window.addEventListener('load', (event) => { //https://github.com/futurepress/epub.js/wiki/Updating-to-v0.3-from-v0.2#displaying-content
  // console.log('load\n');
  var thewindow=  getWindow();
  if(thewindow!=null && thewindow.reader!=null)
    console.log('thewindow.reader.book.rendition: '+typeof thewindow.reader.book.rendition+';'+thewindow.reader.book);
  else if(thewindow==null && window.reader!=null)
    // console.log('window.reader.book.rendition: '+typeof window.reader.book.rendition+';'+window.reader.book);
    window.reader.book.rendition.display(window.location.hash.substring(1));
});

document.addEventListener("webviewerloaded", function() {//https://github.com/mozilla/pdf.js/issues/9527
  PDFViewerApplication.initializedPromise.then(function() {
    PDFViewerApplication.eventBus.on("documentloaded", function(event) {
      // console.log("The document has now been loaded");
      const queryString=window.location.search;
      const thehash=queryString.slice(queryString.indexOf('&') + 1);
      // console.log('window.location: '+window.location+', window.location.search: '+thehash);
      if(thehash!='')
        PDFViewerApplication.pdfLinkService.setHash(thehash);
});
  });
});

// document.addEventListener('readystatechange', (event) => {
//   console.log(`readystate: ${document.readyState}\n`);
// });

// document.addEventListener('DOMContentLoaded', (event) => {
//   console.log(`DOMContentLoaded\n`);
// });

