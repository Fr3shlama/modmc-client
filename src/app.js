const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const extract = require('extract-zip');

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      frame: false
    }
  })
  mainWindow.loadFile(path.join(__dirname, 'views/html/main.html'))

  ipcMain.on('download', (event, downloadLink) => {
    // Define the base directory (this should be where your .minecraft folder is)
    const baseDir = path.join(app.getPath('appData'), '.minecraft').replace('.minecraft', '');
    
    // Define the directories for .modmc and downloads
    const modmcDir = path.join(baseDir, '.modmc');
    const downloadsDir = path.join(modmcDir, 'downloads');
    
    // Create the directories if they don't exist
    [modmcDir, downloadsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  
    // Get the modpack name from the download link
    const modpackName = path.basename(downloadLink, path.extname(downloadLink));
  
    // Define the directory for the specific modpack
    const modpackDir = path.join(modmcDir, 'modpacks', modpackName);
  
    // Create the directory if it doesn't exist
    if (!fs.existsSync(modpackDir)) {
      fs.mkdirSync(modpackDir, { recursive: true });
    }
  
    axios.get(downloadLink, { responseType: 'stream' })
      .then(response => {
        const writer = fs.createWriteStream(path.join(downloadsDir, path.basename(downloadLink)));
        response.data.pipe(writer);
        writer.on('finish', () => {
          console.log('Download completed');
          // Extract the modpack
          extract(path.join(downloadsDir, path.basename(downloadLink)), { dir: modpackDir }, function (err) {
            if(err) console.error('Error occurred while extracting modpack: ', err);
            else console.log('Modpack extracted successfully');
          })
        });
        writer.on('error', (error) => {
          console.error('Error occurred while downloading file: ', error);
        });
      })
      .catch(error => {
        console.error('Error occurred while initiating download: ', error);
      });
  });
}

app.on('ready', function(){
  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
