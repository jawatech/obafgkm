## PDF.js viewer in Electron app, incoporating a http server that receives commands from emacs

* Open PDF.js viewer HTML in Electron
* Disable nodeIntegration and webSecurity
* Using ipc to communicate within electron between main / renderer threads
* Using http server to receive commands issued from emacs that controls pdf.js
* Adapted from https://github.com/seanchas116/electron-pdfjs
