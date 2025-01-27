// ===============================
// Constants and Global Variables
// ===============================
var baseUrl = 'https://restcountries.com/v3.1';
var FAVORITES_KEY = 'favoriteCountries';

// Global state management
var countries = [];                                                    // Stores all countries data
var favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []; // Stores favorite countries
var debounceTimer;                                                    // For search debouncing
var currentPage = 1;                                                  // Current page for pagination
var pageSize = 12;                                                    // Items per page
var currentFilter = null;                                            // Current active filter

// ===============================
// DOM Element References
// ===============================
var elements = {
    searchInput: document.getElementById('searchInput'),
    searchSuggestions: document.getElementById('searchSuggestions'),
    regionFilter: document.getElementById('regionFilter'),
    languageFilter: document.getElementById('languageFilter'),
    countriesGrid: document.getElementById('countriesGrid'),
    favoritesList: document.getElementById('favoritesList'),
    showMore: document.getElementById('showMore')
};

// ===============================
// Data Fetching
// ===============================
/**
 * Fetches all countries data from the API and initializes the application
 */
function fetchCountries() {
    // Show loading state
    elements.countriesGrid.innerHTML = '<div class="loading">Loading countries...</div>';
    
    fetch('https://restcountries.com/v3.1/all')
        .then(response => {
            console.log('Direct API test:', response.status);
            if (response.ok) {
                return response.json();
            }
            throw new Error('Network response error');
        })
        .then(data => {
            // Store countries data
            countries = data;
            console.log('Countries loaded:', data.length);
            
            // Initialize UI
            renderCountries(getPaginatedCountries());
            populateLanguageFilter();
            populateRegionFilter();
            updateFavoritesList();
        })
        .catch(error => {
            console.log('Direct API error:', error);
            elements.countriesGrid.innerHTML = `
                <div class="error-message">
                    <p>Error loading countries. Please try again.</p>
                    <button onclick="fetchCountries()">Reload</button>
                </div>
            `;
        });
}

// ===============================
// Rendering Functions
// ===============================
/**
 * Renders country cards to the grid
 * @param {Array} countries - Array of country objects to render
 */
function renderCountries(countries) {
    if (currentPage === 1) {
        elements.countriesGrid.innerHTML = '';
    }

    countries.forEach(function(country) {
        var countryCard = document.createElement('div');
        countryCard.className = 'country-card';
        
        // Build card HTML structure
        var flagHTML = '<div class="flag-container">' +
            '<img src="' + country.flags.png + '" alt="' + country.name.common + ' flag">' +
            '</div>';
            
        var infoHTML = '<div class="country-info">' +
            '<h2 class="country-name">' + country.name.common + '</h2>' +
            '<p class="country-detail"><strong>Region:</strong> ' + country.region + '</p>' +
            '<p class="country-detail"><strong>Capital:</strong> ' + (country.capital ? country.capital[0] : 'N/A') + '</p>' +
            '</div>';
            
        var buttonHTML = '<div class="favorite-button-container">' +
            '<button class="favorite-button' + (isFavorite(country) ? ' active' : '') + '">' +
            (isFavorite(country) ? '★ Added to Favorites' : '☆ Add to Favorites') +
            '</button>' +
            '</div>';
        
        countryCard.innerHTML = flagHTML + infoHTML + buttonHTML;

        // Add event listeners for the card
        var favButton = countryCard.querySelector('.favorite-button');
        favButton.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleFavorite(country);
            
            favButton.classList.toggle('active');
            favButton.textContent = favButton.classList.contains('active') 
                ? '★ Added to Favorites' 
                : '☆ Add to Favorites';
        });

        countryCard.addEventListener('click', function(e) {
            if (!e.target.closest('.favorite-button')) {
                navigateToDetails(country.name.common);
            }
        });
        
        elements.countriesGrid.appendChild(countryCard);
    });

    updateShowMoreButton();
}

/**
 * Updates visibility of "Show More" button based on pagination state
 */
function updateShowMoreButton() {
    var totalCountries = getFilteredCountries().length;
    var displayedCountries = currentPage * pageSize;
    elements.showMore.style.display = displayedCountries < totalCountries ? 'block' : 'none';
}

