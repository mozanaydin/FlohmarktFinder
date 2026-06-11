

//decide if the entry is free or not
function getEntryType(priceText){
    let price = priceText ? priceText.toLowerCase() : "";

    //ternary operator (? :). condition ? value if true : value if false.
    return (!price || price === "freier eintritt" ? "FREE" : "PAID");
}

//endtime doesn't exist. need to calculate it.
function calculateEndTime(startTime, duration){
    //toMinutes function turns the startTime and duration to minutes
    function toMinutes(timeString, removeText){
        //[hours, minutes] part is called array destructuring, it directly assigns the array elements to each variable.
        //.replace(searchValue, replacementValue) ==> replaces the left value with the right value.
        //.split(":") ==> this splits the string into an array of substrings according to separator.
        //.map(Number) ==> this converts the values to number, in this case converts string values into number values. 
        let [hours, minutes] = timeString.replace(removeText, "").split(":").map(Number);
        return hours * 60 + minutes;
    }

    let startInMinutes = toMinutes(startTime, " Uhr");
    let durationInMinutes = toMinutes(duration, " h");
    let endInMinutes = startInMinutes + durationInMinutes;

    //.padStart() ==> this pads a string from the start with another string until it reaches the given length. it only works with string.
    //so it changes 7 to "07" or 0 to "00"
    let endHoursText = String(Math.floor(endInMinutes / 60) % 24).padStart(2, "0");
    let endMinutesText = String(endInMinutes % 60).padStart(2, "0");

    return endHoursText + ":" + endMinutesText;
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

function makeUpcomingDate(market){
    return {
        id: market.id,
        date: market.date,
        startTime: market.startTime,
        duration: market.duration,
        endTime: market.endTime,
        priceText: market.priceText,
        entryType: market.entryType,
        eventLink: market.eventLink
    };
}

/*
function groupMarkets(markets){
    let groups = [];

    for(let i=0;i<markets.length;i++){
        let group = null;

        for(let j=0;j<groups.length;j++){
            if(groups[j].title === markets[i].title){
                group = groups[j];
                break;
            }
        }

        if(!group){
            group = {
                id: market[i].title,
                title: market[i].title,
                venue: market[i].venue,
                address: market[i].address,
                coordinates: market[i].coordinates,
                nextDate: market[i].date,
                upcomingDates: [],
                eventLink: market[i].eventLink
            };
            groups.push(group);
        }

        group.upcomingDates.push(makeUpcomingDate(market[i]));
    }

    for(let i=0;i<groups.length;i++){
        groups[i].upcomingDates.sort(function (firstDate,secondDate) {
            return firstDate.date.localeCompare(secondDate.date);
        });

        if(groups[i].upcomingDates.length>0) {
            groups[i].nextDate = groups[i].upcomingDates[0].date;
            groups[i].eventLink = groups[i].upcomingDates[0].eventLink;
        }
    }

    return groups;
}

*/

async function getFlohmarktData() {
    let FlohmarktAPI = "https://api.hamburg.de/datasets/v1/mrh_veranstaltungsdaten/collections/spielstaetten_mit_veranstaltungen_6_wochen/items?f=json&limit=1000&bundesland=Hamburg&kategorie=M%C3%A4rkte&unterkategorie=Flohm%C3%A4rkte";

    let response = await fetch(FlohmarktAPI);
    let data = await response.json();
    let marketData = [];

    for(let market of data.features){
        let properties = market.properties;
        let geometry = market.geometry;
        let marketObject = {
            id: properties.event_id,
            venueId: properties.spielstaette_id,
            venue: properties.spielstaette,
            title: properties.veranstaltungstitel,
            address: properties.adresse + ", " + properties.ort,
            date: properties.datum,
            startTime: properties.startzeit.replace(" Uhr", ""),
            duration: properties.dauer.replace(" h", "") || "",
            endTime: properties.dauer ? calculateEndTime(properties.startzeit, properties.dauer) : "",
            priceText: properties.preis,
            entryType: getEntryType(properties.preis),
            coordinates: {
                longitude: geometry.coordinates[0],
                latitude: geometry.coordinates[1]
            },
            eventLink: properties.veranstaltungslink
        }
        marketData.push(marketObject);
    }

    console.log(marketData);
    return marketData;
}


//get weather forecast for next 16 days (max allowed)
async function getWeatherForecast(){
    let OpenMeteoAPI = "https://api.open-meteo.com/v1/forecast?latitude=53.5507&longitude=9.993&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&timezone=Europe%2FBerlin&forecast_days=16";

    let response = await fetch(OpenMeteoAPI);
    let data = await response.json();
    let weatherData = [];

    for(let i=0;i<data.daily.time.length;i++){
        let weatherObject = {
            date: data.daily.time[i],
            weatherCode: data.daily.weather_code[i],
            maxTemperature: data.daily.temperature_2m_max[i],
            minTemperature: data.daily.temperature_2m_min[i],
            precipitationChance: data.daily.precipitation_probability_max[i],
            maxWindSpeed: data.daily.wind_speed_10m_max[i]
        }

        weatherData.push(weatherObject);
    }

    console.log(weatherData);
    return weatherData;
}

async function debugData() {
    await getFlohmarktData();
    await getWeatherForecast();
}

debugData();

/*IIFE = Immediately Invoked Function Expression ==> It creates a function and runs it immediately. The variables cannot be used out of the function though.
(function(){

})();
*/