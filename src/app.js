const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');
const fs = require('fs');

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

  // When receiving the 'download' message, download the file
  ipcMain.on('download', (event, downloadLink) => {
      axios.get(downloadLink, { responseType: 'stream' })
          .then(response => {
              const writer = fs.createWriteStream(path.join(app.getPath('downloads'), path.basename(downloadLink)));
              response.data.pipe(writer);
              writer.on('finish', () => {
                  console.log('Download completed');
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
