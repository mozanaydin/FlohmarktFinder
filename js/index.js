// This file controls the Browse page and all of its filters.

function parseDate(value) {
    return new Date(value + "T00:00:00");
}

function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, numberOfDays) {
    let newDate = new Date(date);
    newDate.setDate(newDate.getDate() + numberOfDays);
    return newDate;
}

function getMonday(date) {
    let dayNumber = date.getDay();

    if (dayNumber === 0) {
        return addDays(date, -6);
    }

    return addDays(date, 1 - dayNumber);
}

function isBetween(date, startDate, endDate) {
    return date >= startDate && date <= endDate;
}

// Check one date against one of the quick date buttons.
function matchesQuickDate(dateValue, dateFilter, referenceDate) {
    if (!dateValue || !dateFilter || dateFilter === "all") {
        return true;
    }

    let marketDate = parseDate(dateValue);
    let today = startOfDay(referenceDate);
    let monday = getMonday(today);

    if (dateFilter === "today") {
        return marketDate.getTime() === today.getTime();
    }

    if (dateFilter === "this-week") {
        return isBetween(marketDate, monday, addDays(monday, 6));
    }

    if (dateFilter === "weekend") {
        return isBetween(
            marketDate,
            addDays(monday, 5),
            addDays(monday, 6)
        );
    }

    if (dateFilter === "next-week") {
        return isBetween(
            marketDate,
            addDays(monday, 7),
            addDays(monday, 13)
        );
    }

    if (dateFilter === "next-30-days") {
        return isBetween(marketDate, today, addDays(today, 30));
    }

    return true;
}

// Find a district by checking the title, venue and address.
function getDistrict(market) {
    let marketText = normalizeText(
        market.title + " " + market.venue + " " + market.address
    );

    for (let i = 0; i < DISTRICT_RULES.length; i++) {
        let districtName = DISTRICT_RULES[i][0];
        let keywords = DISTRICT_RULES[i][1];

        for (let j = 0; j < keywords.length; j++) {
            if (marketText.includes(normalizeText(keywords[j]))) {
                return districtName;
            }
        }
    }

    return "Other Hamburg";
}

// Return only markets and dates which match all selected filters.
function filterMarkets(markets, filters, referenceDate) {
    if (!filters) {
        filters = {};
    }

    if (!referenceDate) {
        referenceDate = new Date();
    }

    let searchText = normalizeText(filters.search).trim();
    let selectedDistrict = filters.district || "all";
    let filteredMarkets = [];

    for (let i = 0; i < markets.length; i++) {
        let market = markets[i];
        let marketText = normalizeText(
        market.title + " " + market.venue + " " + market.address
        );

        if (searchText && !marketText.includes(searchText)) {
            continue;
        }

        if (
            selectedDistrict !== "all" &&
            getDistrict(market) !== selectedDistrict
        ) {
            continue;
        }

        let dateMatches;

        if (filters.exactDate) {
            dateMatches = market.date === filters.exactDate;
        } else {
            dateMatches = matchesQuickDate(
            market.date,
            filters.dateFilter,
            referenceDate
            );
        }

        const freeEntryMatches = !filters.freeOnly || market.entryType === "free";

        if (!dateMatches || !freeEntryMatches) {
            continue;
        }

        filteredMarkets.push(market);
    }

    return filteredMarkets;
}

// Set the earliest and latest possible values for the date input.
function setDateInputRange(input, markets) {
    let dates = [];

    for (let i = 0; i < markets.length; i++) {
        for (let j = 0; j < markets[i].upcomingDates.length; j++) {
            let date = markets[i].upcomingDates[j].date;

        if (date) {
            dates.push(date);
        }
        }
    }

    dates.sort();

    if (dates.length > 0) {
        input.min = dates[0];
        input.max = dates[dates.length - 1];
    }
}

