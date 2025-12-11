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