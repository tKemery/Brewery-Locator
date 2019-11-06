'use strict';

const openbrewerydb = 'https://api.openbrewerydb.org/breweries?';

function displayResults(responseJson){
    $('.js-results-ul').empty(); // clears results between searches
    $('#results').removeClass('hidden');
    for (let i = 0; i < responseJson.length; i++){
        if (responseJson[i].brewery_type === 'planning'){
            continue;
        }
        $('.js-results-ul').append(`
            <li style="border:1px solid black; padding: 5px"><a href="${responseJson[i].website_url}" class="listing">${responseJson[i].name}</a>
            <br>
            <p>${responseJson[i].street}, ${responseJson[i].city}, ${responseJson[i].postal_code}</p>
            <a href="tel:${responseJson[i].phone}" class="listing">${responseJson[i].phone}</a>
            <p>${responseJson[i].brewery_type}</p>
            </li>`)
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

function handleSubmit(){
    $('.js-location-form').submit(event => {
        event.preventDefault();
        const city = $('#js-city').val();
        const state = $('#js-state').val();
        getBreweries(city, state);
    })
}

$(handleSubmit)