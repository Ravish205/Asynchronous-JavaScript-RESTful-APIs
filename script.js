const DOM = {
    cityInput: document.getElementById('city-input'),
    searchBtn: document.getElementById('search-btn'),
    errorMessage: document.getElementById('error-message'),
    weatherInfo: document.getElementById('weather-info'),
    cityName: document.getElementById('city-name'),
    temperature: document.getElementById('temperature'),
    description: document.getElementById('weather-description'),
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('wind-speed'),
    loading: document.getElementById('loading')
};

// Open-Meteo weather codes mapping (WMO Weather interpretation codes)
const weatherCodes = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
};

async function getCoordinates(city) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error('Failed to connect to geocoding service.');
    }
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
        throw new Error('City not found. Please check the spelling.');
    }
    
    return {
        lat: data.results[0].latitude,
        lon: data.results[0].longitude,
        name: data.results[0].name,
        country: data.results[0].country
    };
}

async function getWeatherData(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error('Failed to fetch weather data.');
    }
    
    return await response.json();
}

function updateUI(location, weather) {
    DOM.cityName.textContent = `${location.name}${location.country ? `, ${location.country}` : ''}`;
    
    // Parse nested JSON from Open-Meteo current object
    const current = weather.current;
    
    DOM.temperature.textContent = Math.round(current.temperature_2m);
    DOM.humidity.textContent = `${current.relative_humidity_2m}%`;
    DOM.windSpeed.textContent = `${current.wind_speed_10m} km/h`;
    
    // Map weather code to description
    const description = weatherCodes[current.weather_code] || 'Unknown conditions';
    DOM.description.textContent = description;
    
    DOM.weatherInfo.classList.remove('hidden');
}

function showError(message) {
    DOM.errorMessage.textContent = message;
    DOM.errorMessage.classList.remove('hidden');
    DOM.weatherInfo.classList.add('hidden');
}

function clearState() {
    DOM.errorMessage.classList.add('hidden');
    DOM.weatherInfo.classList.add('hidden');
}

function toggleLoading(isLoading) {
    if (isLoading) {
        DOM.loading.classList.remove('hidden');
    } else {
        DOM.loading.classList.add('hidden');
    }
}

async function handleSearch() {
    const city = DOM.cityInput.value.trim();
    if (!city) return;
    
    clearState();
    toggleLoading(true);
    
    try {
        const location = await getCoordinates(city);
        const weather = await getWeatherData(location.lat, location.lon);
        updateUI(location, weather);
    } catch (error) {
        showError(error.message);
    } finally {
        toggleLoading(false);
    }
}

// Event Listeners
DOM.searchBtn.addEventListener('click', handleSearch);

DOM.cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});
