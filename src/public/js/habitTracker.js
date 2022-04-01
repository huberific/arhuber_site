import {initializeApp} from 'firebase/app';
import {child, get, getDatabase, onValue, ref, update} from 'firebase/database';
import {firebaseConfig} from "./firebaseConfig";
import {theme1, theme2, theme3, theme4, theme5, theme6} from './colorThemes'
import {motivationalQuotes} from "./motivationalQuotes";

const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);
let databaseData = {};

const CURRENT_DATE = new Date();
const CURRENT_MONTH = CURRENT_DATE.getMonth(); // gives 0:11
const CURRENT_DAY = CURRENT_DATE.getDate();
const CURRENT_YEAR = CURRENT_DATE.getFullYear();

const FRAME_LENGTH = 600;
const FRAME_HEIGHT = 600;
const CENTER_X = FRAME_LENGTH / 2;
const CENTER_Y = FRAME_HEIGHT / 2;

const NUM_HABITS = 3;

const HABIT_1_RADIUS = 12;
const HABIT_2_RADIUS = 10;
const HABIT_3_RADIUS = 8;

const MONTHS_ARRAY = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];

const MOTIVATIONAL_DELAY = 20 * 1000; // milliseconds

// global variable to change animations for after firstAppInialization:
let firstAppInitialization = true;

loadApp();

function loadApp() {
    setDateOnTracker(CURRENT_YEAR, getMonthName(CURRENT_MONTH));
    placeDayText();
    placeAllDots();
    placeHashMarks();
    setDateModalListener();
    setHabitDeleteModalListeners();
    setDotClickListener();
    getAllFirebaseData();
    setListenEventForFirebase();
    setDateSelectorProperties();
    setHabitHoverAndClickEvents();
    setInfoIconProperties();
    setSettingsIconProperties();
    setInterval(setMotivationalMessage, MOTIVATIONAL_DELAY);
    setColorTheme(theme5);
    setColorThemeHoverEvents();
}

function setListenEventForFirebase() {
    const dbRef = ref(database, 'habitData/');
    onValue(dbRef, (snapshot) => {
        databaseData = snapshot.val();
    });
}

function getAllFirebaseData() {
    const dbRef = ref(database);
    get(child(dbRef, `habitData/`))
        .then((snapshot) => {
            if (snapshot.exists()) {
                databaseData = snapshot.val();
                loadHabitTrackerDataFromFirebase(CURRENT_YEAR, getMonthName(CURRENT_MONTH));
            } else {
                console.log("No data available");
            }})
        .catch((error) => {
            console.error(error);
        });
}

function updateFirebaseHabitName(habit, habitName) {
    const selectedYear = document.getElementById("year").textContent;
    const selectedMonth = document.getElementById("month").textContent;
    const basePath = '/habitData/' + selectedYear + '/' + selectedMonth + '/';

    const updates = {};
    if (habitName !== null && habit !== null) {
        updates[basePath + '/' + habit + '/' + 'name'] = habitName;
        return update(ref(database), updates);
    }
}

function updateFirebaseDotData(dotElm) {
    const selectedYear = document.getElementById("year").textContent;
    const selectedMonth = document.getElementById("month").textContent;
    const basePath = '/habitData/' + selectedYear + '/' + selectedMonth + '/';

    const updates = {};
    if (dotElm !== null && dotElm !== undefined) {
        let dotData = getDotHabitAndDayInfo(dotElm);
        let clicked = false;
        if (dotElm.classList.contains("dotClicked"))
            clicked = true;
        let dayNode = "day" + dotData["day"];
        updates[basePath + dotData["habit"] + '/' + dayNode] = clicked;
        return update(ref(database), updates);
    }
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
            updateFirebaseDotData(event.target);
        },
        false
    );
}

