let searchInput = document.getElementById("search-filter");
let exactDateInput = document.getElementById("exact-date-filter");
let districtSelect = document.getElementById("district-filter");
let freeEntryCheckbox = document.getElementById("free-entry-filter");
let filterChips = document.querySelectorAll(".filter-chip");

let activeDateFilter = "All";
let allMarkets = [];

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
                    <h3 class="market-card-title">${title}</h3>
                    <p class="market-card-venue">${venue}</p>
                    <p class="market-card-address">${address}</p>
                    <p class="market-card-time">${formatTimeInterval(market)}</p>
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

function renderMarketCards(markets) {
    let cardsHtml = "";
    let container = document.getElementById("market-list");

    for(let i=0;i<markets.length;i++){
        cardsHtml = cardsHtml + createMarketCardHtml(markets[i]);
    }

    container.innerHTML = cardsHtml;
}

function matchesDateRange(marketDateString, filterType) {
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    let marketDate = new Date(marketDateString);
    marketDate.setHours(0, 0, 0, 0);

    if (filterType === "All") {
        return true;
    }

    if (filterType === "Today") {
        return marketDate.getTime() === today.getTime();
    }

    if (filterType === "This Week") {
        let endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + 7);

        return marketDate >= today && marketDate <= endOfWeek;
    }

    if (filterType === "Weekend") {
        let day = marketDate.getDay();

        return day === 6 || day === 0;
    }

    if (filterType === "Next Week") {
        let startNextWeek = new Date(today);
        startNextWeek.setDate(today.getDate() + 7);

        let endNextWeek = new Date(today);
        endNextWeek.setDate(today.getDate() + 14);

        return marketDate >= startNextWeek && marketDate <= endNextWeek;
    }

    if (filterType === "Next 30 Days") {
        let next30Days = new Date(today);
        next30Days.setDate(today.getDate() + 30);

        return marketDate >= today && marketDate <= next30Days;
    }

    return true;
}

function applyFilters(){
    let searchText = searchInput.value.toLowerCase();
    let exactDate = exactDateInput.value;
    let selectedDistrict = districtSelect.value;
    let freeOnly = freeEntryCheckbox.checked;
    let filteredMarkets = allMarkets.filter(function(market) {
        let title = market.title ? market.title.toLowerCase() : "";
        let venue = market.venue ? market.venue.toLowerCase() : "";
        let address = market.address ? market.address.toLowerCase() : "";
        let matchesSearch = title.includes(searchText) || venue.includes(searchText) || address.includes(searchText);
        let matchesExactDate = exactDate === "" || market.date === exactDate;
        let matchesDistrict = selectedDistrict === "all" || market.district === selectedDistrict;
        let matchesFreeEntry = !freeOnly || market.entryType === "FREE";
        let matchesDateChip = exactDate !== "" || matchesDateRange(market.date, activeDateFilter);
        return (matchesSearch && matchesExactDate && matchesDistrict && matchesFreeEntry && matchesDateChip);
    });
    renderMarketCards(filteredMarkets);
}

async function initBrowsePage(){
    allMarkets = await getFlohmarkts();
    renderMarketCards(allMarkets);

    searchInput.addEventListener("input", applyFilters);
    exactDateInput.addEventListener("change", applyFilters);
    districtSelect.addEventListener("change", applyFilters);
    freeEntryCheckbox.addEventListener("change", applyFilters);

    filterChips.forEach(function(chip) {
        chip.addEventListener("click", function() {
            filterChips.forEach(function(button) {
                button.classList.remove("filter-chip-active");
            });

            chip.classList.add("filter-chip-active");
            activeDateFilter = chip.textContent;
            exactDateInput.value= "";
            applyFilters();
        });
    });
}

/*
async function showMarketCards(){
    let cardDiv = document.getElementById("market-list");
    let markets = await getFlohmarkts();
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

*/

initBrowsePage();