/**
 * Returns paginated subset of filtered countries
 * @returns {Array} - Paginated countries array
 */
function getPaginatedCountries() {
    var start = (currentPage - 1) * pageSize;
    var end = start + pageSize;
    return getFilteredCountries().slice(start, end);
}

// ===============================
// Favorites Management
// ===============================
/**
 * Checks if a country is in favorites
 * @param {Object} country - Country to check
 * @returns {boolean} - True if country is in favorites
 */
function isFavorite(country) {
    return favorites.some(fav => fav.name.common === country.name.common);
}

/**
 * Toggles a country's favorite status
 * @param {Object} country - Country to toggle
 */
function toggleFavorite(country) {
    const index = favorites.findIndex(fav => fav.name.common === country.name.common);

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
    updateFavoritesList();
}

/**
 * Updates the favorites list display
 */
function updateFavoritesList() {
    if (favorites.length === 0) {
        elements.favoritesList.innerHTML =
            '<div class="no-favorites">' +
                '<p>No favorite countries yet</p>' +
                '<p>Click the star icon to add countries to your favorites</p>' +
            '</div>';
        return;
    }

    var favoritesHTML = '';
    favorites.forEach(function(country) {
        favoritesHTML +=
            '<div class="favorite-item" onclick="navigateToDetails(\'' + country.name.common + '\')">' +
                '<img src="' + country.flags.png + '" alt="' + country.name.common + ' flag" class="favorite-flag">' +
                '<div class="favorite-info">' +
                    '<p class="favorite-name">' + country.name.common + '</p>' +
                    '<p class="favorite-region">' + country.region + '</p>' +
                '</div>' +
                '<button class="remove-favorite" onclick="event.stopPropagation(); removeFavorite(\'' + country.name.common + '\')">×</button>' +
            '</div>';
    });

    elements.favoritesList.innerHTML = favoritesHTML;
}

/**
 * Removes a country from favorites
 * @param {string} countryName - Name of country to remove
 */
function removeFavorite(countryName) {
    favorites = favorites.filter(function(fav) {
        return fav.name.common !== countryName;
    });

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    updateFavoritesList();
    renderCountries(getPaginatedCountries());
}

// ===============================
// Filter Population Functions
// ===============================
/**
 * Populates the language filter dropdown
 */
function populateLanguageFilter() {
    var languages = {};
    countries.forEach(function(country) {
        if (country.languages) {
            Object.values(country.languages).forEach(function(lang) {
                languages[lang] = true;
            });
        }
    });

    var options = '<option value="">All Languages</option>';
    Object.keys(languages).sort().forEach(function(lang) {
        options += '<option value="' + lang + '">' + lang + '</option>';
    });
    elements.languageFilter.innerHTML = options;
}

/**
 * Populates the region filter dropdown
 */
function populateRegionFilter() {
    var regions = {};
    countries.forEach(function(country) {
        regions[country.region] = true;
    });

    var options = '<option value="">All Regions</option>';
    Object.keys(regions).sort().forEach(function(region) {
        options += '<option value="' + region + '">' + region + '</option>';
    });
    elements.regionFilter.innerHTML = options;
}

// ===============================
// Navigation and Routing
// ===============================
/**
 * Navigates to country details page
 * @param {string} countryName - Name of country to show details for
 */
function navigateToDetails(countryName) {
    window.location.href = 'details.html?country=' + encodeURIComponent(countryName);
}

// ===============================
// Filter and Search Functions
// ===============================
/**
 * Returns filtered countries based on current search and filter criteria
 * @returns {Array} - Filtered countries array
 */
function getFilteredCountries() {
    var searchQuery = elements.searchInput.value.toLowerCase();
    var regionValue = elements.regionFilter.value;
    var languageValue = elements.languageFilter.value;

    return countries.filter(function(country) {
        var matchesSearch = !searchQuery || country.name.common.toLowerCase().includes(searchQuery);
        var matchesFilter = true;

        if (currentFilter === 'region' && regionValue) {
            matchesFilter = country.region === regionValue;
        } else if (currentFilter === 'language' && languageValue) {
            matchesFilter = country.languages && Object.values(country.languages).includes(languageValue);
        }

        return matchesSearch && matchesFilter;
    });
}

