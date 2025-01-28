// API base URL and constants
const baseUrl = 'https://restcountries.com/v3.1';
const FAVORITES_KEY = 'favoriteCountries';
const SEARCH_STATE_KEY = 'searchState';

// State management
let countries = [];
let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
let debounceTimer;
let currentPage = 1;
const pageSize = 12;
let currentFilter = null;
let searchState = {
    searchQuery: '',
    regionFilter: '',
    languageFilter: ''
};

// DOM Elements
const elements = {
    searchInput: document.getElementById('searchInput'),
    searchSuggestions: document.getElementById('searchSuggestions'),
    regionFilter: document.getElementById('regionFilter'),
    languageFilter: document.getElementById('languageFilter'),
    countriesGrid: document.getElementById('countriesGrid'),
    favoritesList: document.getElementById('favoritesList'),
    showMore: document.getElementById('showMore')
};

// Save and restore search state
const saveSearchState = () => {
    searchState = {
        searchQuery: elements.searchInput.value,
        regionFilter: elements.regionFilter.value,
        languageFilter: elements.languageFilter.value
    };
    localStorage.setItem(SEARCH_STATE_KEY, JSON.stringify(searchState));
};

const restoreSearchState = () => {
    const savedState = localStorage.getItem(SEARCH_STATE_KEY);
    if (savedState) {
        searchState = JSON.parse(savedState);
        elements.searchInput.value = searchState.searchQuery;
        elements.regionFilter.value = searchState.regionFilter;
        elements.languageFilter.value = searchState.languageFilter;
        
        // Apply saved filters
        if (searchState.searchQuery || searchState.regionFilter || searchState.languageFilter) {
            currentPage = 1;
            renderCountries(getPaginatedCountries());
        }
    }
};

// Fetch countries data
const fetchCountries = async () => {
    try {
        elements.countriesGrid.innerHTML = '<div class="loading">Loading countries...</div>';
        const response = await fetch(`${baseUrl}/all`);
        
        if (!response.ok) throw new Error('Failed to fetch countries');
        
        const data = await response.json();
        countries = data;
        
        renderCountries(getPaginatedCountries());
        populateLanguageFilter();
        populateRegionFilter();
        updateFavoritesList();
        restoreSearchState();
    } catch (error) {
        console.error('Error:', error);
        elements.countriesGrid.innerHTML = `
            <div class="error-message">
                <p>Failed to load countries. Please try again.</p>
                <button onclick="fetchCountries()">Retry</button>
            </div>`;
    }
};

// Render countries grid
const renderCountries = (countriesToShow) => {
    if (currentPage === 1) {
        elements.countriesGrid.innerHTML = '';
    }

    countriesToShow.forEach(country => {
        const countryCard = document.createElement('div');
        countryCard.className = 'country-card';
        
        const isFav = isFavorite(country);
        
        countryCard.innerHTML = `
            <div class="flag-container">
                <img src="${country.flags.png}" alt="${country.name.common} flag">
            </div>
            <div class="country-info">
                <h2 class="country-name">${country.name.common}</h2>
                <p class="country-detail"><strong>Region:</strong> ${country.region}</p>
                <p class="country-detail"><strong>Capital:</strong> ${country.capital?.[0] || 'N/A'}</p>
            </div>
            <div class="favorite-button-container">
                <button class="favorite-button${isFav ? ' active' : ''}">
                    ${isFav ? '★ Added to Favorites' : '☆ Add to Favorites'}
                </button>
            </div>`;

        // Event listeners
        const favButton = countryCard.querySelector('.favorite-button');
        favButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const success = toggleFavorite(country);
            if (success) {
                favButton.classList.toggle('active');
                favButton.textContent = favButton.classList.contains('active') 
                    ? '★ Added to Favorites' 
                    : '☆ Add to Favorites';
            }
        });

        countryCard.addEventListener('click', (e) => {
            if (!e.target.closest('.favorite-button')) {
                saveSearchState();
                navigateToDetails(country.name.common);
            }
        });
        
        elements.countriesGrid.appendChild(countryCard);
    });

    updateShowMoreButton();
};

// Pagination helpers
const getPaginatedCountries = () => {
    const filteredCountries = getFilteredCountries();
    const start = (currentPage - 1) * pageSize;
    return filteredCountries.slice(start, start + pageSize);
};

const updateShowMoreButton = () => {
    const totalCountries = getFilteredCountries().length;
    const displayedCountries = currentPage * pageSize;
    elements.showMore.style.display = displayedCountries < totalCountries ? 'block' : 'none';
};

// Favorites management
const isFavorite = (country) => 
    favorites.some(fav => fav.name.common === country.name.common);

const toggleFavorite = (country) => {
    const index = favorites.findIndex(fav => fav.name.common === country.name.common);
    
    if (index === -1) {
        if (favorites.length >= 5) {
            alert('You can only have up to 5 favorite countries.');
            return false;
        }
        favorites.push(country);
    } else {
        favorites.splice(index, 1);
    }
    
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    updateFavoritesList();
    return true;
};

