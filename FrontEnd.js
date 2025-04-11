/*
Author: James Zesiger, Jared Bradley, Connor Valley
Decription: Front end for gutenberg web api using async functions
*/

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
    // serches gutenberg api for book title
    const request = await fetch(url + str);
    //creates json object from request
    const json = await request.json();

    console.log(json.results[0].title);
    // gets link to plain text of book 
    let text = (json.results[0].formats["text/plain; charset=us-ascii"]);
    console.log(text);
    // calls function to save book to file
    await getText(json.results[0].title, text);
  
}

async function getAuthor(str) {
    // function to search by author
    try {
        // gets list of books by author
        const request = await fetch(url + str);
        // creates json object from request
        const json = await request.json();
        // checks if there are any results
        if (!json.results || json.results.length === 0) {
            console.log('No results found.');
            return;
        }

        const auth = json.results[0].authors[0].name;
        console.log("Books by " + auth + ": ");

        // Use json.results.length instead of json.count
        for (let i = 0; i < json.results.length; ++i) {
            console.log(json.results[i].title);
        }
    } catch (error) {
        console.error('Error fetching author data:', error);
    }
}


function listBooks() {
    // function to list all books in directory
    return new Promise((resolve, reject) => {
        // reads book directory files
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
    // function to get text from url and save to file
    const request = await fetch(str);
    const txt = await request.text();
    await saveFile(title, txt);
}

async function saveFile(filename, text) {
    // function to save book to file
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
                        // find the oldest file
                        oldestTime = stats.mtimeMs;
                        oldestFile = filePath;
                    }

                });

                if (oldestFile) {
                    // delete the oldest file
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
                // save file to book folder
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
    // function to print book to console
    fs.readFile(path.join(directory, title), 'utf8', async (err, data) => {
        if (err) {
            console.error('Error reading book:', err);
            return;
        }

        let i = 0;
        while (i < data.length) {
            // gets page of 1800 characters
            const text = data.slice(i, i + 1800);
            console.log(text);

            const answer = await askQuestion("Next page? (y/n): ");
            // asks user if they want to continue reading
            if (answer === 'y' || answer === 'Y') {
                // next page
                i += 1800;
            } else if(answer === 'n' || answer === 'N') {
                // stop reading
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
    // gets user input for command
    const input = await askQuestion("Enter command: ");
    if (input === "exit" || input === "quit") {
        rl.close();
        return;
    }
    if (input === "read") {
        const title = await askQuestion("Enter book title: ");
        await printBook(title);
    } else if (input === "search") {
        const search = await askQuestion("Enter book title: ");
        await getData(search);
        GetInput()
    } else if (input === "author") {
        const author = await askQuestion("Enter author name: ");
        await getAuthor(author);
        GetInput()
    } else if (input === "list") {
        await listBooks();
        GetInput();
    } else {
        console.log("Invalid command. Please try again.");
        GetInput();
    }
}


GetInput();
