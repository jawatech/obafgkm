// var toml = require('toml');
// var mpvimgsavepath=toml.parse(fs.readFileSync('config.toml','utf8')).mpvimgsavepath; 
var mpvimgsavepath="~/Dropbox/org/gtd/img/";
function setClipboard(text) {
  // mp.commandv('run', 'powershell', 'set-clipboard', text);
  mp.utils.subprocess({ //https://github.com/klesh/dotfiles/blob/e9e5ea9d67f927857eae7e37b2d27f20e537e5ec/gui/mpv/scripts/cut.js
      args: ['powershell', '-NoProfile', '-Command', 'Set-Clipboard "'+text+'"'],
      cancellable: false
  })    
}

function formatTime(time) {
  var r = String(time);
  while (r.length < 2) {
    r = '0' + r;
  }
  return r;
}

function copyTime() {
  var time_pos = mp.get_property_number('time-pos');
  var time_seg = time_pos % 60;
  time_pos -= time_seg;
  var time_hours = Math.floor(time_pos / 3600);
  time_pos -= time_hours * 3600;
  var time_minutes = time_pos / 60;
  var time_ms = time_seg - Math.floor(time_seg);
  time_seg -= time_ms;
  var current_time =         
      formatTime(time_hours) +
      ':' +
      formatTime(time_minutes) +
      ':' +
      formatTime(time_seg) +
      '.' +
      time_ms
      .toFixed(2)
      .toString()
      .split('.')[1];
  var filename=
    mp.get_property('filename') + '#' + current_time;
  var time =
    '[[mpv:' + mp.get_property('path') + '#' + current_time + ']['+ current_time + ']]  ' + mp.get_property('sub-text');
  setClipboard(time);
  mp.osd_message('Copied to Clipboard: ' + time);
}
function pos2time(time_pos0) {
  var time_pos=time_pos0;
  var time_seg = time_pos % 60;
  time_pos -= time_seg;
  var time_hours = Math.floor(time_pos / 3600);
  time_pos -= time_hours * 3600;
  var time_minutes = time_pos / 60;
  var time_ms = time_seg - Math.floor(time_seg);
  time_seg -= time_ms;
  var current_time =         
      formatTime(time_hours) +
      ':' +
      formatTime(time_minutes) +
      ':' +
      formatTime(time_seg) +
      '.' +
      time_ms
      .toFixed(1)
      .toString()
      .split('.')[1];
  return current_time;
}
function copyTimeAndScreenshot() {
  var time_pos0 = mp.get_property_number('time-pos');
  var current_time =  pos2time(time_pos0);
  var time_pos=time_pos0.toFixed(1).toString();
  var filename=
    mp.get_property('filename').split('=')[1] + '#' + time_pos;
  var time =
    '****** ' + mp.get_property('sub-text') + ' [[mpv:' + mp.get_property('path') + '#' + time_pos + ']['+ current_time + ']]';
  try{
      mp.commandv("osd-msg",  "screenshot-to-file", mp.utils.get_user_path(imgsavepath) + filename+'.png', "video"); //'C:/Users/hercu/Downloads/mpv/' +
  }catch(e){
      mp.osd_message(e, 15);
  }
  timelink = time + '`r`n'+'[['+imgsavepath+ filename +'.png]]';
  setClipboard(timelink);
  mp.osd_message('Copied to Clipboard: ' + mp.utils.get_user_path(imgsavepath) + filename+'.png'); // timelink);
}
function copyChapters() {
  // var current_chapter = mp.get_property_number('chapter');
  var media_title = mp.get_property('media-title');
  var chapter_list = "**** " + media_title + '`r`n';
  for (var index = 0; index < mp.get_property('chapter-list/count'); index++) {
      var current_time = mp.get_property_number('chapter-list/' + index + '/time');
      try{
          chapter_list = chapter_list +  mp.get_property('chapter-list/' + index + '/title')
          + '  [[mpv:' + mp.get_property('filename').split('=')[1] + '#' 
          + current_time.toFixed(1)  + '][' 
          + pos2time(current_time) 
          + ']]`r`n';
          }catch(e){
              mp.osd_message(e, 15);
          }
          }
  setClipboard(chapter_list);
  mp.osd_message(media_title); 
}

mp.add_key_binding('Ctrl+Alt+c', 'copyTime', copyTime);
mp.add_key_binding('Ctrl+Alt+s', 'copyTimeAndScreenshot', copyTimeAndScreenshot);
mp.add_key_binding('Ctrl+Alt+f9', 'copyChapters', copyChapters);
