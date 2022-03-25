import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore/lite';
import { firebaseConfig } from "./firebaseConfig";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const CURRENT_DATE = new Date();
const CURRENT_MONTH = CURRENT_DATE.getMonth(); // gives 0:11
const CURRENT_DAY = CURRENT_DATE.getDate();
const CURRENT_YEAR = CURRENT_DATE.getFullYear();

const FRAME_LENGTH = 600;
const FRAME_HEIGHT = 600;
const CENTER_X = FRAME_LENGTH / 2;
const CENTER_Y = FRAME_HEIGHT / 2;

const NUM_HABITS = 3;

const theme1 = {
    color50: "#FFF8E1",
    color100: "#FFECB3",
    color200: "#FFD54F",
    color400: "#FFCA28",
    color600: "#FFB300",
    color800: "#FF8F00",
    color900: "#FF6F00"
};

const theme2 = {
    color50: "#FCE4EC",
    color100: "#F8BBD0",
    color200: "#F06292",
    color400: "#EC407A",
    color600: "#D81B60",
    color800: "#AD1457",
    color900: "#880E4F"
};

const theme3 = {
    color50: "#F3E5F5",
    color100: "#E1BEE7",
    color200: "#BA68C8",
    color400: "#AB47BC",
    color600: "#8E24AA",
    color800: "#6A1B9A",
    color900: "#4A148C"
};

const theme4 = {
    color50: "#E3F2FD",
    color100: "#BBDEFB",
    color200: "#64B5F6",
    color400: "#42A5F5",
    color600: "#1E88E5",
    color800: "#1565C0",
    color900: "#0D47A1"
};

const theme5 = {
    color50: "#E0F2F1",
    color100: "#B2EBF2",
    color200: "#4DD0E1",
    color400: "#26C6DA",
    color600: "#00ACC1",
    color800: "#00838F",
    color900: "#006064"
};

const theme6 = {
    color50: "#F1F8E9",
    color100: "#DCEDC8",
    color200: "#AED581",
    color400: "#9CCC65",
    color600: "#7CB342",
    color800: "#558B2F",
    color900: "#33691E"
};

const HABIT_1_RADIUS = 12;
const HABIT_2_RADIUS = 10;
const HABIT_3_RADIUS = 8;

// const BACKEND_API_URL = "http://localhost:8080/api/habits/";
const BACKEND_API_URL = "https://habit-tracker-api-dot-arhuber.wl.r.appspot.com/api/habits/";
const MOTIVATIONAL_MESSAGE_URL = "http://localhost:3001/motivation";
const MOTIVATIONAL_DELAY = 20 * 1000; // milliseconds

const MONTHS_ARRAY = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];

// global variable to change animations for after firstAppInialization:
let firstAppInitialization = true;

loadApp();

function loadApp() {
    setTrackerTitle();
    setDateOnTracker(CURRENT_YEAR, getMonthName(CURRENT_MONTH));
    placeDayText();
    placeAllDots();
    placeHashMarks();
    setDateModalListener();
    setHabitDeleteModalListeners();
    getHabitTrackerDataFromDatabase(CURRENT_YEAR, getMonthName(CURRENT_MONTH));
    setDotClickListener();
    setDateSelectorProperties();
    setHabitHoverAndClickEvents();
    setInfoIconProperties();
    setSettingsIconProperties();
    getHabitMotivationMessage();
    setInterval(getHabitMotivationMessage, MOTIVATIONAL_DELAY);
    setColorTheme(theme5);
    setColorThemeHoverEvents();
}

function setTrackerTitle() {
    document.getElementById("trackerTitle").textContent = "Habit Tracker";
}

function setDateOnTracker(year, month) {
    let monthText = document.getElementById("month");
    monthText.textContent = month;

    let yearText = document.getElementById("year");
    yearText.textContent = year;
}

function setDotClickListener() {
    document.addEventListener(
        "click",
        function (event) {
            if (!event.target.closest("circle")) return;
            toggleVisibility(event.target);
            getDotDayAndHabitInfo(event.target);
        },
        false
    );
}