// Filter and search functionality
const getFilteredCountries = () => {
    const searchQuery = elements.searchInput.value.toLowerCase();
    const regionValue = elements.regionFilter.value;
    const languageValue = elements.languageFilter.value;

    return countries.filter(country => {
        const matchesSearch = !searchQuery || 
            country.name.common.toLowerCase().includes(searchQuery);
            
        let matchesFilter = true;
        if (currentFilter === 'region' && regionValue) {
            matchesFilter = country.region === regionValue;
        } else if (currentFilter === 'language' && languageValue) {
            matchesFilter = country.languages && 
                Object.values(country.languages).includes(languageValue);
        }

        return matchesSearch && matchesFilter;
    });
};

const handleFilterChange = (filterType) => {
    currentFilter = filterType;
    
    if (filterType === 'region') {
        elements.languageFilter.value = '';
    } else if (filterType === 'language') {
        elements.regionFilter.value = '';
    }

    currentPage = 1;
    renderCountries(getPaginatedCountries());
};

const showMoreCountries = () => {
    currentPage++;
    renderCountries(getPaginatedCountries());
};

// Search functionality
const searchCountries = (query) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        if (!query) {
            elements.searchSuggestions.style.display = 'none';
            currentPage = 1;
            renderCountries(getPaginatedCountries());
            return;
        }

        const matchingCountries = countries.filter(country =>
            country.name.common.toLowerCase().includes(query.toLowerCase())
        );
        showSuggestions(matchingCountries, query);
    }, 300);
};

const showSuggestions = (results, query) => {
    if (!elements.searchSuggestions) return;

    if (results.length === 0) {
        elements.searchSuggestions.style.display = 'none';
        return;
    }

    const limitedResults = results.slice(0, 5);
    let suggestionsHTML = limitedResults.map(country => `
        <div class="suggestion-item" onclick="selectSuggestion('${country.name.common}')">
            ${country.name.common}
        </div>
    `).join('');

    // Always show View All if there are any results
    if (results.length > 0) {
        suggestionsHTML += `
            <div class="suggestion-item view-all" onclick="viewAllResults('${query}')">
                View all ${results.length} results
            </div>`;
    }

    elements.searchSuggestions.innerHTML = suggestionsHTML;
    elements.searchSuggestions.style.display = 'block';
};

const viewAllResults = (query) => {
    elements.searchInput.value = query;
    currentPage = 1;
    renderCountries(getPaginatedCountries());
    elements.searchSuggestions.style.display = 'none';
};

const selectSuggestion = (countryName) => {
    elements.searchInput.value = countryName;
    elements.searchSuggestions.style.display = 'none';
    currentPage = 1;
    renderCountries(getPaginatedCountries());
};

// Initialize event listeners
const initializeEventListeners = () => {
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', (e) => 
            searchCountries(e.target.value)
        );
    }

    if (elements.regionFilter) {
        elements.regionFilter.addEventListener('change', () => handleFilterChange('region'));
    }

    if (elements.languageFilter) {
        elements.languageFilter.addEventListener('change', () => handleFilterChange('language'));
    }

    if (elements.showMore) {
        elements.showMore.addEventListener('click', showMoreCountries);
    }

    document.addEventListener('click', (e) => {
        if (
            elements.searchSuggestions &&
            !elements.searchSuggestions.contains(e.target) &&
            e.target !== elements.searchInput
        ) {
            elements.searchSuggestions.style.display = 'none';
        }
    });
};

// Update favorites list
const updateFavoritesList = () => {
    if (!elements.favoritesList) return;

    if (favorites.length === 0) {
        elements.favoritesList.innerHTML = `
            <div class="no-favorites">
                <p>No favorite countries yet</p>
                <p>Click the star icon to add countries to your favorites</p>
            </div>`;
        return;
    }

    const favoritesHTML = favorites.map(country => `
        <div class="favorite-item" onclick="navigateToDetails('${country.name.common}')">
            <img src="${country.flags.png}" alt="${country.name.common} flag" class="favorite-flag">
            <div class="favorite-info">
                <p class="favorite-name">${country.name.common}</p>
                <p class="favorite-region">${country.region}</p>
            </div>
            <button class="remove-favorite" onclick="event.stopPropagation(); removeFavorite('${country.name.common}')">×</button>
        </div>
    `).join('');

    elements.favoritesList.innerHTML = favoritesHTML;
};

// Remove from favorites
const removeFavorite = (countryName) => {
    favorites = favorites.filter(fav => fav.name.common !== countryName);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    updateFavoritesList();
    renderCountries(getPaginatedCountries());
};

// Populate language filter
const populateLanguageFilter = () => {
    const languages = new Set(
        countries.flatMap(country => 
            country.languages ? Object.values(country.languages) : []
        )
    );

    elements.languageFilter.innerHTML = `
        <option value="">All Languages</option>
        ${[...languages].sort().map(lang => 
            `<option value="${lang}">${lang}</option>`
        ).join('')}`;
};

// Populate region filter
const populateRegionFilter = () => {
    const regions = new Set(countries.map(country => country.region));

    elements.regionFilter.innerHTML = `
        <option value="">All Regions</option>
        ${[...regions].sort().map(region => 
            `<option value="${region}">${region}</option>`
        ).join('')}`;
};

// Navigation
const navigateToDetails = (countryName) => {
    window.location.href = `details.html?country=${encodeURIComponent(countryName)}`;
};

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    await fetchCountries();
    initializeEventListeners();
    restoreSearchState(); // Move after fetchCountries to ensure data is loaded
});
