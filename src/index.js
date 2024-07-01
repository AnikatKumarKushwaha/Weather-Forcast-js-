////////OpenWeatherMap Api//////////////
const API_KEY = "62620b75d1d1b2e18affe7571a49317a";

////////selectors/////////////
const search = document.querySelector("#search");
const searchButton = document.querySelector("#search-button");
const currentLocation = document.querySelector("#get-current-location");
const loadingSpinner = document.querySelector("#loadingSpinner");

////Click Event Listeners//////
searchButton.addEventListener("click", () => handelSearch(search.value));
////Key Press Event Listeners//////
search.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    handelSearch();
  }
});

///////////////click event listener//////////
currentLocation.addEventListener("click", getCurrentLocation);

//////////////Search Functionality///
async function handelSearch() {
  const data = await fetchWether(search.value);
  updateRecentSearch();
  displayWeather(data);
}

///////////////function to convertion kelvin to celcious//////////
function kelvinToCelsius(kelvin) {
  return kelvin - 273.15;
}

////////////fetch wether from search/////////////////
async function fetchWether(name) {
  let data1 = [];
  let data2 = [];
  turnOnSpinner();
  try {
    const req = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${name}&appid=${API_KEY}`
    );
    if (!req.ok) {
      throw new Error(`Error ${req.status}: ${req.statusText}`);
    }
    const data = await req.json();
    saveToLocalStorage(data.name);
    data1 = data;
  } catch (err) {
    turnOffSpinner();
    showPopupMessage(err.message);
    console.log("error", err.message);
  }

  try {
    const req = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${name}&appid=${API_KEY}`
    );
    if (!req.ok) {
      throw new Error(`Error ${req.status}: ${req.statusText}`);
    }
    const data = await req.json();
    data2 = data;
  } catch (err) {
    console.log("error", err.message);
  }
  turnOffSpinner();
  return { data1, data2 };
}

////////////////////current location function////////////////////
function getCurrentLocation() {
  turnOnSpinner();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      )
        .then((response) => response.json())
        .then(async (data) => {
          const res = await fetchWether(data.name);
          turnOffSpinner;
          displayWeather(res);
        });
    });
  } else {
    turnOffSpinner();
    alert("Geolocation is not supported by this browser.");
  }
}

////////////////////Save search to local storage//////////////////
function saveToLocalStorage(city) {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];

  cities = cities.filter((item) => item !== city);
  cities.unshift(city);
  if (cities.length > 5) {
    cities.pop();
  }
  localStorage.setItem("recentCities", JSON.stringify(cities));

  const recentCitiesContainer = document.querySelector(
    "#recent-cities-container"
  );
  if (cities.length === 0) {
    recentCitiesContainer.style.display = "none";
  } else {
    recentCitiesContainer.style.display = "block";
  }

  // Update the dropdown options
  updateRecentSearch();
}

//////// Update the dropdown options/////////
function updateRecentSearch() {
  const cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  const recentCitiesContainer = document.querySelector(
    "#recent-cities-container"
  );

  const dropdown = document.getElementById("select-place");

  // Clear existing options except the default one
  dropdown
    .querySelectorAll('option:not([value=""])')
    .forEach((option) => option.remove());

  if (cities.length === 0) {
    recentCitiesContainer.style.display = "none";
  } else {
    cities.forEach((city) => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      dropdown.appendChild(option);
    });
    recentCitiesContainer.style.display = "block";
  }

  // Add change event listener
  dropdown.addEventListener("change", handleCitySelection);
}

////////////function to select city from rescent search options/////////
async function handleCitySelection(event) {
  const selectedCity = event.target.value;
  if (selectedCity) {
    const data = await fetchWether(selectedCity);
    displayWeather(data);
  }
}

function loadRecentSearches() {
  updateRecentSearch();
}

///////when the screen load it update the recent search/////////
window.onload = () => {
  loadRecentSearches();
};

