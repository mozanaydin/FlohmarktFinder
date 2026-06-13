function formatTimeInterval(market){
    return !market.endTime ? market.startTime : market.startTime + "-" + market.endTime;
}

function formatDate(dateString){
    let date = new Date(dateString);
    let formattedDate = date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
    return formattedDate;
}

function getPriceBadge(market){
    if(market.entryType === "paid"){
        return '<span class="badge badge-paid">Paid</span>';
    }else{
        return '<span class="badge badge-free">Free Entry</span>';
    }
}

function getMarketImagePath(title){
    let imageName = "";

    if(title !== null && title !== undefined){
        imageName = String(title);
    }

    if(!imageName){
        imageName = "default-flohmarkt";
    }

    return "images/" + imageName + ".png"; 
}

function createMarketCardHtml(market){
    let title = market.title;
    let venue = market.venue;
    let address = market.address;
    let eventLink = market.eventLink;
    let date = market.date;
    //let imagePath = getMarketImagePath(market.title);

    return `
        <article class="card market-card">
            <div class="market-card-summary">
                <div class="card-media market-card-media">
                    <img class="market-card-image" src="images/flohmarkt-image.png" alt="${title}">
                    <span class="badge badge-date">${formatDate(date)}</span>
                </div>
                <div class="card-body market-card-body">
                    <div class="market-card-meta">
                        ${getPriceBadge(market)}
                    </div>
                    <h3>${title}</h3>
                    <p class="market-card-venue>${venue}</p>
                    <p class="market-card-address">${address}</p>
                    <p class="market-card-time>${formatTimeInterval(market)}</p>
                    <div class="market-card-actions">
                        <a class="view-detail" href="${eventLink}" target="_blank">
                            <button class="button button-secondary" type="button">View Details</button>
                        </a>
                    </div>
                </div>
            </div>
        </article>
    `;
}


function renderMarketCards(container, markets) {
    let cardsHtml = "";

    for(let i=0;i<markets.length;i++){
        cardsHtml = cardsHtml + createMarketCardHtml(markets[i]);
    }

    container.innerHTML = cardsHtml;
}

async function showMarketCards(){
    let cardDiv = document.getElementById("market-list");
    let markets = await getFlohmarkts();
    let searchBox = document.getElementById("search-filter");
    searchBox.addEventListener("input", function() {
        let searchText = searchBox.value.toLowerCase();

        let filteredMarkets = markets.filter(function(market) {
            return market.title.toLowerCase().includes(searchText);
        });

        renderMarketCards(cardDiv, filteredMarkets);
    });

    renderMarketCards(cardDiv, markets);
}

showMarketCards();