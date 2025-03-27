const url = "https://gutendex.com/books?search=";
async function getData(str){
    const request = await fetch(url + str);
    const json = await request.json();

    console.log(json.results[0].title);
    let text = (json.results[0].formats["text/plain; charset=us-ascii"]);
    console.log(text);
    getText(text);
  
}
async function getText(str){
    const request = await fetch(str);
    const txt = await request.text();
    console.log(txt);
}

getData("sherlock")
