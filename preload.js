//var ipc = ipcRenderer;//require("electron").ipcRenderer;
var ipc = require("electron").ipcRenderer;
//var PDFViewerApplication = require('pdf.js');
//

//var pdfjsLib = require('../jawatech/pdfjs2021/build/generic/build/pdf.js');
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
      }, 1000);
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
    result='[[pdfbmk:'+encodeURI(getPdfva().pdfDocumentProperties.url)+'&'+encodeURI(getPdfva().pdfViewer._location.pdfOpenParams.slice(1))+']]';
  else
    result='[[pdfbmk:'+encodeURI(getPdfva().pdfDocumentProperties.url)+'&'+encodeURI(getPdfva().pdfViewer._location.pdfOpenParams.slice(1))+']['+getWindow().getSelection()+']]';
  // console.log(result);
  copyToClipboard(result);
}

function setHash(thehash){
  // console.log("thehash "+thehash);
  PDFViewerApplication.pdfLinkService.setHash(thehash);
//  console.log("PDFViewerApplication.pdfViewer._location.pdfOpenParams: "+PDFViewerApplication.pdfViewer._location.pdfOpenParams);
//  ipc.send("retrieve2", PDFViewerApplication);//document);
}

ipc.on("incoming2", function(event,thehash){
  // console.log("incoming2: "+thehash);
  setHash(thehash);
});

ipc.on("incoming", function(event, thefile, thehash){
  // console.log("incoming "+thefile+", hash: "+thehash);
  setData(thefile, thehash);
});
ipc.on("copyBookmark", function(event, thefile, thehash){
  // console.log("copyBookmark ");
  copyBookmark();
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
function testpreload(){
    alert('testpreload')
}
function getPdfva(){
  pdfva=null;
  if(typeof PDFViewerApplication== "undefined"){
    pdfva=frames[0].window.PDFViewerApplication;}
  else{pdfva=PDFViewerApplication;}
  return pdfva;
}
function getWindow(){
  if(typeof frames[0]== "undefined"){
    return window;
  }
  else return frames[0].window;
}
ipc.on("copybmks", function(event, thefile, thehash){
//  const { PDFViewerApplication, PDFViewer } = require('../jawatech/pdfjs2021/build/generic/web/viewer.js')
  var pdfva=getPdfva();
  // console.log("copybmks called on: "+thefile+", hash: "+thehash+', PDFViewerApplication: '+((typeof PDFViewerApplication== "undefined")?'undefined':'defined'));
  // console.log('PDFViewerApplication: '+getPdfOutlines(pdfva));
  copyToClipboard(getPdfOutlines(pdfva));
//  console.log('pdfViewer: '+pdfViewer);
//  setData(thefile, thehash);
});