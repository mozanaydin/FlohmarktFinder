// This file creates the main map and adds one marker for every market.

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
                    <p>${formatDate(market.date)} · ${formatTimeRange(market)}</p>
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

    for(let i=0;i<markets.length;i++){
        
    }






    let map = window.L.map("market-map").setView([53.5511, 9.9937], 11);

    window.L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }
    ).addTo(map);

    for (let i = 0; i < markets.length; i++) {
        let market = markets[i];
        let latitude = market.coordinates.latitude;
        let longitude = market.coordinates.longitude;

        let marker = window.L.marker([latitude, longitude]);
        marker.addTo(map);
        marker.bindTooltip(market.title);

        marker.on("click", function () {
            renderSelectedMarket(detailContainer, market);
        });
    }

    status.textContent = markets.length + " markets on the map";
}

loadMapPage();