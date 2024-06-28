const API_KEY = "62620b75d1d1b2e18affe7571a49317a";

//selectors
const search = document.querySelector("#search");
const searchButton = document.querySelector("#search-button");
const currentLocation = document.querySelector("#get-current-location");

////Event Listeners//////

searchButton.addEventListener("click", () => handelSearch(search.value));
search.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    handelSearch();
  }
});
currentLocation.addEventListener("click", getCurrentLocation);

async function handelSearch() {
  const data = await fetchWether(search.value);
  displayWeather(data);
}

function kelvinToCelsius(kelvin) {
  return kelvin - 273.15;
}

////////////fetch wether from search/////////////////

async function fetchWether(name) {
  let data1 = [];
  let data2 = [];
  try {
    const req = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${name}&appid=${API_KEY}`
    );
    if (!req.ok) {
      throw new Error(`shandel: ${req.statusText}`);
    }
    const data = await req.json();
    data1 = data;
  } catch (err) {
    console.log("error", err);
  }

  try {
    const req = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${name}&appid=${API_KEY}`
    );
    if (!req.ok) {
      throw new Error(`shandel: ${req.statusText}`);
    }
    const data = await req.json();
    data2 = data;
  } catch (err) {
    console.log("error", err);
  }

  return { data1, data2 };
}

////////////////////current location////////////////////
function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      )
        .then((response) => response.json())
        .then(async (data) => {
          const res = await fetchWether(data.name);
          displayWeather(res);
        });
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
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
