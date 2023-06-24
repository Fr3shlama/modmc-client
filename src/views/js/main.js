const { ipcRenderer } = require('electron');

function queryAPI() {
    var apiUrl = document.getElementById('apiUrl').value;
    axios.get(apiUrl)
        .then(response => {
            displayModpacks(response.data);
        })
        .catch(error => {
            console.error(error);
        });
}

function displayModpacks(modpacks) {
    var modpacksDiv = document.getElementById('modpacks');
    modpacksDiv.innerHTML = ''; 
    modpacks.forEach(modpack => {
        var modpackDiv = document.createElement('div');
        modpackDiv.classList.add('modpack');
        modpackDiv.innerHTML = `
            <h2>${modpack.name} (${modpack.version})</h2>
            <div class="modpack-content">
                <img src="${modpack.icon}" alt="Modpack Icon">
                <div class="changelog">
                    <ul>
                        ${modpack.changelog.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                <button onclick="downloadModpack('${modpack.downloadLink}')">Download</button>
            </div>
        `;
        modpacksDiv.appendChild(modpackDiv);
    });
}

function downloadModpack(downloadLink) {
    ipcRenderer.send('download', downloadLink);
}
