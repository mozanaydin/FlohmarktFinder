async function getFlohmarktData() {
    let FlohmarktAPI = "https://api.hamburg.de/datasets/v1/mrh_veranstaltungsdaten/collections/spielstaetten_mit_veranstaltungen_6_wochen/items?f=json&limit=200&bundesland=Hamburg&kategorie=M%C3%A4rkte&unterkategorie=Flohm%C3%A4rkte";
    let response = await fetch(FlohmarktAPI);
    let data = await response.json();
    //let cardsContainer = document.getElementById("cards");

    console.log(data.features);
/*
    for(let market of data.features){
        let name = market.properties.veranstaltungstitel;
        let cardElement = document.createElement("div");
        cardElement.innerHTML = `
        <h2>${name}</h2>
        <p></p>
        `;
        cardsContainer.appendChild(cardElement);
        cardElement.className = "cardElement";
        //cardElement.latitude = ;
        //cardElement.longitude = ;
    }
        */
}

async function showFlohmarktData() {
    getFlohmarktData();
}

showFlohmarktData();