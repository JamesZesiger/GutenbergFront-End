const url = "https://gutendex.com/books?search=";
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

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
        console.log(`Number of books saved: ${fileCount}`);

        if (fileCount >= maxFile) {
            console.log(`Number of saved books exceeds limit: (${maxFile}).`);
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
                fs.unlink(oldestFile, (error) => {
                    if (error) {
                        console.error('Error deleting book:', error);
                    } else {
                        console.log(`Oldest book deleted: ${oldestFile}`);
                    }
                });
            }

        } else {
            console.log(`Current count: ${fileCount}`);
        }

        fs.writeFile(path.join(directory, filename), text, (error) => {
            if (error) {
                console.error('Error saving book:', error);
            } else {
                console.log(`Book saved: ${filename}`);
            }
        });
    });
}

function GetInput() {
    rl.question('Enter command: ', (input) => {
        if (input === 'exit' || input === 'quit') {
            console.log('Exiting...');
            rl.close();
            return;
        } else if (input.startsWith('search')) {
            const searchTerm = input.split(' ').slice(1).join(' ');
            getData(searchTerm);
        } else {
            console.log('Invalid command');
        }
        GetInput();
    });
}

GetInput();
