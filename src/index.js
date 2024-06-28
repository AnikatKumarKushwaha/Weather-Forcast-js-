const API_KEY = "62620b75d1d1b2e18affe7571a49317a";

//selectors
const search = document.querySelector("#search");
const searchButton = document.querySelector("#search-button");
const currentLocation = document.querySelector("#get-current-location");

////Event Listeners//////

searchButton.addEventListener("click", handelSearch);
search.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    handelSearch();
  }
});
currentLocation.addEventListener("click", getCurrentLocation);

async function handelSearch() {
  const data = await fetchWether();
  displayWeather(data);
}

////////////fetch wether from search/////////////////

async function fetchWether() {
  let data1 = [];
  let data2 = [];
  try {
    const req = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${search.value}&appid=${API_KEY}`
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
      `https://api.openweathermap.org/data/2.5/forecast?q=${search.value}&appid=${API_KEY}`
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

function kelvinToCelsius(kelvin) {
  return kelvin - 273.15;
}

///////////////////Display data from search ///////////////////
function displayWeather({ data1, data2 }) {
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
  console.log(data1.clouds.all);

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

////////////////////current location////////////////////
function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      )
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
        });
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}