function setInfoIconProperties() {
    let infoIconSelectorArea = document.getElementById("info_selector_area");
    let infoIconLight = document.getElementById("info_icon_light");
    let infoIconDark = document.getElementById("info_icon_dark");

    infoIconSelectorArea.addEventListener("mousemove", () => {
        infoIconLight.style.opacity = 0;
        infoIconDark.style.opacity = 1;
        document.body.style.cursor = 'pointer';
    }, false);

    infoIconSelectorArea.addEventListener("mouseleave", () => {
        infoIconDark.style.opacity = 0;
        infoIconLight.style.opacity = 1;
        document.body.style.cursor = 'default';
    }, false);

    infoIconSelectorArea.addEventListener("click", () => {
        var myModal = new bootstrap.Modal(document.getElementById("infoModal"), {
            keyboard: false
        });
        myModal.show();
    }, false);
}

function setSettingsIconProperties() {
    let settingsIconSelectorArea = document.getElementById("settings_selector_area");
    let settingsIconLight = document.getElementById("settings_icon_light");
    let settingsIconDark = document.getElementById("settings_icon_dark");

    settingsIconSelectorArea.addEventListener("mousemove", () => {
        settingsIconLight.style.opacity = 0;
        settingsIconDark.style.opacity = 1;
        document.body.style.cursor = 'pointer';
    }, false);

    settingsIconSelectorArea.addEventListener("mouseleave", () => {
        settingsIconDark.style.opacity = 0;
        settingsIconLight.style.opacity = 1;
        document.body.style.cursor = 'default';
    }, false);

    settingsIconSelectorArea.addEventListener("click", () => {
        var myModal = new bootstrap.Modal(document.getElementById("settingsModal"), {
            keyboard: false
        });
        myModal.show();
    }, false);
}

function setDateModalListener() {
    let dateSaveButton = document.getElementById("dateBtnSave");
    dateSaveButton.addEventListener("click", () => {
        let monthSelected = document.getElementById("monthSelector").value;
        let yearSelected = document.getElementById("yearSelector").value;

        // protect against incorrect entry and reset:
        if (monthSelected === "Select a month..." ||
            yearSelected === "Select a year...") {
            monthSelected = "Select a month...";
            yearSelected = "Select a year...";
            return;
        }

        setDateOnTracker(yearSelected, monthSelected);
        removeClassFromTracker("hashMark");
        removeClassFromTracker("dayText");
        removeClassFromTracker("dot");
        removeClassFromTracker("dotClicked");
        placeAllDots();
        placeHashMarks();
        placeDayText();
        getHabitTrackerDataFromDatabase(yearSelected, monthSelected);

    }, false);
}

function setDateSelectorProperties() {
    let dateSelectorArea = document.getElementById("date_selector_area");
    let monthText = document.getElementById("month");
    let yearText = document.getElementById("year");

    dateSelectorArea.addEventListener("mousemove", () => {
        document.body.style.cursor = 'pointer';
        monthText.style.fill = getCurrentColorTheme().color900;
        // yearText.style.fill = getCurrentColorTheme().color50;
    }, false);

    dateSelectorArea.addEventListener("mouseleave", () => {
        document.body.style.cursor = 'default';
        monthText.style.fill = getCurrentColorTheme().color800;
        // yearText.style.fill = getCurrentColorTheme().color100;
    }, false);

    dateSelectorArea.addEventListener("click", () => {
        var myModal = new bootstrap.Modal(document.getElementById("dateModal"), {
            keyboard: false
        });
        myModal.show();
    }, false);
}


function getMonthName(num) {
    if (num < 0 || num > 11) {
        return "";
    }
    return MONTHS_ARRAY[num];
}

function getMonthNum(name) {
    for (let i = 0; i < MONTHS_ARRAY.length; i++) {
        if (MONTHS_ARRAY[i] === name) {
            return i + 1;
        }
    }
    return 0;
}

// returns XY coords of given an angle and radius of a circle:
function getXYCoords(radius, angle) {
    const radian = angle * 0.0174532925;

    const x = CENTER_X + radius * Math.cos(radian);
    const y = CENTER_Y - radius * Math.sin(radian);

    return new Array(x, y);
}

