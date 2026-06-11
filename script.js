const apiKey = "5783352b19d69a6484ef8a3cb9dc7da4";
let weatherChart;
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const saveCityBtn =
document.getElementById("saveCityBtn");

saveCityBtn.addEventListener(
    "click",
    saveCity
);

// Search Button
searchBtn.addEventListener("click", () => {
    getWeather(cityInput.value.trim());
});

// Enter Key
cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        getWeather(cityInput.value.trim());
    }
});

const loader =
document.getElementById("loader");

function showLoader(){
    loader.style.display = "flex";
}

function hideLoader(){
    loader.style.display = "none";
}

// Get Current Weather
async function getWeather(city) {

    if (!city) {
        alert("Please enter a city.");
        return;
    }

    try {

        showLoader();

        const url =
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

        showLoader();

        const response = await fetch(url);

        const data = await response.json();

        if (data.cod != 200) {
            hideLoader();
            alert("City not found.");
            return;
        }
        

        // Current Weather

        document.getElementById("cityName").innerText =
        data.name;

        document.getElementById("temperature").innerText =
        Math.round(data.main.temp) + "°C";

        document.getElementById("description").innerText =
        data.weather[0].description;

        updateBackground(
    data.weather[0].main
);

        document.getElementById("humidity").innerText =
        data.main.humidity + "%";

        document.getElementById("wind").innerText =
        data.wind.speed + " km/h";

        document.getElementById("pressure").innerText =
        data.main.pressure + " hPa";

        document.getElementById("visibility").innerText =
        (data.visibility / 1000) + " km";

        // Weather Icon

        const icon = data.weather[0].icon;

        document.getElementById("weatherIcon").src =
        `https://openweathermap.org/img/wn/${icon}@2x.png`;

        // Sunrise / Sunset

        const sunrise =
        new Date(data.sys.sunrise * 1000);

        const sunset =
        new Date(data.sys.sunset * 1000);

        document.getElementById("sunrise").innerText =
        sunrise.toLocaleTimeString();

        document.getElementById("sunset").innerText =
        sunset.toLocaleTimeString();

        // Load Forecast

        getForecast(city);

        hideLoader();

    } catch (error) {

        console.error(error);

        hideLoader();

        alert("Something went wrong.");

    }

}

// Get 5-Day Forecast

async function getForecast(city) {

    try {

        const url =
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

        const response = await fetch(url);

        const data = await response.json();

        const forecastContainer =
        document.getElementById("forecast5days");

        const hourlyContainer =
document.getElementById("hourlyForecast");

hourlyContainer.innerHTML = "";

        forecastContainer.innerHTML = "";
        const chartLabels = [];
const chartTemps = [];

        for(let i = 0; i < 8; i++){

    const hour =
    data.list[i];

    const hourlyCard =
    document.createElement("div");

    hourlyCard.classList.add(
        "forecast-item"
    );

    hourlyCard.innerHTML = `
        <h4>
            ${new Date(hour.dt_txt)
            .toLocaleTimeString([],{
                hour:"numeric"
            })}
        </h4>

        <img src="
        https://openweathermap.org/img/wn/${hour.weather[0].icon}.png">

        <p>
            ${Math.round(hour.main.temp)}°C
        </p>
    `;

    hourlyContainer.appendChild(
        hourlyCard
    );
}

        // One forecast per day

        for (let i = 0; i < data.list.length; i += 8) {

            const day = data.list[i];

            const card =
            document.createElement("div");

            card.classList.add("forecast-item");

            card.innerHTML = `
                <h4>${new Date(day.dt_txt).toLocaleDateString()}</h4>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
                <p>${Math.round(day.main.temp)}°C</p>
                <p>${day.weather[0].main}</p>
            `;

            chartLabels.push(
    new Date(day.dt_txt)
    .toLocaleDateString()
);

chartTemps.push(
    Math.round(day.main.temp)
);

            forecastContainer.appendChild(card);

        }

        createChart(
    chartLabels,
    chartTemps
);

    } catch (error) {

        console.error(error);

    }

}


const locationBtn =
document.getElementById("locationBtn");

locationBtn.addEventListener("click", () => {

    if(navigator.geolocation){

        navigator.geolocation.getCurrentPosition(
            getPosition,
            showError
        );

    }else{

        alert("Geolocation not supported");

    }

});

async function getPosition(position){

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    try{

        const url =
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

        const response =
        await fetch(url);

        const data =
        await response.json();

        cityInput.value =
        data.name;

        getWeather(data.name);

    }catch(error){

        console.log(error);

    }

}

function showError(){

    alert("Location access denied.");

}

function createChart(labels, temps){

    const ctx =
    document.getElementById("weatherChart");

    if(weatherChart){
        weatherChart.destroy();
    }

    weatherChart = new Chart(ctx, {

        type: "line",

        data: {

            labels: labels,

            datasets: [{
                label: "Temperature °C",

                data: temps,

                tension: 0.4,

                fill: false
            }]
        },

        options: {

            responsive: true,

            plugins: {
                legend: {
                    labels: {
                        color: "white"
                    }
                }
            },

            scales: {

                x: {
                    ticks: {
                        color: "white"
                    }
                },

                y: {
                    ticks: {
                        color: "white"
                    }
                }
            }
        }
    });

}

function saveCity() {

    const city =
    document.getElementById("cityName").innerText;

    if (!city || city === "City") return;

    let favorites =
    JSON.parse(localStorage.getItem("favorites")) || [];

    if (!favorites.includes(city)) {

        favorites.push(city);

        localStorage.setItem(
            "favorites",
            JSON.stringify(favorites)
        );

        loadFavorites();
    }
}

function loadFavorites() {

    const favoritesDiv =
    document.getElementById("favorites");

    favoritesDiv.innerHTML = "";

    let favorites =
    JSON.parse(localStorage.getItem("favorites")) || [];

    favorites.forEach(city => {

        const btn =
        document.createElement("button");

        btn.classList.add("favorite-city");

        btn.innerText = city;

        btn.addEventListener("click", () => {
            cityInput.value = city;
            getWeather(city);
        });

        favoritesDiv.appendChild(btn);
    });
}

function updateBackground(weatherMain){

    document.body.classList.remove(
        "clear-weather",
        "cloud-weather",
        "rain-weather",
        "night-weather"
    );

    switch(weatherMain){

        case "Clear":
            document.body.classList.add(
                "clear-weather"
            );
            break;

        case "Clouds":
            document.body.classList.add(
                "cloud-weather"
            );
            break;

        case "Rain":

        case "Drizzle":

        case "Thunderstorm":
            document.body.classList.add(
                "rain-weather"
            );
            break;

        default:
            document.body.classList.add(
                "night-weather"
            );
    }
}

window.addEventListener("load", () => {

    getWeather("Agartala");

    loadFavorites();

    const savedTheme =
    localStorage.getItem("theme");

    if(savedTheme === "light"){

        document.body.classList.add(
            "light-mode"
        );

        themeBtn.innerText = "☀️";

    }

});

const themeBtn =
document.getElementById("themeBtn");

themeBtn.addEventListener(
    "click",
    toggleTheme
);

function toggleTheme(){

    document.body.classList.toggle(
        "light-mode"
    );

    if(
        document.body.classList.contains(
            "light-mode"
        )
    ){

        themeBtn.innerText = "☀️";

        localStorage.setItem(
            "theme",
            "light"
        );

    }else{

        themeBtn.innerText = "🌙";

        localStorage.setItem(
            "theme",
            "dark"
        );

    }

}