///////////////////Loading spinner functionality///////////////////
function turnOnSpinner() {
  loadingSpinner.style.display = "block";
}
function turnOffSpinner() {
  loadingSpinner.style.display = "none";
}

///////////////////Display data from search ///////////////////
function displayWeather({ data1, data2 }) {
  displayMainForcast(data1);
  display5DaysForcase(data2);
}

function displayMainForcast(data1) {
  const location = document.querySelector("#location");
  const mainTemp = document.querySelector("#main-temp");
  const weatherImg = document.querySelector("#main-weather-img");
  const weatherDescription = document.querySelector("#weather-description");
  const feelsLike = document.querySelector("#main-feels-like");
  const tempUp = document.querySelector("#temp-up");
  const tempDown = document.querySelector("#temp-down");
  const windSpeed = document.querySelector("#main-wind-speed");
  const humidity = document.querySelector("#humidity-bar");
  const clouds = document.querySelector("#clouds-bar");

  location.innerHTML = data1.name;
  mainTemp.innerHTML = kelvinToCelsius(data1.main.temp).toFixed(1);
  weatherDescription.innerHTML = data1.weather[0].description;
  feelsLike.innerHTML = kelvinToCelsius(data1.main.feels_like).toFixed(1);
  tempUp.innerHTML = kelvinToCelsius(data1.main.temp_max).toFixed(1);
  tempDown.innerHTML = kelvinToCelsius(data1.main.temp_min).toFixed(1);
  windSpeed.innerHTML = data1.wind.speed;
  weatherImg.src = `http://openweathermap.org/img/wn/${data1.weather[0].icon}@2x.png`;
  clouds.style.width = `${data1.clouds.all}%`;
  humidity.style.width = `${data1.main.humidity}%`;
}

/////////////////Display 5 days forcast data////////////////
function display5DaysForcase(data) {
  const forcastDays = document.querySelector("#forcast-days");
  console.log(data);
  const forecastList = data.list.filter((_, index) => index % 8 === 0);
  console.log(forecastList);

  let forecastHTML = ""; // Accumulate forecast HTML

  forecastList.forEach((forcast) => {
    const date = new Date(forcast.dt_txt);
    const forecastData = `
      <div class="shadow-lg bg-violet-400 text-violet-50 rounded-md py-4 px-6 text-sm">
        <div class="">${new Date(forcast.dt_txt)
          .toLocaleDateString()
          .replaceAll("/", "-")}</div>
        <div class="text-center text-2xl my-2">
          <img
            id="main-weather-img"
            class="h-16 inline-block object-cover object-center"
            src="https://openweathermap.org/img/wn/${
              forcast.weather[0].icon
            }@2x.png"
            alt="weather"
          />
          ${kelvinToCelsius(forcast.main.temp).toFixed(1)}<sup>&deg;</sup>C
        </div>
        <div>Wind:<span class="ml-2">${forcast.wind.speed} m/s</span></div>
        <div>Humidity:<span class="ml-2">${forcast.main.humidity}%</span></div>
      </div>`;
    forecastHTML += forecastData; // Accumulate HTML
  });

  forcastDays.innerHTML = forecastHTML; // Set innerHTML once
}

/////////////////show error message on pop up/////////////////
function showPopupMessage(message) {
  const popup = document.getElementById("popup-message");
  if (message === "Error 404: Not Found") {
    message = "Please enter a valid city name.";
  } else if (message === "Failed to fetch") {
    message = "No internet connection or an error occurred. Please try again.";
  }
  popup.innerHTML = `
    <span class="text-red-500 text-lg mr-4">
      <i class="fa-regular fa-circle-xmark"></i>
    </span>
    ${message}
  `;

  popup.style.visibility = "visible";
  popup.style.opacity = 1;

  setTimeout(() => {
    popup.style.opacity = 0;
    popup.style.visibility = "hidden";
  }, 3000);
}
