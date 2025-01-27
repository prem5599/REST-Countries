var baseUrl = 'https://restcountries.com/v3.1';
var FAVORITES_KEY = 'favoriteCountries';

var favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];

// Fetch country details
function fetchCountryDetails(countryName) {
    fetch(baseUrl + '/name/' + countryName + '?fullText=true')
        .then(function(response) {
            if (!response.ok) throw new Error('Failed to fetch country details');
            return response.json();
        })
        .then(function(data) {
            var country = data[0];
            renderCountryDetails(country);
            setupFavoriteButton(country);
        })
        .catch(function(error) {
            console.error('Error:', error);
        });
}

// Render country details
function renderCountryDetails(country) {
    document.getElementById('countryFlag').src = country.flags.png;
    document.getElementById('countryName').textContent = country.name.common;
    document.getElementById('tld').textContent = country.tld ? country.tld.join(', ') : 'N/A';
    document.getElementById('capital').textContent = country.capital ? country.capital[0] : 'N/A';
    document.getElementById('region').textContent = country.region;
    document.getElementById('population').textContent = country.population ? country.population.toLocaleString() : 'N/A';
    document.getElementById('area').textContent = country.area ? country.area.toLocaleString() + ' km²' : 'N/A';
    document.getElementById('languages').textContent = country.languages ? Object.values(country.languages).join(', ') : 'N/A';
}

// Setup favorite button
function setupFavoriteButton(country) {
    var favoriteButton = document.getElementById('favoriteButton');
    favoriteButton.classList.toggle('active', isFavorite(country));
    favoriteButton.innerHTML = isFavorite(country) ? '★ Added to Favorites' : '☆ Add to Favorites';
    favoriteButton.onclick = function() {
        toggleFavorite(country);
    };
}

// Check if a country is a favorite
function isFavorite(country) {
    return favorites.some(function(fav) {
        return fav.name.common === country.name.common;
    });
}

// Toggle favorite
function toggleFavorite(country) {
    var index = favorites.findIndex(function(fav) {
        return fav.name.common === country.name.common;
    });

    if (index === -1) {
        if (favorites.length >= 5) {
            alert('You can only have up to 5 favorite countries.');
            return;
        }
        favorites.push(country);
    } else {
        favorites.splice(index, 1);
    }

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    setupFavoriteButton(country); // Update button state
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    var urlParams = new URLSearchParams(window.location.search);
    var countryName = urlParams.get('country');
    if (countryName) {
        fetchCountryDetails(countryName);
    }
});
