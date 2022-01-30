// menu.js  引入模板
const { Menu } = require('electron')

// 1.設定一個模板
let template = [
  {
    label:'檔案',
    submenu:[
      {
        label:'新建檔案',
        accelerator:'ctrl+N',
        click:function(){
          console.log('new file')
        }
      },
      {
        type:'separator'
      },
      {
        label:'新建視窗',
        accelerator:(function(){
          if(process.platform =='darwin'){  //mac 基於darwin
            return 'alt+command+M'
          }else{ //win
            return 'alt+ctrl+M'
          }
        })(),
        click:function(){
          console.log('new window')
        }
      },
      {
        type:'separator'
      },
      {
        label:'自動儲存',
        accelerator:'ctrl+S',
        type:'checkbox',
        checked:true,
        click:function(){
          console.log('saved')
        }
      },
    ]
  },
  {
    label:'編輯'
  },
]

// 2. 構建選單(例項化一個選單物件) 
const menu = Menu.buildFromTemplate(template);

//3. 設定選單物件到應用中
Menu.setApplicationMenu(menu);