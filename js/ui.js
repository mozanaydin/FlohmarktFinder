function formatTimeInterval(occurrence){
    if(!occurrence.endTime){
        return occurrence.startTime;
    }else{
        return occurrence.startTime + "-" + occurrence.endTime;
    }
}

function getPriceBadge(occurrence){
    if(occurrence.entryType === "paid"){
        return '<span class="badge badge-paid">Paid</span>';
    }else{
        return '<span class="badge badge-free">Free Entry</span>';
    }
}

function groupTitleAndDate(market){
    let allGroupedData = {
        title: [],
        date: [],
        upcoming: []
    };
    for(let i=0;i<market.length;i++){
        allGroupedData.title.push(market[i].title);
        allGroupedData.date.push(market[i].date);
    }

    //"Set" is the way to get unique names out of the array. like distinct in sql. 
    let uniqueTitles = [...new Set(allGroupedData.title)];
    let uniqueTitleDates = [];
    let uniqueUpcomingCount = [];

    for(let i=0;i<uniqueTitles.length;i++){
        uniqueTitleDates[i] = [];
        uniqueUpcomingCount[i] = 0;
        for(let j=0;j<allGroupedData.title.length;j++){ 
            if(allGroupedData.title[j] === uniqueTitles[i]){
                uniqueTitleDates[i].push(allGroupedData.date[j]);
                uniqueUpcomingCount[i]++;
            }
        }
    }

    return {
        title: uniqueTitles,
        date: uniqueTitleDates,
        upcoming: uniqueUpcomingCount
    };
}

function createMarketCardHtml(market){
    let occurrence = [0];
    let title = market.title;
    let venue = market.venue;
    let address = market.address;
    //let imagePath = getMarketImagePath(market.title);
    let favouriteClass = isFavourite ? " market-card--favouriteactive" : "";
    let favouriteText = isFavourite ? "Saved" : "Favourite";

    return `
        <article class=""card market-card">
            <div class=""market-card-summary">
                <div class="card-media market-card-media">
                    <img class="market-card-image" src="${imagePath}" alt="${title}">
                    <span class="badge badge-date">${occurrence.date}</span>
                </div>
                <div class="card-body market-card-body">
                    <div class="market-card-meta">
                        ${getPriceBadge(occurrence)}
                        <span>${getUpcomingCountLabel(market)}</span>
                    </div>
                    <h3>${title}</h3>
                    <p class="market-card-venue>${venue}</p>
                    <p class="market-card-address">${address}</p>
                    <p class="market-card-time>${formatTimeInterval(market)}</p>
                    <div class="market-card-actions">
                        <button class="button button-secondary" type="button">View Details</button>
                        <button class="button button-secondary${favouriteClass}" type="button">${favouriteText}</button>
                    </div>
                </div>
            </div>
        </article>
        `;
}