function attrText(coords1, coords2) {
    return `M ${coords1[0]} ${coords1[1]} L ${coords2[0]} ${coords2[1]}`;
}

function createHashMark(coords1, coords2, hashIncr) {
    let svg = document.getElementsByTagName("svg")[1]; //Get svg element
    let newElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
    ); //Create a path in SVG's namespace
    newElement.setAttribute("d", attrText(coords1, coords2)); //Set path's data
    // first and last hash to be dark border:
    if (coords1[0] < 151 || coords1[1] < 151) {
        newElement.classList.add("darkHashMark");
    } else {
        newElement.classList.add("lightHashMark");
    }

    if (!firstAppInitialization) {
        document.documentElement.style.setProperty("--hash-mark-delay", "0s");
    }

    newElement.style.setProperty("--order", hashIncr);
    newElement.classList.add("hashMark");

    svg.appendChild(newElement);
}

function removeClassFromTracker(className) {
    const classCollection = document.getElementsByClassName(className);
    while(classCollection[0]) {
        classCollection[0].parentNode.removeChild(classCollection[0]);
    }
}

function createDayText(coords, dayNum) {
    let numDaysInMonth = getNumberOfDaysInSelectedMonthAndYear();
    let svg = document.getElementsByTagName("svg")[1]; //Get svg element
    let newTextElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
    ); //Create a path in SVG's namespace
    let newElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "tspan"
    ); //Create a path in SVG's namespace
    newElement.setAttribute("x", coords[0]);
    newElement.setAttribute("y", coords[1]);
    newElement.textContent = dayNum;

    newElement.style.setProperty("--order", numDaysInMonth - dayNum);

    if (!firstAppInitialization) {
        document.documentElement.style.setProperty("--day-text-delay", "0s");
        document.documentElement.style.setProperty("--day-pulse-delay", "0.5s");
    }

    if (CURRENT_YEAR.toString() + getMonthName(CURRENT_MONTH) + CURRENT_DAY ===
        document.getElementById("year").textContent +
        document.getElementById("month").textContent +
        dayNum) {
        newElement.id = "dayPulse";
    }

    newElement.classList.add("dayText");

    newTextElement.appendChild(newElement);
    svg.appendChild(newTextElement);
}

function createDot(coords, radius, dayNum) {
    let numDaysInMonth = getNumberOfDaysInSelectedMonthAndYear();
    let svg = document.getElementsByTagName("svg")[1]; //Get svg element
    let newElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
    ); //Create a path in SVG's namespace
    newElement.setAttribute("cx", coords[0]);
    newElement.setAttribute("cy", coords[1]);
    newElement.setAttribute("r", radius);
    newElement.setAttribute("id", dayNum.toString() + "_" + radius);
    newElement.style.setProperty("--order", numDaysInMonth - dayNum);

    newElement.classList.add("dot");
    if(radius === 12) {
        newElement.classList.add("habit1Color");
    }
    else if(radius === 10) {
        newElement.classList.add("habit2Color");
    }
    else if(radius === 8) {
        newElement.classList.add("habit3Color");
    }

    svg.appendChild(newElement);
}

function getNumberOfDaysInSelectedMonthAndYear() {
    let selectedYear = document.getElementById("year").textContent;
    let selectedMonth = getMonthNum(document.getElementById("month").textContent);
    let numDaysInSelectedMonth = new Date(selectedYear, selectedMonth, 0);

    return numDaysInSelectedMonth.getDate();
}

function placeHashMarks() {
    let numDays = getNumberOfDaysInSelectedMonthAndYear();
    let hashIncr = numDays + 2;
    let segmentDegree = 360 / ((numDays * 4) / 3);
    for (let angleIncr = 90; angleIncr >= -180; angleIncr -= segmentDegree) {
        // for hash paths:
        const coords1 = getXYCoords(150, angleIncr);
        const coords2 = getXYCoords(270, angleIncr);

        createHashMark(coords1, coords2, hashIncr);
        hashIncr--;
    }
}

