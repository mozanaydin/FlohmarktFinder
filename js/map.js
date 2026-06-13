// This file creates the main map and adds one marker for every market.

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

// Create the complete detail panel for one market.
function createMarketDetailHtml(market) {

    let link = market.eventLink;

    return `
        <article class="market-detail">
            <div class="market-detail-header">
                <div>
                    <p class="eyebrow">Selected market</p>
                    <h2>${market.title}</h2>
                    <p><strong>${market.venue}</strong><br>${market.address}</p>
                    <p>${formatDate(market.date)} · ${formatTimeInterval(market)}</p>
                </div>
                <div class="market-detail-actions">
                    <a class="button" href="${link}" target="_blank" rel="noopener noreferrer">More details</a>
                </div>
            </div>
        </article>
    `;
}


async function renderSelectedMarket(container, market) {

    container.innerHTML = createMarketDetailHtml(market);
}



async function loadMapPage() {
    let status = document.getElementById("map-status");
    let detailContainer = document.getElementById("map-market-detail");

    let markets = await getFlohmarkts();
    let uniqueMarkets = [];

    for(let i=0;i<markets.length;i++){
        let alreadyExists = uniqueMarkets.some(function(market){
            return market.title === markets[i].title;
        });

        if(!alreadyExists){
            uniqueMarkets.push(markets[i]);
        }
    }
    
    let map = window.L.map("market-map").setView([53.5511, 9.9937], 11);

    window.L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }
    ).addTo(map);

    for (let i = 0; i < uniqueMarkets.length; i++) {
        let market = uniqueMarkets[i];
        let latitude = market.coordinates.latitude;
        let longitude = market.coordinates.longitude;

        let marker = window.L.marker([latitude, longitude]);
        marker.addTo(map);
        marker.bindTooltip(market.title);

        marker.on("click", function () {
            renderSelectedMarket(detailContainer, market);
        });
    }

    status.textContent = uniqueMarkets.length + " markets on the map";

    console.log(markets);
    console.log(uniqueMarkets);
}

loadMapPage();