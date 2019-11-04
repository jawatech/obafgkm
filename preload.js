var ipc = require("electron").ipcRenderer;
//https://discuss.atom.io/t/ipc-send-dom-object/26554
function setData(thefile, thehash){
  function wait(condition, callback) { //https://stackoverflow.com/questions/41328534/waiting-until-a-variable-exists-with-typeof-causes-an-infinite-loop
      if ((typeof condition() !== "undefined")&&(typeof PDFViewerApplication.pdfViewer !== "undefined")&&(typeof PDFViewerApplication.pdfViewer.firstPagePromise !== "undefined")) {
        let firstPagePromise = PDFViewerApplication.pdfViewer.firstPagePromise;
          firstPagePromise.then(function () {
              setTimeout(function () {
                  callback();
              }, 1000)
          });
        
      } else {
          setTimeout(function () {
              wait(condition, callback);
          }, 1000)
      }
  }
  console.log("thefile: "+thefile);
  setTimeout(function () {wait(function(){if (typeof PDFViewerApplication!== "undefined"){return PDFViewerApplication;}else{return undefined;}}
    , function(){setHash(thehash)})}, 1000);
//  setTimeout(function(){console.log("PDFViewerApplication.thefile: "+PDFViewerApplication.thefile+', initialHash: '+PDFViewerApplication.initialHash);}, 1000)
  
//  ipc.send("retrieve2", PDFViewerApplication);//document);
}

function setHash(thehash){
  console.log("thehash "+thehash);
  PDFViewerApplication.pdfLinkService.setHash(thehash);
//  console.log("PDFViewerApplication.pdfViewer._location.pdfOpenParams: "+PDFViewerApplication.pdfViewer._location.pdfOpenParams);
//  ipc.send("retrieve2", PDFViewerApplication);//document);
}

ipc.on("incoming2", function(event,thehash){
  console.log("incoming2: "+thehash);
  setHash(thehash);
});

ipc.on("incoming", function(event, thefile, thehash){
  console.log("incoming "+thefile+", hash: "+thehash);
  setData(thefile, thehash);
});