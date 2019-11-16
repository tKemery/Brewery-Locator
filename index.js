const openbrewerydb = 'https://api.openbrewerydb.org/breweries?';
let currentLocation = [];

function formatNum(number){
    let formattedNum = number.slice(0,3) + '-' + number.slice(3,6) + '-' + number.slice(6,10);
    return formattedNum;
}

function newLocation(){
    $('#section2').removeClass('hidden');
    $('#filter-section').addClass('hidden');
    $('.js-results-ul').empty();
}

function displayResults(responseJson){
    $('#section2').addClass('hidden');
    $('#filter-section').removeClass('hidden');
    // clears results between searches
    $('.js-results-ul').empty(); 

    for (let i = 0; i < responseJson.length; i++){
        let number = responseJson[i].phone;
        let formattedNum = formatNum(number);

        // eliminates listings for breweries that haven't opened yet
        if (responseJson[i].brewery_type === 'planning'){
            continue;
        }
        // display results for listings with incomplete info
        else if ((responseJson[i].phone.length < 10) || (responseJson[i].website_url.length === 0)){
            // edge case: listing has no phone and no website
            if ((responseJson[i].phone.length !== 10) && (responseJson[i].website_url.length === 0)){
                console.log(responseJson[i].name + ' ' + 'no number or website');
                $('.js-results-ul').append(`
                    <li id="li-${i}" style="border:1px solid black; padding: 5px">
                        <h3>${responseJson[i].name}</h3>
                        <p>${responseJson[i].street}, ${responseJson[i].city}, ${responseJson[i].postal_code}</p>
                        <p class="brewery-type">Brewery type: ${responseJson[i].brewery_type}</p>
                        <p>Cannot retrieve rating for this brewery</p>
                    </li>`)
            }
            // edge case: listing has no website but has a phone number
            if ((responseJson[i].website_url.length === 0) && (responseJson[i].phone.length === 10)){
                console.log(responseJson[i].name + ' ' + 'no website but has number');
                $('.js-results-ul').append(`
                    <li id="li-${i}" style="border:1px solid black; padding: 5px">
                        <h3>${responseJson[i].name}</h3>
                        <p>${responseJson[i].street}, ${responseJson[i].city}, ${responseJson[i].postal_code}</p>
                        <a href="tel:${responseJson[i].phone}" class="listing">Tel: ${formattedNum}</a>
                        <p class="brewery-type">Brewery type: ${responseJson[i].brewery_type}</p>
                        <input type="button" onClick="getRatings(${responseJson[i].phone}, ${i})" value="Get Yelp Rating">
                    </li>`)
            }
            // edge case: listing has no phone number but has a web site
            if ((responseJson[i].website_url.length > 0) && (responseJson[i].phone.length < 10)){
                console.log(responseJson[i].name + ' ' + 'no number but has website');
                $('.js-results-ul').append(`
                    <li id="li-${i}" style="border:1px solid black; padding: 5px">
                        <h3>
                            <a href="${responseJson[i].website_url}" target="_blank" class="listing">${responseJson[i].name}</a>
                        </h3>
                        <p>${responseJson[i].street}, ${responseJson[i].city}, ${responseJson[i].postal_code}</p>
                        <p class="brewery-type">Brewery type: ${responseJson[i].brewery_type}</p>
                        <p>Cannot retrieve rating for this brewery</p>
                    </li>`)
            }
        }
        else {
            $('.js-results-ul').append(`
                <li id="li-${i}"" style="border:1px solid black; padding: 5px">
                    <h3>
                        <a href="${responseJson[i].website_url}" target="_blank" class="listing">${responseJson[i].name}</a>
                    </h3>
                    <p>${responseJson[i].street}, ${responseJson[i].city}, ${responseJson[i].postal_code}</p>
                    <a href="tel:${responseJson[i].phone}" class="listing">Tel: ${formattedNum}</a>
                    <p class="brewery-type">Brewery type: ${responseJson[i].brewery_type}</p>
                    <input type="button" onClick="getRatings(${responseJson[i].phone}, ${i})" value="Get Yelp Rating">
                </li>`)
        }
    }
}

function getBreweries(city, state){
    const formattedState = state.replace(' ','_');
    const formattedCity = city.replace(' ','_');
    if (city === ''){
        const url = openbrewerydb + `by_state=${formattedState}` + '&per_page=50';
        console.log(url);
        fetch(url).then(response => {
            if (response.ok){
                return response.json()
            }
            throw new Error(response.statusText)
            }).then(responseJson =>
                displayResults(responseJson)).catch(err =>
                    alert(`Something went wrong: ${err.message}`))
        
    }
    else {
        const url = openbrewerydb + `by_city=${formattedCity}` + `&by_state=${formattedState}` + '&per_page=50';
        console.log(url);
        fetch(url).then(response => {
            if (response.ok){
                return response.json()
            }
            throw new Error(response.statusText)
            }).then(responseJson =>
                displayResults(responseJson)).catch(err =>
                    alert(`Something went wrong: ${err.message}`))
    }
}

function getBreweriesByType(type){
    const formattedState = currentLocation[1].replace(' ','_');
    const formattedCity = currentLocation[0].replace(' ','_');
    if (currentLocation[0] === ''){
        const url = openbrewerydb + `by_state=${formattedState}` + `&by_type=${type}` + '&per_page=50';
        console.log(url);
        fetch(url).then(response => {
            if (response.ok){
                return response.json()
            }
            throw new Error(response.statusText)
            }).then(responseJson => {
                displayResults(responseJson);
                // $('#filter-section').toggleClass('hidden');
            }).catch(err =>
                    alert(`Something went wrong: ${err.message}`))
        
    }
    else {
        const url = openbrewerydb + `by_city=${formattedCity}` + `&by_state=${formattedState}` + `&by_type=${type}` + '&per_page=50';
        console.log(url);
        fetch(url).then(response => {
            if (response.ok){
                return response.json()
            }
            throw new Error(response.statusText)
            }).then(responseJson => {
                displayResults(responseJson);
                // $('#filter-section').toggleClass('hidden');
            }).catch(err =>
                    alert(`Something went wrong: ${err.message}`))
    }
}

function handleSubmit(){
    $('.js-location-form').submit(event => {
        currentLocation.length = 0;
        event.preventDefault();
        const city = $('#js-city').val();
        const state = $('#js-state').val();
        getBreweries(city, state);
        currentLocation.unshift(city, state); 
    })
}

function handleFilter(){
    $('.js-filter-form').submit(event => {
        event.preventDefault();
        const type = $('#js-filter-type').val();
        console.log(type);
        getBreweriesByType(type);
    })
}

function getRatings(phone, i){
    $(`#p-${i}`).remove();  
    let yelpUrl = `https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search/phone?phone=+1${phone}`;
    $.ajax({
        url: yelpUrl,
        headers: {
        'Authorization':'Bearer _a8h7LsqbLkwpuPVS2jxjlsQ-yCDAm7I00jbdk-F6lm-EYPboD_0uPrqoFnxi2z38qL7a4nP-LCWh1nisvMFi5ahOx_uvqMYlEJQOQ6RWH-miBvQGp83zjTbPGHEXXYx',
        },
        method: 'GET',
        dataType: 'json',
        success: function(data){
        if (data.total === 0){
            $(`#li-${i}`).append(`<p id='p-${i}'>no rating available</p>`);
        }
        else {
            $(`#li-${i}`).append(`<p id='p-${i}'>${data.businesses[0].rating}</p>`);
        }
        }
    })
}

$(function(){
    handleFilter();
    handleSubmit()
})