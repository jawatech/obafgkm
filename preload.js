var ipc = require("electron").ipcRenderer;
//https://discuss.atom.io/t/ipc-send-dom-object/26554
function getData(){
  console.log("sent");
  ipc.send("retrieve", PDFViewerApplication);//document);
}

ipc.on("incoming", function(event){
  console.log("incoming");
  getData();
});