function placeDayText() {
    let numDays = getNumberOfDaysInSelectedMonthAndYear();
    let segmentDegree = 360 / ((numDays * 4) / 3);
    let dayNum = 1;
    for (let angleIncr = 90; angleIncr >= -175; angleIncr -= segmentDegree) {
        // for calendar day:
        const coords = getXYCoords(285, angleIncr - segmentDegree / 2);
        createDayText(coords, dayNum);
        dayNum++;
    }
}

function placeAllDots() {
    let numDays = getNumberOfDaysInSelectedMonthAndYear();
    let segmentDegree = 360 / ((numDays * 4) / 3);
    let dayNum = 1;
    for (let angleIncr = 90; angleIncr >= -175; angleIncr -= segmentDegree) {
        // for calendar day:
        let coords = getXYCoords(250, angleIncr - segmentDegree / 2);
        createDot(coords, 12, dayNum);

        coords = getXYCoords(210, angleIncr - segmentDegree / 2);
        createDot(coords, 10, dayNum);

        coords = getXYCoords(170, angleIncr - segmentDegree / 2);
        createDot(coords, 8, dayNum);

        dayNum++;
    }
}

function setHabitHoverAndClickEvents() {

    for (let i = 1; i <= NUM_HABITS; i++) {

        let habitSelectorArea = document.getElementById("habit" + i + "_selector_area");
        let habitSvgText = document.getElementById("habit" + i);

        habitSelectorArea.addEventListener("mousemove", () => {
            document.body.style.cursor = 'pointer';
            habitSvgText.style.fill = getCurrentColorTheme().color800;
        }, false);

        habitSelectorArea.addEventListener("mouseleave", () => {
            document.body.style.cursor = 'default';
            let colorTheme = getCurrentColorTheme();
            if (habitSvgText.textContent === 'add new')
                habitSvgText.style.fill = colorTheme.color100;
            else
                habitSvgText.style.fill = colorTheme.defaultText;
        }, false);

        habitSelectorArea.addEventListener("click", () => {
            var myModal = new bootstrap.Modal(document.getElementById("habit" + i + "Modal"), {
                keyboard: false
            });
            myModal.show();
        }, false);

    }

}

function getDotDayAndHabitInfo(circle) {
    let habitPostObj = getHabitIdAndNameFromDotRadius(circle.r.baseVal.value);
    let dotData = circle.id.split("_");
    habitPostObj.day = parseInt(dotData[0]);
    updateDotDetailsToDatabase(habitPostObj);
}

function getHabitIdAndNameFromDotRadius(radius) {
    let habitName = "";
    let habitNum = 0;

    if (radius === HABIT_1_RADIUS)
        habitNum = 1;
    else if (radius === HABIT_2_RADIUS)
        habitNum = 2;
    else if (radius === HABIT_3_RADIUS)
        habitNum = 3;

    habitName = document.getElementById("habit" + habitNum).textContent;

    if (habitName.includes('\n'))
        habitName = habitName.substring(0, habitName.indexOf('\n'))

    return new Object({habitNum: habitNum, name: habitName});
}

function getHabitTrackerDataFromDatabase(year, month) {
    const URL = BACKEND_API_URL + year + '/' + month.trim();

    fetch(URL)
        .then(response => response.json())
        .then(data => {
            loadHabitTrackerDataFromDatabase(data);
        })
        .catch(error => {
            console.log("No data captured for this month and year.");
            console.error(error);
        });
}

