const state = {
    secondsOnSite: 0,
    theme: "light",
    showWeather: true,
    showProjects: true, 
    weather: null,
    filteredWeather: null
};

const projectsData = [
    { id: 1, title: "Portfolio v1", desc: "Static portfolio site", category: "web", date: "2024-08-01"},
    { id: 2, title: "Network Packet Sniffer", desc: "A Python tool to capture and analyze TCP/IP packets.", category: "network", date: "2025-01-15" },
    { id: 3, title: "AES Encryption Tool", desc: "Secure file encryption software implemented in Java.", category: "security", date: "2023-11-02" },
];

const themeToggleBtn = document.getElementById("theme-toggle");
const toggleProjectsBtn = document.getElementById("toggle-projects");
const toggleWeatherBtn = document.getElementById("toggle-weather"); 
const timeOnSiteSpan = document.getElementById("time-on-site");
const greeting = document.getElementById("greeting");

const visitorNameInput = document.getElementById("visitor-name");
const saveNameBtn = document.getElementById("save-name");

const weatherForm = document.getElementById("weather-form");
const cityInput = document.getElementById("city-input");
const weatherResult = document.getElementById("weather-result");
const weatherError = document.getElementById("weather-error");
const tempFilterSelect = document.getElementById("temp-filter");
const conditionFilterSelect = document.getElementById("condition-filter");
const weatherSection = document.getElementById("weather");

const projectsSection = document.getElementById("projects");
const projectList = document.getElementById("project-list");
const searchInput = document.getElementById("search-projects");
const filterCategory = document.getElementById("filter-category");
const sortSelect = document.getElementById("sort-projects");
const noProjectsMsg = document.getElementById("no-projects");

const fetchQuoteBtn = document.getElementById("fetch-quote");
const quoteResult = document.getElementById("quote-result");

const contactForm = document.getElementById("contact-form");
const contactNameInput = document.getElementById("contact-name");
const contactEmailInput = document.getElementById("contact-email");
const contactMessageInput = document.getElementById("contact-message");
const contactSubmitBtn = document.getElementById("contact-submit");
const contactSuccess = document.getElementById("contact-success");

const contactNameError = document.getElementById("contact-name-error");
const contactEmailError = document.getElementById("contact-email-error");
const contactMessageError = document.getElementById("contact-message-error");

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initName();
    startTimer();
    renderProjects(getFilteredProjects()); 
    setupEventListeners();
});

function initTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme == "dark") {
        document.body.classList.add("dark");
        state.theme = "dark";
        themeToggleBtn.textContent = "Switch to Light Mode";
    } else{
        state.theme = "light";
        themeToggleBtn.textContent = "Switch to Dark Mode";
    }
}

function toggleTheme() {
    if (state.theme === "light"){
        state.theme = "dark";
        document.body.classList.add("dark");
        themeToggleBtn.textContent = "Switch to Light Mode";
    } else {
        state.theme = "light";
        document.body.classList.remove("dark");
        themeToggleBtn.textContent = "Switch to Dark Mode";
    }
    localStorage.setItem("theme", state.theme);
}

function initName() {
    const savedName = localStorage.getItem("visitorName");
    if (savedName) {
        greeting.textContent = `Welcome back, ${savedName}!`;
        visitorNameInput.value = savedName;
    }
}

function saveName() {
    const name = visitorNameInput.value.trim();
    if (name.length > 0){
        localStorage.setItem("visitorName", name);
        greeting.textContent = `Welcome, ${name}`;
    }
}

function startTimer(){
    setInterval(() => {
        state.secondsOnSite += 1;
        timeOnSiteSpan.textContent = state.secondsOnSite.toString();
    }, 1000);
}

function toggleProjectsVisibility() {
    state.showProjects = !state.showProjects;
    projectsSection.hidden = !state.showProjects;
    toggleProjectsBtn.textContent = state.showProjects ? "Hide Projects" : "Show Projects";
}

function toggleWeatherVisibility() {
    state.showWeather = !state.showWeather;
    weatherSection.hidden = !state.showWeather;
    toggleWeatherBtn.textContent = state.showWeather ? "Hide Weather" : "Show Weather";
}

function handleWeatherSubmit(event){
    event.preventDefault();
    const city = cityInput.value.trim();
    if (!city) return;
    fetchWeather(city);
}


