
const openbrewerydb = 'https://api.openbrewerydb.org/breweries?';
let currentLocation = [];
let datas = []; 

function displayResults(responseJson){
    $('.js-results-ul').empty(); // clears results between searches
    $('#results').removeClass('hidden');
    for (let i = 0; i < responseJson.length; i++){
        if (responseJson[i].brewery_type === 'planning'){
            continue;
        }
        else {
            datas.push([`${responseJson[i].name}`, `${responseJson[i].website_url}`, `${responseJson[i].street}`, `${responseJson[i].city}`,
            `${responseJson[i].postal_code}`, `${responseJson[i].phone}`]);
            $('.js-results-ul').append(`
            <li id="li${i}" style="border:1px solid black; padding: 5px"><h3><a href="${responseJson[i].website_url}" class="listing">
            ${responseJson[i].name}</a></h3>
            <p>${responseJson[i].street}, ${responseJson[i].city}, ${responseJson[i].postal_code}</p>
            <a href="tel:${responseJson[i].phone}" class="listing">${responseJson[i].phone}</a>
            <p>${responseJson[i].brewery_type}</p>
            </li>`);
        }
    }
    $('#filter-section').removeClass('hidden');
    $('#filter-rating').removeClass('hidden');
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
        datas.length = 0; // resets datas array
        currentLocation.length = 0; // resets currentLocation array
        event.preventDefault();
        const city = $('#js-city').val();
        const state = $('#js-state').val();
        getBreweries(city, state);
        currentLocation.unshift(city, state); // change the global var currentLocation
    })
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
            }).then(responseJson =>
                displayResults(responseJson)).catch(err =>
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
            }).then(responseJson =>
                displayResults(responseJson)).catch(err =>
                    alert(`Something went wrong: ${err.message}`))
    }
}

function handleFilter(){
    $('.js-filter-form').submit(event => {
        datas.length = 0; // resets the datas array
        event.preventDefault();
        const type = $('#js-filter-type').val();
        console.log(type);
        getBreweriesByType(type);
    })
}

function displayRatingsResults(rating){
    $('.js-results-ul').empty(); // clears results between searches
    for (let i = 0; i < datas.length; i++){
        if (datas[i][6] < rating){
            continue;
        }
        else {
            $('.js-results-ul').append(`
            <li style="border:1px solid black; padding: 5px"><h3><a href="${datas[i][1]}">${datas[i][0]}</a><h3>
            <br>
            <p>${datas[i][2]}, ${datas[i][3]}, ${datas[i][4]}</p>
            <p>${datas[i][5]}</p>
            <p>${datas[i][6]}</p>
            </li>
            <`)
        }
    }
}

function addRatingsToDatas(rating){
    for (let i = 0; i < datas.length; i++){
        let yelpUrl = `https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search/phone?phone=+1${datas[i][5]}`;
        $.ajax({
            url: yelpUrl,
            headers: {
             'Authorization':'Bearer _a8h7LsqbLkwpuPVS2jxjlsQ-yCDAm7I00jbdk-F6lm-EYPboD_0uPrqoFnxi2z38qL7a4nP-LCWh1nisvMFi5ahOx_uvqMYlEJQOQ6RWH-miBvQGp83zjTbPGHEXXYx',
            },
            method: 'GET',
            dataType: 'json',
            success: function(data){
                if (data.total === 0){
                    console.log('no rating');
                    datas[i][6] = 'no rating';
                }
                else {
                    console.log(data.businesses[0].rating);
                    datas[i][6] = data.businesses[0].rating;
                }
            }
        })
    }
    displayRatingsResults(rating);
}

function handleRating(){
    $('.js-filter-rating').submit(event => {
        event.preventDefault();
        const rating = $('#js-rating').val();
        console.log('user rate is:' + rating);
        addRatingsToDatas(rating);
    })
}

$(handleRating)
$(handleFilter)
$(handleSubmit)