function loadHabitTrackerDataFromDatabase(data) {

    if (data.length === 0) {
        postNewEmptyHabits();
        return;
    }

    clearAllDotsOnTracker();

    let colorTheme = getCurrentColorTheme();

    for (let i = 0; i < data.length; i++) {
        let radius = undefined;

        if (data[i].habitNum === '1')
            radius = HABIT_1_RADIUS;
        else if (data[i].habitNum === '2')
            radius = HABIT_2_RADIUS;
        else if (data[i].habitNum === '3')
            radius = HABIT_3_RADIUS;

        let habit = document.getElementById("habit" + data[i].habitNum);

        habit.textContent = data[i].name;

        if (habit.textContent === undefined) {
            habitText.textContent = '';
        }
        if (habit.textContent === 'add new')
            habit.style.fill = colorTheme.color100;
        else
            habit.style.fill = colorTheme.defaultText;

        // cycle through dot data to ensure they are clicked:
        for (let j = 1; j < 32; j++) {
            let dayNum = 'day' + j;
            let elmId = j + '_' + radius;
            let dotElm = document.getElementById(elmId);
            if (dotElm === null)
                break;

            if (data[i][dayNum] === true) {
                dotElm.classList.remove("dot");
                dotElm.classList.add("dotClicked");
                if(!firstAppInitialization)
                    document.documentElement.style.setProperty("--fade-in-effects-delay", "2s");
                dotElm.classList.add("fadeInEffects");
            } else if (data[i][dayNum] === false) {
                dotElm.classList.add("dot");
                dotElm.classList.remove("dotClicked");
            }
        }
    }
    setModalTexts();
    firstAppInitialization = false;
}

function toggleVisibility(target) {
    if (target.classList.contains("dotClicked")) {
        target.classList.add("dot");
        target.classList.remove("dotClicked");
        target.classList.remove("fadeInEffects");
    } else {
        target.classList.add("dotClicked");
        target.classList.remove("dot");
    }
}

function updateDotDetailsToDatabase(dotObject) {
    updateHabitDetailsToDatabase(dotObject.habitNum, null, dotObject.day);
}

function setModalTexts() {
    for (let i = 1; i < NUM_HABITS + 1; i++) {
        let habitModalText = document.getElementById("habit" + i + "Name");
        let habitSvgText = document.getElementById("habit" + i);
        let habitModal = document.getElementById("habit" + i + "Modal");
        habitModalText.value = habitSvgText.textContent.trim();
        document.getElementById("habit" + i + "BtnSave").addEventListener("click", function () {
            habitSvgText.textContent = habitModalText.value;
            if (habitSvgText.textContent !== 'add new'){
                habitSvgText.style.fill = getCurrentColorTheme().defaultText;
            }
            updateHabitDetailsToDatabase(i, habitModalText.value, null);
        });
    }
}

function updateHabitDetailsToDatabase(habitNum, habitText, day) {
    const year = document.getElementById("year").textContent;
    const month = document.getElementById("month").textContent;
    const URL = BACKEND_API_URL + 'update';
    const formData = new FormData();
    formData.append('year', year);
    formData.append('month', month);
    formData.append('habitNum', habitNum);

    if (habitText !== null)
        formData.append('name', habitText);
    if (day !== null)
        formData.append('day', day);

    fetch(URL, {
        method: 'PUT',
        body: formData
    })
        .catch(error => {
            console.error('Error:', error);
        });
}

function getHabitMotivationMessage() {
    fetch(MOTIVATIONAL_MESSAGE_URL)
        .then(response => response.json())
        .then(data => {
            let quote = undefined;
            let author = undefined;
            try {
                quote = '"' + data[0].quote + '"';
            } catch {
                quote = '';
            }
            try {
                author = data[0].author;
            } catch {
                author = '';
            }
            loadMotivationalMessage(quote, author);
        });
}

function loadMotivationalMessage(quote, author) {
    let motivationalQuoteElm = document.getElementById("quote");
    motivationalQuoteElm.textContent = quote;

    let motivationalAuthorElm = document.getElementById("author");
    motivationalAuthorElm.textContent = author;
}

function clearAllDotsOnTracker() {
    for (let i = 1; i < NUM_HABITS + 1; i++)
        clearDotsByHabitNum(i);
}

function clearDotsByHabitNum(habitNum) {
    let radius = HABIT_1_RADIUS;
    if (habitNum === 2) {
        radius = HABIT_2_RADIUS;
    }
    if (habitNum === 3) {
        radius = HABIT_3_RADIUS;
    }

    let month = document.getElementById("month").textContent;
    let year = document.getElementById("year").textContent;
    let monthNum = getMonthNum(month) + 1;

    for (let i = 1; i < 32; i++) {
        let dotId = i + '_' + radius;
        let dot = document.getElementById(dotId);
        if (dot === null)
            break;
        dot.classList.add("dot");
        dot.classList.remove("dotClicked");
        dot.classList.remove("fadeInEffects");
    }
}