/**
 * Handles filter type changes
 * @param {string} filterType - Type of filter being changed ('region' or 'language')
 */
function handleFilterChange(filterType) {
    currentFilter = filterType;

    // Reset other filter when one is selected
    if (filterType === 'region') {
        elements.languageFilter.value = '';
    } else if (filterType === 'language') {
        elements.regionFilter.value = '';
    }

    currentPage = 1;
    renderCountries(getPaginatedCountries());
}

/**
 * Loads more countries when "Show More" is clicked
 */
function showMoreCountries() {
    currentPage++;
    renderCountries(getPaginatedCountries());
}

/**
 * Handles search functionality with debouncing
 * @param {string} query - Search query
 */
function searchCountries(query) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function() {
        if (!query) {
            elements.searchSuggestions.style.display = 'none';
            currentPage = 1;
            renderCountries(getPaginatedCountries());
            return;
        }

        const filteredResults = countries.filter((country) =>
            country.name.common.toLowerCase().includes(query.toLowerCase())
        );
        showSuggestions(filteredResults);
    }, 300);
}

// ===============================
// Search Suggestions Functions
// ===============================
/**
 * Displays search suggestions dropdown
 * @param {Array} results - Array of matching countries
 */
function showSuggestions(results) {
    // Check if suggestions element exists
    if (!elements.searchSuggestions) {
        return;
    }

    // Hide suggestions if no results
    if (results.length === 0) {
        elements.searchSuggestions.style.display = 'none';
        return;
    }

    // Display up to 5 results in the dropdown
    var limitedResults = results.slice(0, 5);
    var suggestionsHTML = '';

    // Build HTML for each suggestion
    for (var i = 0; i < limitedResults.length; i++) {
        var country = limitedResults[i];
        suggestionsHTML += '<div class="suggestion-item" onclick="selectSuggestion(\'' + 
            country.name.common + '\')">' + 
            country.name.common + '</div>';
    }

    // Add "View all" button if there are more than 5 results
    if (results.length > 5) {
        suggestionsHTML += '<div class="suggestion-item view-all" onclick="viewAllResults(\'' + 
            elements.searchInput.value + '\')">View all results</div>';
    }

    // Update the DOM
    elements.searchSuggestions.innerHTML = suggestionsHTML;
    elements.searchSuggestions.style.display = 'block';
}

/**
 * Shows all search results
 * @param {string} query - Search query
 */
function viewAllResults(query) {
    const matchingCountries = countries.filter((country) =>
        country.name.common.toLowerCase().includes(query.toLowerCase())
    );
    renderCountries(matchingCountries);
    elements.searchSuggestions.style.display = 'none';
}

/**
 * Handles selection of a search suggestion
 * @param {string} countryName - Name of selected country
 */
function selectSuggestion(countryName) {
    elements.searchInput.value = countryName;
    elements.searchSuggestions.style.display = 'none';

    const selectedCountry = countries.find((country) => country.name.common === countryName);
    if (selectedCountry) {
        renderCountries([selectedCountry]);
    }
}

// ===============================
// Event Listeners
// ===============================
/**
 * Initializes all event listeners
 */
function initializeEventListeners() {
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', function(e) {
            searchCountries(e.target.value);
        });
    }

    if (elements.regionFilter) {
        elements.regionFilter.addEventListener('change', function() {
            handleFilterChange('region');
        });
    }

    if (elements.languageFilter) {
        elements.languageFilter.addEventListener('change', function() {
            handleFilterChange('language');
        });
    }

    if (elements.showMore) {
        elements.showMore.addEventListener('click', showMoreCountries);
    }

    // Close search suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (
            elements.searchSuggestions &&
            !elements.searchSuggestions.contains(e.target) &&
            e.target !== elements.searchInput
        ) {
            elements.searchSuggestions.style.display = 'none';
        }
    });
}

// ===============================
// Initialize Application
// ===============================
document.addEventListener('DOMContentLoaded', function() {
    fetchCountries();
    initializeEventListeners();
});