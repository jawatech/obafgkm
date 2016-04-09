var ipc = require("electron").ipcRenderer;
//https://discuss.atom.io/t/ipc-send-dom-object/26554
function setData(thefile){
  console.log("sent "+thefile);
  PDFViewerApplication.thefile=thefile;
  console.log("PDFViewerApplication.thefile: "+PDFViewerApplication.thefile);
//  ipc.send("retrieve2", PDFViewerApplication);//document);
}

function setHash(hash){
  console.log("hash "+hash);
  PDFViewerApplication.pdfLinkService.setHash(hash);
  console.log("PDFViewerApplication.pdfViewer._location.pdfOpenParams: "+PDFViewerApplication.pdfViewer._location.pdfOpenParams);
//  ipc.send("retrieve2", PDFViewerApplication);//document);
}

ipc.on("incoming2", function(event,hash){
  console.log("incoming2: "+hash);
  setHash(hash);
});

ipc.on("incoming", function(event, thefile){
  console.log("incoming "+thefile);
  setData(thefile);
});