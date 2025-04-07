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
    await getText(json.results[0].title, text);
  
}

function listBooks() {
    return new Promise((resolve, reject) => {
        fs.readdir(directory, (err, files) => {
            if (err) {
                console.error('Error reading directory:', err);
                reject(err);
            } else {
                let count = 0;
                console.log('Books in directory:');
                console.log('-------------------');
                files.forEach(file => {
                    if (!file.startsWith('File')) {
                        console.log(file);
                        count++;
                    }
                });
                console.log('-------------------');
                console.log(`Total books: ${count}`); 
                resolve();
            }
        });
    });
}

async function getText(title, str){
    const request = await fetch(str);
    const txt = await request.text();
    await saveFile(title, txt);
}

async function saveFile(filename, text) {
    return new Promise((resolve, reject) => {
        fs.readdir(directory, (err, files) => {
            if (err) {
                console.error('Error reading directory:', err);
                return reject(err);
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
                    return reject(error);
                } else {
                    console.log(`Book saved: ${filename}`);
                    return resolve();
                }
            });
        });
    });
}
async function printBook(title){
    fs.readFile(path.join(directory, title), 'utf8', async (err, data) => {
        if (err) {
            console.error('Error reading book:', err);
            return;
        }

        let i = 0;
        while (i < data.length) {
            const text = data.slice(i, i + 1800);
            console.log(text);

            const answer = await askQuestion("Next page? (y/n): ");
            if (answer === 'y' || answer === 'Y') {
                i += 1800;
            } else if(answer === 'n' || answer === 'N') {
                console.clear();
                GetInput();
                return;
            } else {
                console.log("Invalid input. Please enter 'y' or 'n'.");
            }
        }
        GetInput();
        return;
    });
}

function askQuestion(query) {
    return new Promise(resolve => {
        rl.question(query, answer =>{
            resolve(answer);
        });
    });
}

async function GetInput() {
    const input = await askQuestion("Enter command: ");
    if (input === "exit" || input === "quit") {
        rl.close();
        return;
    }
    if (input === "read") {
        const title = await askQuestion("Enter book title: ");
        await printBook(title);
    } else if (input === "search") {
        const search = await askQuestion("Enter search term: ");
        await getData(search);
        GetInput()
    }else if (input === "list") {
        await listBooks();
        GetInput();
    } else {
        console.log("Invalid command. Please try again.");
        GetInput();
    }
}


GetInput();