async function fetchWeather(city) {
    weatherError.hidden = true;
    weatherError.textContent = "";
    weatherResult.innerHTML = "<p>Loading weather...</p>";

    const encodedCity = encodeURIComponent(city);
    const url = `https://wttr.in/${encodedCity}?format=j1`;
    
    try {
        const response = await fetch(url);
        if (!response.ok){
            throw new Error("No current condition data found.");
        }

        const data = await response.json();
        const current = data.current_condition && data.current_condition[0];
        if (!current){
            throw new Error("No current condition data found.");
        }

        state.weather = {
            city: city,
            temperatureC: parseFloat(current.temp_C),
            feelsLikeC: parseFloat(current.FeelsLikeC),
            description:
                current.weatherDesc && current.weatherDesc[0]
                    ? current.weatherDesc[0].value
                    : "N/A",
            humidity: parseFloat(current.humidity),
            windKph: parseFloat(current.windspeedKmph)
        };

        applyWeatherFilters();
        renderWeather();
    } catch (error) {
        console.error("Weather error:", error);
        weatherResult.innerHTML = "";
        weatherError.hidden = false;
        weatherError.textContent = "Could not load weather data. Please try another city or try again later.";
    }
}

function applyWeatherFilters() {
    if (!state.weather) {
        state.filteredWeather = null;
        return;
    }

    const tempFilter = tempFilterSelect.value;
    const conditionFilter = conditionFilterSelect.value;
    const w = state.weather;

    let passesTemp = true;
    let passesCondition = true;

    if (!isNaN(w.temperatureC)) {
        if (tempFilter === "hot") {
            passesTemp = w.temperatureC >= 30;
        } else if (tempFilter === "warm") {
            passesTemp = w.temperatureC >= 20 && w.temperatureC <= 29;
        } else if (tempFilter === "cold"){
            passesTemp = w.temperatureC < 20;
        }
    }

    const descLower = (w.description || "").toLowerCase();
    if (conditionFilter === "clear") {
        passesCondition = descLower.includes("clear") || descLower.includes("sunny");
    } else if (conditionFilter === "cloud") {
        passesCondition = descLower.includes("cloud");
    } else if (conditionFilter === "rain") {
        passesCondition = descLower.includes("rain");
    }

    if (passesTemp && passesCondition) {
        state.filteredWeather = w;
    } else {
        state.filteredWeather = null;
    }
}

function renderWeather() {
    if (!state.weather) {
        weatherResult.innerHTML = "<p>No weather data available. Please search for a city.</p>";
        return;
    }

    if (!state.filteredWeather){
        weatherResult.innerHTML = "<p>No results for the selected filters.</p>";
        return;
    }

    const w = state.filteredWeather;
    let feelsMessage = "";

    if (!isNaN(w.temperatureC) && !isNaN(w.feelsLikeC)) {
        const diff = w.feelsLikeC - w.temperatureC;
        if (diff >= 3){
            feelsMessage = "It feels hotter than the actual temperature.";
        } else if (diff  <= -3) {
            feelsMessage = "It feels colder than the actual temperature.";
        } else {
            feelsMessage = "It feels close to the actual temperature.";
        }
    }

    weatherResult.innerHTML = `<div id="weather-result-card">
            <h3>Weather in ${w.city}</h3>
            <p><strong>Temperature:</strong> ${w.temperatureC} &deg;C</p>
            <p><strong>Feels Like:</strong> ${w.feelsLikeC} &deg;C</p>
            <p><strong>Condition:</strong> ${w.description}</p>
            <p><strong>Humidity:</strong> ${w.humidity}%</p>
            <p><strong>Wind speed:</strong> ${w.windKph} km/h</p>
            <p>${feelsMessage}</p>
            </div>
        `;
}


function getFilteredProjects() {
    const q = searchInput.value.trim().toLowerCase();
    const cat = filterCategory.value;
    const sort = sortSelect.value;

    let list = projectsData.filter(p => {
        const matchesQ = !q || (p.title + ' ' + p.desc).toLowerCase().includes(q);
        const matchesCat = cat === 'all' ? true : p.category === cat;
        return matchesQ && matchesCat;
    });

    if (sort === 'title') {
        list.sort((a,b)=> a.title.localeCompare(b.title));
    } else {
        list.sort((a,b)=> new Date(b.date) - new Date(a.date));
    }
    return list;
}