function postNewEmptyHabits() {
    const year = document.getElementById("year").textContent;
    const month = document.getElementById("month").textContent;
    const URL = BACKEND_API_URL;
    const formData = new FormData();
    formData.append('year', year);
    formData.append('month', month);

    fetch(URL, {
        method: 'POST',
        body: formData
    })
        .then(res => {
            getHabitTrackerDataFromDatabase(year, month);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function setHabitDeleteModalListeners() {

    for (let i = 1; i <= NUM_HABITS; i++) {
        let elmId = 'habit' + i + 'BtnDeleteChecked';
        let elm = document.getElementById(elmId);

        elm.addEventListener('click', () => {
            deleteHabit(i);
        }, false);
    }

}

function deleteHabit(habitNum) {
    clearDotsByHabitNum(habitNum);
    updateHabitDetailsToDatabase(habitNum, 'add new' , null);
    let habitText = document.getElementById("habit" + habitNum);
    habitText.textContent = 'add new';
    habitText.style.fill = getCurrentColorTheme().color100;
    document.getElementById("habit" + habitNum + "Name").value = 'add new';
}

function setColorTheme(theme) {
    document.documentElement.style.setProperty("--theme-color-50", theme.color50);
    document.documentElement.style.setProperty("--theme-color-100", theme.color100);
    document.documentElement.style.setProperty("--theme-color-200", theme.color200);
    document.documentElement.style.setProperty("--theme-color-400", theme.color400);
    document.documentElement.style.setProperty("--theme-color-600", theme.color600);
    document.documentElement.style.setProperty("--theme-color-800", theme.color800);
    document.documentElement.style.setProperty("--theme-color-900", theme.color900);
    setAddNewHabitColors(theme.color100);
    setMonthYearColors(theme.color800, theme.color100);
}

function getCurrentColorTheme() {
    let style = getComputedStyle(document.body);

    let colorTheme = {
        defaultText: style.getPropertyValue('--default-text-color'),
        color50: style.getPropertyValue('--theme-color-50'),
        color100: style.getPropertyValue('--theme-color-100'),
        color200: style.getPropertyValue('--theme-color-200'),
        color400: style.getPropertyValue('--theme-color-400'),
        color600: style.getPropertyValue('--theme-color-600'),
        color800: style.getPropertyValue('--theme-color-800'),
        color900: style.getPropertyValue('--theme-color-900')
    }

    return colorTheme;
}

function setColorThemeHoverEvents() {
    let arrayOfThemes = [null, theme1, theme2, theme3, theme4, theme5, theme6];

    for (let i = 1; i <= 6; i++) {
        let selectorId = "theme" + i + "_selector_area";
        let backgroundId = "theme" + i + "_background";
        let selector = document.getElementById("theme" + i + "_selector_area");
        let background = document.getElementById("theme" + i + "_background");

        let colorFill = arrayOfThemes[i].color50;
        let itrTheme = arrayOfThemes[i];

        selector.addEventListener("mousemove", () => {
            background.style.fill = colorFill;
            document.body.style.cursor = 'pointer';
        }, false);

        selector.addEventListener("mouseleave", () => {
            if (itrTheme.color50 !== getCurrentColorTheme().color50)
                background.style.fill = "transparent";
            document.body.style.cursor = 'default';
        }, false);

        selector.addEventListener("click", () => {
            clearBackgroundOfCurrentColorChoice();
            setColorTheme(itrTheme);
            background.style.fill = colorFill;
        }, false);

    }

}

function clearBackgroundOfCurrentColorChoice() {
    for (let i = 1; i <= 6; i++) {
        let background = document.getElementById("theme" + i + "_background");
        background.style.fill = "transparent";
    }
}

function setAddNewHabitColors(color) {
    for (let i = 1; i <= NUM_HABITS; i++) {
        let habitText = document.getElementById("habit" + i);
        if (habitText.textContent === "add new")
            habitText.style.fill = color;
    }

}

function setMonthYearColors(monthColor, yearColor) {
    document.getElementById("month").style.fill = monthColor;
    document.getElementById("year").style.fill = yearColor;
}
