const openbrewerydb = 'https://api.openbrewerydb.org/breweries?';
const yelpFusion = 'https://api.yelp.com/v3/businesses/search/phone?phone=+1';
const yelpKey = '_a8h7LsqbLkwpuPVS2jxjlsQ-yCDAm7I00jbdk-F6lm-EYPboD_0uPrqoFnxi2z38qL7a4nP-LCWh1nisvMFi5ahOx_uvqMYlEJQOQ6RWH-miBvQGp83zjTbPGHEXXYx'
let currentLocation = [];

// This function prepares the phone number for display in results.
function formatNum(number){
    let formattedNum = number.slice(0,3) + '-' + number.slice(3,6) + '-' + number.slice(6,10);
    return formattedNum;
}

// This function removes apostrophes from the brewery's name.
function formatName(name){
    formattedName = name.replace(/'/g, 'A');
    return formattedName;
}

// This function clears results and returns page to allow a new location search.
function newLocation(){
    $('.js-location-section').removeClass('hidden');
    $('.js-location-section').addClass('location-section');
    $('#filter-section').addClass('hidden');
    $('.js-results-ul').empty();
    $('.js-results-count').addClass('hidden');
    $('.js-results-buffer').addClass('hidden');
    $('.js-objective').removeClass('hidden').append(`
        <div class="get-started-alt">
            <h1 class="h1" id="search-reminder-alt">Enter a city and state to get started!</h1>
        </div>
    `)
}

// This function adds and removes elements to show the search results.
function prepareResults(){
    $('.js-location-section').addClass('hidden');
    $('.js-location-section').removeClass('location-section');
    $('#filter-section').removeClass('hidden');
    $('.js-objective').addClass('hidden');
    $('.js-objective').empty();
    $('.js-results-ul').empty(); 
}

// This function displays the brewery listings returned from Open Brewery DB.
function displayResults(responseJson){
    let resultsLength = responseJson.length;

    $('.js-results-count').remove();
    $('.js-results-buffer').remove();
    // This lets the user see how many results were returned.
    $('.js-results-ul').before(`
        <p class="results-count js-results-count">Viewing <span class="count">${resultsLength}</span> results</p>
    `);

    prepareResults(); 

    // This formats each result to display as list items in the results-section.
    for (let i = 0; i < responseJson.length; i++){
        let number = responseJson[i].phone;
        let formattedNum = formatNum(number);
        let formattedName = formatName(responseJson[i].name);
        let name = responseJson[i].name;
        let website = responseJson[i].website_url;
        let brewType = responseJson[i].brewery_type;
        let zip = responseJson[i].postal_code;
        let street = responseJson[i].street;
        let city = responseJson[i].city;

        // This eliminates listings for breweries that haven't opened yet.
        if (brewType === 'planning'){
            continue;
        }

        // This handles how to display results for listings with incomplete info.
        else if (!number || !website || (number.length < 10) || (website.length === 0)){

            // Edge case: listing has no phone and no website.
            if ((number.length !== 10) && (website.length === 0)){
                $('.js-results-ul').append(`
                    <li class="li" id="li-${i}">
                        <h3 class="h3">${name}</h3>
                        <p>${street}, ${city}, ${zip}</p>
                        <p class="brewery-type">Brewery type: ${brewType}</p>
                        <p>Cannot retrieve rating for this brewery</p>
                    </li>`)
            }

            // Edge case: listing has no website but has a phone number.
            else if ( !website || (website.length === 0) && (number.length === 10)){
                $('.js-results-ul').append(`
                    <li class="li" id="li-${i}">
                        <h3 class="h3">${name}</h3>
                        <p>${street}, ${city}, ${zip}</p>
                        <a href="tel:${number}" class="listing"><i class="fas fa-phone"></i> ${formattedNum}</a>
                        <p class="brewery-type">Brewery type: ${brewType}</p>
                        <input type="button" id="button-${i}" onClick='getRatings(${number}, ${i}, "${formattedName}")' value="Get Yelp Rating">
                        <div class="hidden spinner spinner-${i}"></div> 
                    </li>`)
            }

            // Edge case: listing has no phone number but has a web site.
            else if ( !number || (website.length > 0) && (number.length < 10)){
                $('.js-results-ul').append(`
                    <li class="li" id="li-${i}">
                        <h3 class="h3">
                            <a href="${website}" target="_blank" class="listing">${name}</a>
                        </h3>
                        <p>${street}, ${city}, ${zip}</p>
                        <p class="brewery-type">Brewery type: ${brewType}</p>
                        <p>Cannot retrieve rating for this brewery</p>
                    </li>`)
            }
        }

        // This is the standard display format for listings with full info.
        else {
            $('.js-results-ul').append(`
                <li class="li" id="li-${i}">
                    <h3 class="h3">
                        <a href="${website}" target="_blank" class="listing">${name}</a>
                    </h3>
                    <p>${street}, ${city}, ${zip}</p>
                    <a href="tel:${number}" class="listing"><i class="fas fa-phone"></i> ${formattedNum}</a>
                    <p class="brewery-type">Brewery type: ${brewType}</p>
                    <input type="button" id="button-${i}" onClick='getRatings(${number}, ${i}, "${formattedName}")' value="Get Yelp Rating">
                    <div class="hidden spinner spinner-${i}"></div>
                </li>`)
        }
    }

    $('.js-results-ul').after(`
    <div class="results-buffer js-results-buffer" id="buffer">
        <input name="end-results" id="end-results-back" type="button" onClick="newLocation()" value="NEW LOCATION SEARCH">
    </div>`)
}

// Display Sweet Alert 2 error message whenever a fetch/then error occurs.
function errorMsg(err){
    Swal.fire({
        icon: 'error',
        title: 'Well this is embarrassing ...',
        text: `${err}`,
        footer: "<p>Let's try that again shall we?</p>"
    });
}

// Display Sweet Alert 2 message whenever a search returns no results.
function noResults(){
    Swal.fire({
        icon: 'warning',
        title: 'Sorry...',
        text: 'We have no results for this location!',
        footer: '<p>How about we try another place?</p>'
    });
}

// Display Sweet Alert 2 messgae whenever a Yelp rating cannot be retrieved.
function noRating(name){
    Swal.fire({
        icon:'error',
        title: 'Sorry...',
        text: `We couldn't retrieve any ratings data from Yelp for ${name}`
    });
}

// Display Sweet Alert 2 message whenever no results are returned for a brewery type.
function noType(type){
    let city = currentLocation[0];
    let state = currentLocation[1];

    Swal.fire({
        icon: 'warning',
        title: 'Sorry...',
        text: `There are no ${type} breweries in ${city} ${state}`
    });
}

// This funciton shows a Sweet Alert 2 message which allows the user to visit a page with definitions of different brewery types after clicking ...
// ... the question mark icon.
function questionMark(){
    $('.question').click(function(){
        event.preventDefault();
        Swal.fire({
            icon:'question',
            title: 'Brewery Types',
            text: 'Need a refresher on the different types of breweries? No sweat, check out the link at the bottom for more info.',
            footer: '<a href="https://www.glasswithatwist.com/articles/brewery-definitions.html" target="_blank">Click me</a>'
        })
    })
}

// This function makes a call to the OpenBreweryDB API for the user entered location.
function getBreweries(city, state){
    const formattedState = state.replace(' ','_');
    const formattedCity = city.replace(' ','_');

    // Allows user to forgo specifying a city to search across entire state.
    if (city === ''){
        const url = openbrewerydb + `by_state=${formattedState}` + '&per_page=50';

        fetch(url).then(response => {
            if (response.ok){
                return response.json()
            }

            throw new Error(response.statusText)

        }).then(responseJson => {
            // No results for location.
            if (responseJson.length === 0){
                noResults();
            }

            else {
                displayResults(responseJson)
            }

        }).catch(err =>
            errorMsg(`${err.message}`)
        )
    }

    // Makes a standard call to OpenBreweryDB with the user entered location.
    else {
        const url = openbrewerydb + `by_city=${formattedCity}` + `&by_state=${formattedState}` + '&per_page=50';

        fetch(url).then(response => {
            if (response.ok){
                return response.json()
            }

            throw new Error(response.statusText)

        }).then(responseJson => {
                
            // No results for location.
            if (responseJson.length === 0){
                noResults(); 
            }

            else {
                displayResults(responseJson)
            }

        }).catch(err =>
            errorMsg(`${err.message}`)
        )
    }
}

// This funciton allows the user to filter the brewery results for a location by the type of brewery i.e. Brewpub, Micro, etc.
function getBreweriesByType(type){
    $('.js-results-count').addClass('hidden');

    const formattedState = currentLocation[1].replace(' ','_');
    const formattedCity = currentLocation[0].replace(' ','_');

    // Make call to OpenBreweryDB without a city specified.
    if (currentLocation[0] === ''){
        const url = openbrewerydb + `by_state=${formattedState}` + `&by_type=${type}` + '&per_page=50';

        fetch(url).then(response => {

            if (response.ok){
                return response.json()
            }

            throw new Error(response.statusText)
            }).then(responseJson => {

                // No results for this type of brewery at this location.
                if (responseJson.length === 0){
                    noType(type);
                }

                displayResults(responseJson);
            }).catch(err =>
                    alert(`Something went wrong: ${err.message}`))
        
    }

    // Make call to OpenBreweryDB with city, state, and brewery type specified.
    else {
        const url = openbrewerydb + `by_city=${formattedCity}` + `&by_state=${formattedState}` + `&by_type=${type}` + '&per_page=50';
        fetch(url).then(response => {

            if (response.ok){
                return response.json()
            }

            throw new Error(response.statusText)
            }).then(responseJson => {

                // No results for this brewery type at this location.
                if (responseJson.length === 0){
                    noType(type);
                }

                displayResults(responseJson);
            }).catch(err =>
                    alert(`Something went wrong: ${err.message}`))
    }
}

// This function handles the submit event once the user selects a location to search.
function handleSubmit(){
    $('.js-support').addClass('hidden');
    $('.js-watering-hole').addClass('hidden');
    $('.js-get-started').remove();

    $('.js-location-form').submit(event => {
        const city = $('#city').val();
        const state = $('#state').val();

        currentLocation.length = 0; // Resets the location data in currentLocation array.
        event.preventDefault();
        getBreweries(city, state);
        currentLocation.unshift(city, state); // Adds new location data to currentLocation array.
    })
}

// This function handles the change event once the user selects a brewery type to filter the results.
function handleFilter(){
    $('.js-filter-form').change(event => {
        const type = $('#filter-type').val();

        event.preventDefault();
        getBreweriesByType(type);
    })
}

// This function displays a loading wheel animation.
function showSpinner(i) {
    $(`.spinner-${i}`).removeClass('hidden');
}


// This function triggers a call to the Yelp Fusion API to retrieve the average business rating for the particular brewery.
// The Yelp Fusion API is quite finicky and does not respond well to multiple calls in short time spans, hence why ...
// ... all ratings are not retrieved during the getBreweries() function to be loaded along with the results. 
// The parameter 'i' is the index corresponding with the listing number for which the rating is being requested.
function getRatings(phone, i, formattedName){
    $(`#button-${i}`).remove(); // Removes the 'Get Yelp Rating' button
    showSpinner(i); // Show loading wheel while awaiting rating

    let yelpUrl = `https://cors-anywhere.herokuapp.com/${yelpFusion}${phone}`;

    $.ajax({
        url: yelpUrl,
        headers: {'Authorization':`Bearer ${yelpKey}`},
        method: 'GET',
        dataType: 'json',
        success: function(data){
            $(`.spinner-${i}`).removeClass('spinner'); // Removes the loading wheel animation.

            // No match found to pull business rating from
            if (data.total === 0){
                noRating(formattedName);
            }

            // Multiple business matches returned.
            else if (data.total > 1){
                let shortName = name.slice(0,5); // First five characters of business name

                for (let j = 0; j < data.businesses.length; j++){

                    let YelpName = data.businesses[j].name;
                    let rating = data.businesses[j].rating;

                    // Since there are multiple matches, we find the listing with a matching name.
                    if (YelpName.includes(shortName) === true){
                        $(`#li-${i}`).append(`<p id='p-${i}'>${rating}</p>`);
                        break;
                    }

                    // When we reach the last listing.
                    else if (j === data.businesses.length - 1){

                        // There is a match.
                        if (YelpName.includes(shortName) === true){
                            $(`#li-${i}`).append(`<p id='p-${i}'>${rating}</p>`);
                        }
                        // There is no match.
                        else {
                            noRating(fomattedName);
                        }
                    }
                }
            }

            // Single business listing returned.
            else {
                let firstListing = data.businesses[0].rating;
                $(`#li-${i}`).append(`<p id='p-${i}'>${firstListing}</p>`);
            }
        }
    })
}

// This function will display a message that changes a few times unless/until the user makes a search.
function animatedText(){
    setTimeout(function() {
        $('.js-welcome').attr('id','welcome');
        $('.js-welcome').removeClass('hidden');
    }, 2000);

    setTimeout(function() {
        $('.js-support').attr('id','support');
        $('.js-support').removeClass('hidden');
    }, 7500);

    setTimeout(function() {
        $('.js-watering-hole').attr('id','watering-hole');
        $('.js-watering-hole').removeClass('hidden');
    }, 13000) 

    setTimeout(function() {
        $('.get-started').append(`
            <h1 class='h1 search-reminder'>Enter a city and state to get started!</h1>`)
        }, 18500)
}

$(function(){
    handleFilter();
    handleSubmit();
    animatedText();
    questionMark()
})