// Load the data and connect all controls on the Browse page.
async function loadBrowsePage() {
    let events = await window.FlohmarktApi.fetchHamburgFlohmarkts();
    let markets = window.FlohmarktApi.prepareMarketEvents(events);

    let marketList = document.querySelector("#market-list");
    let resultCount = document.querySelector("#market-result-count");
    let status = document.querySelector("#browse-status");
    let emptyState = document.querySelector("#browse-empty-state");
    let searchInput = document.querySelector("#search-filter");
    let exactDateInput = document.querySelector("#exact-date-filter");
    let districtSelect = document.querySelector("#district-filter");
    let freeEntryInput = document.querySelector("#free-entry-filter");
    let favouriteInput = document.querySelector("#favourite-filter");
    let dateButtons = document.querySelectorAll("[data-date-filter]");

    let state = {
        search: "",
        exactDate: "",
        district: "all",
        freeOnly: false,
        favouriteOnly: false,
        dateFilter: "all",
    };

    setDateInputRange(exactDateInput, markets);

  // Draw the cards again whenever a filter changes.
    function render() {
        const favouriteIds = window.FlohmarktStorage.getFavouriteIds();
        const dateFilteredMarkets = filterMarkets(markets, state);
        const finalMarkets = [];

        for (let i = 0; i < dateFilteredMarkets.length; i++) {
            if (!state.favouriteOnly || favouriteIds.includes(dateFilteredMarkets[i].id)) {
                finalMarkets.push(dateFilteredMarkets[i]);
            }
        }

        window.FlohmarktUi.renderMarketCards(marketList, finalMarkets, favouriteIds);

        if (finalMarkets.length === 1) {
            resultCount.textContent = "1 market";
        } else {
            resultCount.textContent = finalMarkets.length + " markets";
        }

        emptyState.hidden = finalMarkets.length > 0;
    }

  // One click listener handles cards and favourite buttons.
    marketList.addEventListener("click", function (event) {
        const favouriteButton = event.target.closest("[data-favourite-id]");
        const card = event.target.closest(".market-card");
        const detail = event.target.closest(".market-card__inline-detail");

        if (detail) {
            return;
        }

        if (card && !favouriteButton) {
            let selectedMarket = null;

            for (let i = 0; i < markets.length; i++) {
                if (markets[i].id === card.dataset.marketId) {
                    selectedMarket = markets[i];
                    break;
                }
            }

            window.FlohmarktUi.renderInlineMarketDetail(card, selectedMarket);
            return;
        }

        if (favouriteButton) {
            window.FlohmarktStorage.toggleFavourite(
            favouriteButton.dataset.favouriteId
            );
            render();
        }
    });

    searchInput.addEventListener("input", function () {
        state.search = searchInput.value;
        render();
    });

    exactDateInput.addEventListener("change", function () {
        state.exactDate = exactDateInput.value;

        if (state.exactDate) {
            state.dateFilter = "all";

            for (let i = 0; i < dateButtons.length; i++) {
                const isActive = dateButtons[i].dataset.dateFilter === "all";
                dateButtons[i].classList.toggle("filter-chip--active", isActive);
                dateButtons[i].setAttribute("aria-pressed", String(isActive));
            }
        }

        render();
    });

    districtSelect.addEventListener("change", function () {
        state.district = districtSelect.value;
        render();
    });

    freeEntryInput.addEventListener("change", function () {
        state.freeOnly = freeEntryInput.checked;
        render();
    });

    favouriteInput.addEventListener("change", function () {
        state.favouriteOnly = favouriteInput.checked;
        render();
    });

    document.addEventListener("favouritechange", render);

    for (let i = 0; i < dateButtons.length; i++) {
        dateButtons[i].addEventListener("click", function () {
            state.dateFilter = dateButtons[i].dataset.dateFilter;
            state.exactDate = "";
            exactDateInput.value = "";

            for (let j = 0; j < dateButtons.length; j++) {
                const isActive = dateButtons[j] === dateButtons[i];
                dateButtons[j].classList.toggle("filter-chip--active", isActive);
                dateButtons[j].setAttribute("aria-pressed", String(isActive));
            }

            render();
        });
    }

    status.textContent = "";
    render();
}

loadBrowsePage();
