const { app, BrowserWindow } = require('electron')
const path = require('path')
const fs = require('fs')

const STATUS_PATH = path.join('C:', 'Users', 'edoar', 'Saved Games', 'Frontier Developments', 'Elite Dangerous', 'Status.json')

const FLAG_MAP = JSON.parse(fs.readFileSync(path.join('app', 'config', 'flag.json')));
const WINDOW_CONFIG = fs.readFileSync(path.join('app', 'config', 'window.json'));

let static_json = {};

function createWindow () {
  const win = new BrowserWindow({
    width: WINDOW_CONFIG.width,
    height: WINDOW_CONFIG.height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  })

  win.loadFile('public/index.html');
  return win
}

/**
 * Single Read of the Status Json
 * @param {Window} win 
 */
function getStatus(win) {
  const json = static_json;
  try {
    const json = readAndParseStatus(STATUS_PATH);
    static_json = json;
  } catch (err) {
    console.error(err);
  }
  sendStatusData(win, json);
}

function watchStatus(callback) {
  fs.watch(STATUS_PATH, (event, filename) => {
    const json = readAndParseStatus(STATUS_PATH);
    callback(json);
  });
  return false;
}

/**
 * Sends the data to the window
 * @param {Window} win the window to which send the data
 * @param {json} json the file to be sent
 */
function sendStatusData(win, json) {
  console.log(new Date() + ' - ' + 'Data Sent')
  win.webContents.send('ping', JSON.stringify(json));
}

/**
 * Read a status.json file
 * @param {path} filePath path to the status.json
 * @returns an enriched json object of the status.json
 */
function readAndParseStatus(filePath) {
  const data = fs.readFileSync(filePath, 'utf-8');
  
  let json = static_json;
  try {
    json = JSON.parse(data);
    static_json = json;
  } catch (err) {
    console.error(err);
  }
  const flagsArray = Number(json.Flags).toString(2).padStart(32, '0').split('').reverse();
  const flagsJson = extractFlagsData(flagsArray);
  json.flags = flagsJson;
  return json;
}

/**
 * Extracts flags data from a flag string array
 * @param {Array<string>} flagsSplit 
 * @returns 
 */
function extractFlagsData(flagsSplit) {
  const json = [];
  return flagsSplit.map((flag, index) => { return {value: flag, ...FLAG_MAP[index] }});
}

app.whenReady().then(() => {
    const win = createWindow();
    console.log('ready to roll');
    getStatus(win);
    watchStatus(json => {
      sendStatusData(win, json);
    });

    win.on('activate', () => {
      getStatus(win);
        watchStatus(json => {
          sendStatusData(win, json);
      });    
      (win);
  });
  win.on('moved', () => {
    console.log('Window has been moved');
    getStatus(win);
  });
  win.on('resized', () => {
    console.log('Window has been resized');
    getStatus(win);
  });
  win.on('close', (e, cmd) => {
    console.log('Window has been closed :(');
  })
  win.webContents.on('dom-ready', () => {
    console.log('Window has been reloaded');
    getStatus(win);
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