function setInfoIconProperties() {
    let infoIconSelectorArea = document.getElementById("info_selector_area");
    let infoIconLight = document.getElementById("info_icon_light");
    let infoIconDark = document.getElementById("info_icon_dark");

    infoIconSelectorArea.addEventListener("mousemove", () => {
        infoIconLight.style.visibility = "hidden";
        infoIconDark.style.visibility = "visible";
        document.body.style.cursor = 'pointer';
    }, false);

    infoIconSelectorArea.addEventListener("mouseleave", () => {
        infoIconDark.style.visibility = "hidden";
        infoIconLight.style.visibility = "visible";
        document.body.style.cursor = 'default';
    }, false);

    infoIconSelectorArea.addEventListener("click", () => {
        let myModal = new bootstrap.Modal(document.getElementById("infoModal"), {
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
        settingsIconLight.style.visibility = "hidden";
        settingsIconDark.style.visibility = "visible";
        document.body.style.cursor = 'pointer';
    }, false);

    settingsIconSelectorArea.addEventListener("mouseleave", () => {
        settingsIconDark.style.visibility = "hidden";
        settingsIconLight.style.visibility = "visible";
        document.body.style.cursor = 'default';
    }, false);

    settingsIconSelectorArea.addEventListener("click", () => {
        let myModal = new bootstrap.Modal(document.getElementById("settingsModal"), {
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
            monthSelected.value = "Select a month...";
            yearSelected.value = "Select a year...";
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
        loadHabitTrackerDataFromFirebase(yearSelected, monthSelected);

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
        let myModal = new bootstrap.Modal(document.getElementById("dateModal"), {
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
            let myModal = new bootstrap.Modal(document.getElementById("habit" + i + "Modal"), {
                keyboard: false
            });
            myModal.show();
        }, false);
    }
}

function getDotHabitAndDayInfo(circle) {
    let dotData = circle.id.split("_");
    let habitDesc = "habit1";
    if (parseInt(dotData[1]) === HABIT_2_RADIUS)
        habitDesc = "habit2";
    if (parseInt(dotData[1]) === HABIT_3_RADIUS)
        habitDesc = "habit3";
    return new Object({
        habit: habitDesc,
        day: dotData[0]
    });
}

function loadHabitTrackerDataFromFirebase(year, month) {

    if (Object.keys(databaseData).length === 0) {
        console.log("database data is empty");
        return;
    }

    clearAllDotsOnTracker();

    let colorTheme = getCurrentColorTheme();

    for (const habit in databaseData[year][month]) {
        let radius = undefined;

        let habitData = databaseData[year][month][habit];

        if (habit === "habit1")
            radius = HABIT_1_RADIUS;
        else if (habit === "habit2")
            radius = HABIT_2_RADIUS;
        else if (habit === "habit3")
            radius = HABIT_3_RADIUS;

        let habitText = document.getElementById(habit);

        habitText.textContent = habitData["name"];

        if (habitText.textContent === undefined) {
            habitText.textContent = '';
        }
        if (habitText.textContent === 'add new')
            habitText.style.fill = colorTheme.color100;
        else
            habitText.style.fill = colorTheme.defaultText;

        // cycle through dot data to ensure they are clicked:
        for (let j = 1; j < 32; j++) {
            let dayNum = 'day' + j;
            let elmId = j + '_' + radius;
            let dotElm = document.getElementById(elmId);
            if (dotElm === null)
                break;

            if (habitData[dayNum]) {
                dotElm.classList.remove("dot");
                dotElm.classList.add("dotClicked");
                dotElm.classList.add("fadeInEffects");
                if(!firstAppInitialization)
                    document.documentElement.style.setProperty("--fade-in-effects-delay", "2s");
            } else if (!habitData[dayNum]) {
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
            updateFirebaseHabitName("habit" + i, habitModalText.value);
        });
    }
}

function clearAllDotsOnTracker() {
    for (let i = 1; i <= NUM_HABITS; i++)
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
    let radius = HABIT_1_RADIUS;
    if (habitNum === 2)
        radius = HABIT_2_RADIUS;
    if (habitNum === 3)
        radius = HABIT_3_RADIUS;
    clearDotsByHabitNum(habitNum);
    let idSelector = '[id*=_' + radius +']';
    let habitDotElms = document.querySelectorAll(idSelector);
    for (let i = 0; i < habitDotElms.length; i++)
        updateFirebaseDotData(habitDotElms[i]);
    updateFirebaseHabitName("habit" + habitNum, "add new");
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

    return {
        defaultText: style.getPropertyValue('--default-text-color'),
        color50: style.getPropertyValue('--theme-color-50'),
        color100: style.getPropertyValue('--theme-color-100'),
        color200: style.getPropertyValue('--theme-color-200'),
        color400: style.getPropertyValue('--theme-color-400'),
        color600: style.getPropertyValue('--theme-color-600'),
        color800: style.getPropertyValue('--theme-color-800'),
        color900: style.getPropertyValue('--theme-color-900')
    };
}

function setColorThemeHoverEvents() {
    let arrayOfThemes = [null, theme1, theme2, theme3, theme4, theme5, theme6];

    for (let i = 1; i <= 6; i++) {
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

function setMotivationalMessage() {
    let randNum = Math.floor(Math.random() * 100);
    try {
        let quote = motivationalQuotes[randNum]["quote"];
        let author = motivationalQuotes[randNum]["author"];
        loadMotivationalMessage(quote, author);
    } catch (e) {
        console.error(e);
    }
}

function loadMotivationalMessage(quote, author) {
    let motivationalQuoteElm = document.getElementById("quote");
    motivationalQuoteElm.textContent = quote;

    let motivationalAuthorElm = document.getElementById("author");
    motivationalAuthorElm.textContent = author;
}