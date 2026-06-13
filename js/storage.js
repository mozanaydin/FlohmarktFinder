// This file saves and reads favourite market IDs in localStorage.

let FAVOURITES_KEY = "hamburg-flohmarkt-favourites";

// Read the saved favourite IDs.
function getFavouriteIds() {
    let savedText = localStorage.getItem(FAVOURITES_KEY);

    if (!savedText) {
        return [];
    }

    let savedIds = JSON.parse(savedText);

    if (!Array.isArray(savedIds)) {
        return [];
    }

    let validIds = [];

    for (let i = 0; i < savedIds.length; i++) {
        if (typeof savedIds[i] === "string") {
            validIds.push(savedIds[i]);
        }
    }

    return validIds;
    
}

// Save the IDs without saving the same ID twice.
function saveFavouriteIds(ids) {
    let uniqueIds = [];

    for (let i = 0; i < ids.length; i++) {
        if (!uniqueIds.includes(ids[i])) {
            uniqueIds.push(ids[i]);
        }
    }

    localStorage.setItem(FAVOURITES_KEY, JSON.stringify(uniqueIds));
}

function addFavourite(id) {
    if (!id) {
        return;
    }

    let savedIds = getFavouriteIds();
    savedIds.push(id);
    saveFavouriteIds(savedIds);
}

function removeFavourite(id) {
    let savedIds = getFavouriteIds();
    let remainingIds = [];

    for (let i = 0; i < savedIds.length; i++) {
        if (savedIds[i] !== id) {
        remainingIds.push(savedIds[i]);
        }
    }

    saveFavouriteIds(remainingIds);
}

function isFavourite(id) {
    let savedIds = getFavouriteIds();
    return savedIds.includes(id);
}

// Add the market if it is not saved, or remove it if it is saved.
function toggleFavourite(id) {
    if (isFavourite(id)) {
        removeFavourite(id);
        return false;
    }

    addFavourite(id);
    return true;
}