function renderProjects(list) {
    projectList.innerHTML = '';
    if (!list.length) {
        noProjectsMsg.hidden = false;
        return;
    } else {
        noProjectsMsg.hidden = true;
    }

    list.forEach(p => {
        const li = document.createElement('li');
        li.className = 'project-item';
        
        const escapeHtml = (unsafe) => {
            return String(unsafe).replace(/[&<>"'`]/g, (s) => ({
            '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;', '`':'&#96;'
            })[s]);
        };

        li.innerHTML = `
            <div>
                <strong>${escapeHtml(p.title)}</strong>
                <div class="project-meta">${p.category} • ${p.date}</div>
            </div>
            <div class="project-body">${escapeHtml(p.desc)}</div>
            <button class="btn-toggle">Show Details</button>
            <div class="project-details" hidden style="margin-top:0.5rem; font-style:italic; color:var(--accent-color);">
                ${escapeHtml('More detailed info about ' + p.title + '...')}
            </div>
        `;
        
        const toggleBtn = li.querySelector('.btn-toggle');
        const detailsDiv = li.querySelector('.project-details');
        
        toggleBtn.addEventListener('click', () => {
            const isHidden = detailsDiv.hidden;
            detailsDiv.hidden = !isHidden;
            toggleBtn.textContent = isHidden ? "Hide Details" : "Show Details";
        });

        projectList.appendChild(li);
    });
}

async function fetchQuote() {
    quoteResult.textContent = 'Loading...';
    try {
        const res = await fetch('https://api.quotable.io/random', { cache: 'no-store' });
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        quoteResult.textContent = `"${data.content}" — ${data.author}`;
    } catch (err) {
        console.warn('Quote fetch failed:', err);
        const fallback = [
            'Simplicity is the soul of efficiency. — Anonymous',
            'Done is better than perfect. — Anonymous',
            'Small progress is still progress. — Anonymous'
        ];
        quoteResult.textContent = fallback[Math.floor(Math.random() * fallback.length)];
    }
}


function validateContactForm() {
  let isValid = true;

  if (contactNameInput.value.trim().length === 0) {
    contactNameError.textContent = 'Name is required.';
    isValid = false;
  } else {
    contactNameError.textContent = '';
  }

  const email = contactEmailInput.value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email.length === 0) {
    contactEmailError.textContent = 'Email is required.';
    isValid = false;
  } else if (!emailPattern.test(email)) {
    contactEmailError.textContent = 'Please enter a valid email address.';
    isValid = false;
  } else {
    contactEmailError.textContent = '';
  }

  if (contactMessageInput.value.trim().length === 0) {
    contactMessageError.textContent = 'Message is required.';
    isValid = false;
  } else {
    contactMessageError.textContent = '';
  }

  contactSubmitBtn.disabled = !isValid;
  return isValid;
}

function handleContactSubmit(event) {
  event.preventDefault();
  const ok = validateContactForm();
  if (!ok) return;

  contactSuccess.textContent =
    'Thank you! Your message has been sent (simulation).';
  contactForm.reset();
  contactSubmitBtn.disabled = true;
}

function setupEventListeners() {
  themeToggleBtn.addEventListener('click', toggleTheme);
  
  toggleProjectsBtn.addEventListener('click', toggleProjectsVisibility);
  toggleWeatherBtn.addEventListener('click', toggleWeatherVisibility);

  saveNameBtn.addEventListener('click', saveName);

  weatherForm.addEventListener('submit', handleWeatherSubmit);
  tempFilterSelect.addEventListener('change', () => {
    applyWeatherFilters();
    renderWeather();
  });
  conditionFilterSelect.addEventListener('change', () => {
    applyWeatherFilters();
    renderWeather();
  });

  searchInput.addEventListener('input', () => renderProjects(getFilteredProjects()));
  filterCategory.addEventListener('change', () => renderProjects(getFilteredProjects()));
  sortSelect.addEventListener('change', () => renderProjects(getFilteredProjects()));

  fetchQuoteBtn.addEventListener('click', fetchQuote);

  contactNameInput.addEventListener('input', validateContactForm);
  contactEmailInput.addEventListener('input', validateContactForm);
  contactMessageInput.addEventListener('input', validateContactForm);
  contactForm.addEventListener('submit', handleContactSubmit);
}