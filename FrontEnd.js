const url = "https://gutendex.com/books?search=";
const fs = require('fs');
const path = require('path');


const maxFile = 10;
const directory = "./Books";

async function getData(str){
    const request = await fetch(url + str);
    const json = await request.json();

    console.log(json.results[0].title);
    let text = (json.results[0].formats["text/plain; charset=us-ascii"]);
    console.log(text);
    getText(json.results[0].title, text);
  
}
async function getText(title, str){
    const request = await fetch(str);
    const txt = await request.text();
    saveFile(title, txt);
}

async function saveFile(filename, text) {
    fs.readdir(directory, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }
        const fileCount = files.length;
        console.log(`Number of files in directory: ${fileCount}`);
        if (fileCount >= maxFile) {
            console.log(`Maximum file limit reached (${maxFile}).`);
            let oldestTime = Infinity;
            let oldestFile = null;
            files.forEach(file => {
                const filePath = path.join(directory, file);
                const stats = fs.statSync(filePath);
    
                if (stats.isFile() && stats.mtimeMs < oldestTime && file !== "FrontEnd.js") {
                    oldestTime = stats.mtimeMs;
                    oldestFile = filePath;
                }
            });

            if (oldestFile) {
                fs.unlink(oldestFile, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                    } else {
                        console.log(`Deleted oldest file: ${oldestFile}`);
                    }
                });
            }
        } else {
            console.log(`You can add more files. Current count: ${fileCount}`);
        }

        fs.writeFile(path.join(directory, filename), text, (err) => {
            if (err) {
                console.error('Error writing file:', err);
            } else {
                console.log(`File saved: ${filename}`);
            }
        });
    });
}


getData("sherlock")
