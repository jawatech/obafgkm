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
  if(getWindow().getSelection().text=='')
    result='[[pdfbmk:'+encodeURI(getPdfva().url)+'&'+encodeURI(getPdfva().pdfViewer._location.pdfOpenParams.slice(1))+']]';
  else
    result='[[pdfbmk:'+encodeURI(getPdfva().url)+'&'+encodeURI(getPdfva().pdfViewer._location.pdfOpenParams.slice(1))+']['+getWindow().getSelection()+']]';
  // console.log(result);
  copyToClipboard(result);
}

function copyBookmark2() {
  console.log('not implemented yet!!!');
  copyToClipboard('not implemented yet!!!');
}

function setHash(thehash){
  // console.log("thehash "+thehash);
  PDFViewerApplication.pdfLinkService.setHash(thehash);
//  console.log("PDFViewerApplication.pdfViewer._location.pdfOpenParams: "+PDFViewerApplication.pdfViewer._location.pdfOpenParams);
//  ipc.send("retrieve2", PDFViewerApplication);//document);
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

ipc.on("copyBookmark2", function(event, thefile, thehash){
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
    if(typeof frames[0]== "undefined"){
      pdfva=frames.window.PDFViewerApplication;
      console.log('frames:'+frames);
      console.log('frames.window:'+frames.window);
      console.log('frames.window.PDFViewerApplication:'+frames.window.PDFViewerApplication);
      console.log('window:'+window);
      console.log('window.PDFViewerApplication:'+window.PDFViewerApplication);
      console.log('frames.PDFViewerApplication:'+frames.PDFViewerApplication);
    }
    else{
      console.log('frames[0]:'+frames[0]);
      console.log('frames[0].window:'+frames[0].window);
      pdfva=frames[0].window.PDFViewerApplication;
    }
  }
  else{pdfva=PDFViewerApplication;}
  return pdfva;
}

function getWindow(){
  if(typeof frames[0]== "undefined"){
    return frames;
  }
  else return frames[0].window;
}

ipc.on("copybmks", function(event, thefile, thehash){
  var pdfva=getPdfva();
  // console.log("copybmks called on: "+thefile+", hash: "+thehash+', PDFViewerApplication: '+((typeof PDFViewerApplication== "undefined")?'undefined':'defined'));
  // console.log('PDFViewerApplication: '+getPdfOutlines(pdfva));
  copyToClipboard(getPdfOutlines(pdfva));
//  console.log('pdfViewer: '+pdfViewer);
//  setData(thefile, thehash);
});