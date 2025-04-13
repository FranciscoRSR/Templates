// Firebase configuration and initialization
const firebaseConfig = {
  apiKey: "AIzaSyAC_Xt-Nyz4_jfzEBbqUZfCLf__-wnXaLQ",
  authDomain: "rsr-templates.firebaseapp.com",
  projectId: "rsr-templates",
  storageBucket: "rsr-templates.appspot.com",
  messagingSenderId: "234762099768",
  appId: "1:234762099768:web:fdef26741b469db1089acd"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Global variables (declare them only once)
let cars = [];
let taxis = [];
let hotels = [];
let packages = [];
let templates = {};
let currentScreen = 'initial';
let isSidebarListVisible = false;

// Load data from Firebase
async function loadData() {
    try {
      console.log("Attempting to load data from Firestore...");
      const doc = await db.collection('appData').doc('currentData').get();
      console.log("Document exists:", doc.exists);
      if (doc.exists) {
        const data = doc.data();
        console.log("Loaded data:", data);
        cars = data.cars || [];
        taxis = data.taxis || [];
        hotels = data.hotels || [];
        packages = data.packages || [];
        templates = data.templates || {};
      } else {
        console.log("No document found, saving default data...");
        await saveAllData();
      }
    } catch (error) {
      console.error("Error loading data:", error);
      cars = defaultData.cars;
      taxis = defaultData.taxis;
      hotels = defaultData.hotels;
      packages = defaultData.packages;
      templates = defaultData.templates;
    }
}

// Save all data to Firebase
async function saveAllData() {
    try {
      await db.collection('appData').doc('currentData').set({
        cars,
        taxis,
        hotels,
        packages,
        templates
      });
      console.log("Data saved successfully");
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Error saving data to database");
    }
}

function showScreen(screenId) {
    const screens = ['initialScreen', 'templatesScreen', 'editListScreen', 'editTemplatesScreen'];
    screens.forEach(id => document.getElementById(id).classList.add('hidden'));
    document.getElementById(`${screenId}Screen`).classList.remove('hidden');

    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const initialListOptions = document.getElementById('initialListOptions');
    const sidebarListOptions = document.getElementById('sidebarListOptions');

    if (screenId === 'initial') {
        sidebar.style.display = 'none';
        mainContent.classList.remove('with-sidebar');
        sidebarListOptions.style.display = 'none';
        initialListOptions.style.display = 'none';
    } else {
        sidebar.style.display = 'flex';
        mainContent.classList.add('with-sidebar');
        initialListOptions.style.display = 'none';
        sidebarListOptions.style.display = (screenId === 'editList' && isSidebarListVisible) ? 'flex' : 'none';
    }
    currentScreen = screenId;

    // Load dropdowns when switching screens
    if (screenId === 'templates') {
        loadTemplateDropdown(); // Ensure this is called
    }
    if (screenId === 'editTemplates') {
        loadEditTemplatesDropdown();
    }
}

function toggleInitialEditList() {
    const initialListOptions = document.getElementById('initialListOptions');
    initialListOptions.style.display = (initialListOptions.style.display === 'none' || initialListOptions.style.display === '') ? 'flex' : 'none';
}

function toggleEditList() {
    const sidebarListOptions = document.getElementById('sidebarListOptions');
    isSidebarListVisible = !isSidebarListVisible;
    sidebarListOptions.style.display = isSidebarListVisible ? 'flex' : 'none';
}

function loadTemplateDropdown() {
    const select = document.getElementById('emailType');
    // Ensure templates are sorted alphabetically
    const sortedTemplates = Object.keys(templates).sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
    select.innerHTML = '<option value="">-- Select a Template --</option>' + 
        sortedTemplates.map(key => `<option value="${key}">${key}</option>`).join('');
}

function showFields() {
    const emailType = document.getElementById('emailType').value;
    const fieldsDiv = document.getElementById('fields');
    fieldsDiv.innerHTML = '';
    document.getElementById('generateBtn').disabled = !emailType;

    if (!emailType) return;

    const template = templates[emailType];
    const placeholders = extractPlaceholders(template);

    let fields = '';
    
    // Handle existing templates for backward compatibility
    switch (emailType) {
        default:
            // Dynamic fields for new templates
            const hasDate1 = placeholders.includes('Date1') || placeholders.includes('Day1') || placeholders.includes('Month1') || placeholders.includes('Year1');
            const hasDate2 = placeholders.includes('Date2') || placeholders.includes('Day2') || placeholders.includes('Month2') || placeholders.includes('Year2');
            const hasDateNUR = placeholders.includes('dateNUR') || placeholders.includes('dayNUR') || placeholders.includes('monthNUR') || placeholders.includes('yearNUR');
            const hasDateSPA = placeholders.includes('dateSPA') || placeholders.includes('daySPA') || placeholders.includes('monthSPA') || placeholders.includes('yearSPA');
            const hasSingleDate = placeholders.includes('date') || placeholders.includes('day') || placeholders.includes('month') || placeholders.includes('year');

            placeholders.forEach(placeholder => {
                const id = placeholder;
                const label = placeholder.charAt(0).toUpperCase() + placeholder.slice(1);
                if (placeholder === 'car') {
                    fields += `
                        <label for="${id}">Car:</label>
                        <input type="text" id="${id}" list="${id}-list" autocomplete="off" placeholder="Type to search cars">
                        <datalist id="${id}-list">
                            ${cars.map(car => `<option value="${car.name}">`).join('')}
                        </datalist>
                    `;
                } else if (placeholder === 'car1') {
                    fields += `
                        <label for="${id}">Car 1:</label>
                        <input type="text" id="${id}" list="${id}-list" autocomplete="off" placeholder="Type to search cars">
                        <datalist id="${id}-list">
                            ${cars.map(car => `<option value="${car.name}">`).join('')}
                        </datalist>
                    `;
                } else if (placeholder === 'car2') {
                    fields += `
                        <label for="${id}">Car 2:</label>
                        <input type="text" id="${id}" list="${id}-list" autocomplete="off" placeholder="Type to search cars">
                        <datalist id="${id}-list">
                            ${cars.map(car => `<option value="${car.name}">`).join('')}
                        </datalist>
                    `;
                } else if (placeholder === 'carSPA') {
                    fields += `
                        <label for="${id}">Car Spa:</label>
                        <input type="text" id="${id}" list="${id}-list" autocomplete="off" placeholder="Type to search cars">
                        <datalist id="${id}-list">
                            ${cars.map(car => `<option value="${car.name}">`).join('')}
                        </datalist>
                    `;
                } else if (placeholder === 'carNUR') {
                    fields += `
                        <label for="${id}">Car Nur:</label>
                        <input type="text" id="${id}" list="${id}-list" autocomplete="off" placeholder="Type to search cars">
                        <datalist id="${id}-list">
                            ${cars.map(car => `<option value="${car.name}">`).join('')}
                        </datalist>
                    `;
                } else if (placeholder === 'taxi') {
                    fields += `
                        <label for="${id}">Taxi:</label>
                        <select id="${id}">${taxis.map(taxi => `<option value="${taxi}">${taxi}</option>`).join('')}</select>
                    `;
                } else if (placeholder === 'hotel') {
                    fields += `
                        <label for="${id}">Hotel:</label>
                        <select id="${id}" onchange="autoFillHotelEmailDynamic('${id}')">${hotels.map(hotel => `<option value="${hotel.name}">${hotel.name}</option>`).join('')}</select>
                        <label for="${id}Email">Hotel Email:</label>
                        <input type="email" id="${id}Email" readonly>
                    `;
                } else if (placeholder === 'package') {
                    fields += `
                        <label for="${id}">Package:</label>
                        <select id="${id}">${packages.map(pkg => `<option value="${pkg}">${pkg}</option>`).join('')}</select>
                    `;
                } else if (placeholder === 'packageSPA') {
                    fields += `
                        <label for="${id}">Package Spa:</label>
                        <select id="${id}">${packages.map(pkg => `<option value="${pkg}">${pkg}</option>`).join('')}</select>
                    `;
                } else if (placeholder === 'packageNUR') {
                    fields += `
                        <label for="${id}">Package Nur:</label>
                        <select id="${id}">${packages.map(pkg => `<option value="${pkg}">${pkg}</option>`).join('')}</select>
                    `;
                } else if (hasDate1 && (placeholder === 'Date1' || placeholder === 'Day1' || placeholder === 'Month1' || placeholder === 'Year1')) {
                    if (!fields.includes('id="date1"')) {
                        fields += `
                            <label for="date1">Date 1:</label>
                            <input type="date" id="date1">
                        `;
                    }
                } else if (hasDate2 && (placeholder === 'Date2' || placeholder === 'Day2' || placeholder === 'Month2' || placeholder === 'Year2')) {
                    if (!fields.includes('id="date2"')) {
                        fields += `
                            <label for="date2">Date 2:</label>
                            <input type="date" id="date2">
                        `;
                    }
                } else if (hasDateSPA && (placeholder === 'dateSPA' || placeholder === 'daySPA' || placeholder === 'monthSPA' || placeholder === 'yearSPA')) {
                    if (!fields.includes('id="dateSPA"')) {
                        fields += `
                            <label for="dateSPA">Date Spa:</label>
                            <input type="date" id="dateSPA">
                        `;
                    }
                } else if (hasDateNUR && (placeholder === 'dateNUR' || placeholder === 'dayNUR' || placeholder === 'monthNUR' || placeholder === 'yearNUR')) {
                    if (!fields.includes('id="dateNUR"')) {
                        fields += `
                            <label for="dateNUR">Date Nur:</label>
                            <input type="date" id="dateNUR">
                        `;
                    }
                } else if (hasSingleDate && (placeholder === 'date' || placeholder === 'day' || placeholder === 'month' || placeholder === 'year') && !hasDate1 && !hasDate2) {
                    if (!fields.includes('id="date"')) {
                        fields += `
                            <label for="date">Date:</label>
                            <input type="date" id="date">
                        `;
                    }
                } else if (placeholder.includes('time') && placeholder !== 'arrivalTime' && placeholder !== 'firstTime' && placeholder !== 'lastTime') {
                    fields += `
                        <label for="${id}">${label} (e.g., 08:00):</label>
                        <input type="text" id="${id}" placeholder="e.g., 08:00">
                    `;
                } else if (placeholder === 'firstTime' || placeholder === 'lastTime') {
                    fields += `
                        <label for="${id}">${label} (e.g., 08:00):</label>
                        <input type="text" id="${id}" placeholder="e.g., 08:00">
                    `;
                } else if (placeholder === 'kms' || placeholder === 'Laps') {
                    fields += `
                        <label for="${id}">${label}:</label>
                        <input type="number" id="${id}" min="0" step="1">
                    `;
                } else if (placeholder !== 'arrivalTime' && placeholder !== 'depositSection') {
                    fields += `
                        <label for="${id}">${label}:</label>
                        <input type="text" id="${id}">
                    `;
                }
            });
            break;
    }
    fieldsDiv.innerHTML = fields;
}

function autoFillHotelEmailDynamic(hotelId) {
    const hotelSelect = document.getElementById(hotelId);
    const hotelEmail = document.getElementById(`${hotelId}Email`);
    const selectedHotel = hotels.find(h => h.name === hotelSelect.value);
    hotelEmail.value = selectedHotel ? selectedHotel.email : '';
}

function autoFillHotelEmail() {
    const hotelSelect = document.getElementById('hotel');
    const hotelEmail = document.getElementById('hotelEmail');
    const selectedHotel = hotels.find(h => h.name === hotelSelect.value);
    hotelEmail.value = selectedHotel ? selectedHotel.email : '';
}

function generateEmail() {
    const emailType = document.getElementById('emailType').value;
    let subject = `RSRNurburg Email`;
    let body = templates[emailType] || '';

    const placeholders = extractPlaceholders(body);
    let values = {};

    // Collect values from input fields
    document.querySelectorAll('#fields input, #fields select').forEach(input => {
        values[input.id] = input.value;
        // Validate car fields
        if (['car', 'car1', 'car2', 'carSPA', 'carNUR'].includes(input.id)) {
            const carExists = cars.some(car => car.name === input.value);
            if (!carExists && input.value) {
                alert(`Invalid car name for ${input.id}: ${input.value}`);
                return;
            }
        }
    });

    // Exit if validation failed
    if (document.querySelector('#fields input:invalid')) return;

    // Handle date-related placeholders
    const dateFields = ['date', 'date1', 'date2', 'dateSPA', 'dateNUR'];
    let dateValues = {};

    dateFields.forEach(field => {
        if (values[field]) {
            const date = new Date(values[field]);
            if (!isNaN(date)) {
                dateValues[field] = {
                    day: date.getDate().toString().padStart(2, '0'),
                    month: date.toLocaleString('default', { month: 'long' }),
                    year: date.getFullYear(),
                    fullDate: `${date.getDate().toString().padStart(2, '0')} ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`
                };
            }
        }
    });

    // Handle arrivalTime
    let arrivalTime = '';
    if (values['time']) {
        const [hours, minutes] = values['time'].split(':').map(Number);
        const adjustedHours = hours - 1;
        arrivalTime = `${adjustedHours.toString().padStart(2, '0')}:${minutes ? minutes.toString().padStart(2, '0') : '00'}`;
    }

    // Handle depositSection
    let depositSection = '';
    const carFields = ['car', 'carNUR', 'carSPA', 'car1', 'car2'];
    let depositCars = [];

    carFields.forEach(field => {
        if (values[field]) {
            const selectedCar = cars.find(c => c.name === values[field]);
            if (selectedCar && selectedCar.requiresDeposit) {
                depositCars.push({ name: selectedCar.name, amount: selectedCar.depositAmount });
            }
        }
    });

    if (depositCars.length > 0) {
        if (depositCars.length === 1) {
            depositSection = `
Finally, for the ${depositCars[0].name}, a deposit of €${depositCars[0].amount} is required. I will send you the payment link one week before the event, or you can make the deposit directly at our office. This amount is not charged, and it will be canceled once the car is returned.
            `;
        } else {
            const depositList = depositCars.map(car => `€${car.amount} for ${car.name}`).join(', ');
            depositSection = `
Finally, deposits are required for the following: ${depositList}. I will send you the payment links one week before the event, or you can make the deposits directly at our office. These amounts are not charged and will be canceled once the cars are returned.
            `;
        }
    }

    // Prepare replacement map for placeholders
    let replacements = {};

    placeholders.forEach(placeholder => {
        if (placeholder === 'day' && dateValues['date']) {
            replacements['day'] = dateValues['date'].day;
        } else if (placeholder === 'month' && dateValues['date']) {
            replacements['month'] = dateValues['date'].month;
        } else if (placeholder === 'year' && dateValues['date']) {
            replacements['year'] = dateValues['date'].year;
        } else if (placeholder === 'date' && dateValues['date']) {
            replacements['date'] = dateValues['date'].fullDate;
        } else if (placeholder === 'Day1' && dateValues['date1']) {
            replacements['Day1'] = dateValues['date1'].day;
        } else if (placeholder === 'Month1' && dateValues['date1']) {
            replacements['Month1'] = dateValues['date1'].month;
        } else if (placeholder === 'Year1' && dateValues['date1']) {
            replacements['Year1'] = dateValues['date1'].year;
        } else if (placeholder === 'Date1' && dateValues['date1']) {
            replacements['Date1'] = dateValues['date1'].fullDate;
        } else if (placeholder === 'day2' && dateValues['date2']) {
            replacements['day2'] = dateValues['date2'].day;
        } else if (placeholder === 'month2' && dateValues['date2']) {
            replacements['month2'] = dateValues['date2'].month;
        } else if (placeholder === 'year2' && dateValues['date2']) {
            replacements['year2'] = dateValues['date2'].year;
        } else if (placeholder === 'Date2' && dateValues['date2']) {
            replacements['Date2'] = dateValues['date2'].fullDate;
        } else if (placeholder === 'daySPA' && dateValues['dateSPA']) {
            replacements['daySPA'] = dateValues['dateSPA'].day;
        } else if (placeholder === 'monthSPA' && dateValues['dateSPA']) {
            replacements['monthSPA'] = dateValues['dateSPA'].month;
        } else if (placeholder === 'yearSPA' && dateValues['dateSPA']) {
            replacements['yearSPA'] = dateValues['dateSPA'].year;
        } else if (placeholder === 'dateSPA' && dateValues['dateSPA']) {
            replacements['dateSPA'] = dateValues['dateSPA'].fullDate;
        } else if (placeholder === 'dayNUR' && dateValues['dateNUR']) {
            replacements['dayNUR'] = dateValues['dateNUR'].day;
        } else if (placeholder === 'monthNUR' && dateValues['dateNUR']) {
            replacements['monthNUR'] = dateValues['dateNUR'].month;
        } else if (placeholder === 'yearNUR' && dateValues['dateNUR']) {
            replacements['yearNUR'] = dateValues['dateNUR'].year;
        } else if (placeholder === 'dateNUR' && dateValues['dateNUR']) {
            replacements['dateNUR'] = dateValues['dateNUR'].fullDate;
        } else if (placeholder === 'arrivalTime') {
            replacements['arrivalTime'] = arrivalTime;
        } else if (placeholder === 'depositSection') {
            replacements['depositSection'] = depositSection;
        } else if (placeholder === 'originalexcess' || placeholder === 'insuranceexcess' || placeholder === 'insuranceprice') {
            let selectedCar = null;
            for (const field of ['car', 'car1', 'car2', 'carSPA', 'carNUR']) {
                if (values[field]) {
                    selectedCar = cars.find(c => c.name === values[field]);
                    if (selectedCar) break;
                }
            }
            if (selectedCar) {
                if (placeholder === 'originalexcess') {
                    replacements['originalexcess'] = selectedCar.originalExcess || '0';
                } else if (placeholder === 'insuranceexcess') {
                    replacements['insuranceexcess'] = selectedCar.insuranceExcess || '0';
                } else if (placeholder === 'insuranceprice') {
                    replacements['insuranceprice'] = selectedCar.raceIncPrice || '0';
                }
            } else {
                replacements[placeholder] = '';
            }
        } else {
            replacements[placeholder] = values[placeholder] || '';
        }
    });

    // Perform replacements for all placeholders
    Object.keys(replacements).forEach(placeholder => {
        const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
        body = body.replace(regex, replacements[placeholder]);
    });

    document.getElementById('subject').value = subject;
    document.getElementById('body').value = body;
}

function copyToClipboard() {
    const body = document.getElementById('body').value;
    navigator.clipboard.writeText(body).then(() => alert('Email body copied to clipboard!'));
}

// Edit List Functions
function showListEditor(listType) {
    const editor = document.getElementById('listEditor');
    editor.classList.remove('hidden');
    document.getElementById('listTitle').textContent = `Edit ${listType.charAt(0).toUpperCase() + listType.slice(1)}`;

    const itemsDiv = document.getElementById('listItems');
    const newItemForm = document.getElementById('newItemForm');
    itemsDiv.innerHTML = '';
    newItemForm.innerHTML = '';

    let list = [];
    switch (listType) {
        case 'cars':
            list = cars;
            newItemForm.innerHTML = `
                <label for="newItemName">Car Name:</label>
                <input type="text" id="newItemName">
                <label for="requiresDeposit">Requires Deposit:</label>
                <input type="checkbox" id="requiresDeposit">
                <label for="depositAmount">Deposit Amount:</label>
                <input type="number" id="depositAmount" disabled>
                <label for="originalExcess">Original Excess (€):</label>
                <input type="number" id="originalExcess" min="0">
                <label for="insuranceExcess">Insurance Excess (€):</label>
                <input type="number" id="insuranceExcess" min="0">
                <label for="raceIncPrice">RaceINC Price (€):</label>
                <input type="number" id="raceIncPrice" min="0">
                <button onclick="addItem('cars')">Add</button>
            `;
            document.getElementById('requiresDeposit').addEventListener('change', function() {
                document.getElementById('depositAmount').disabled = !this.checked;
            });
            list.forEach((item, index) => {
                itemsDiv.innerHTML += `
                    <div class="list-item">
                        <label>Name:</label>
                        <input type="text" value="${item.name}" id="carName-${index}">
                        <label>Deposit:</label>
                        <input type="checkbox" ${item.requiresDeposit ? 'checked' : ''} onchange="toggleDeposit(${index})">
                        <label>Deposit Amount:</label>
                        <input type="number" value="${item.depositAmount}" id="carDeposit-${index}" ${item.requiresDeposit ? '' : 'disabled'}>
                        <label>Original Excess:</label>
                        <input type="number" value="${item.originalExcess || 0}" id="carOriginalExcess-${index}" min="0">
                        <label>Insurance Excess:</label>
                        <input type="number" value="${item.insuranceExcess || 0}" id="carInsuranceExcess-${index}" min="0">
                        <label>RaceINC Price:</label>
                        <input type="number" value="${item.raceIncPrice || 0}" id="carRaceIncPrice-${index}" min="0">
                        <button onclick="removeItem('cars', ${index})">Remove</button>
                    </div>
                `;
            });
            break;
        case 'taxis':
            list = taxis;
            newItemForm.innerHTML = `
                <label for="newItemName">Taxi Name:</label>
                <input type="text" id="newItemName">
                <button onclick="addItem('taxis')">Add</button>
            `;
            list.forEach((item, index) => {
                itemsDiv.innerHTML += `<div class="list-item"><input type="text" value="${item}" id="taxi-${index}"><button onclick="removeItem('taxis', ${index})">Remove</button></div>`;
            });
            break;
        case 'hotels':
            list = hotels;
            newItemForm.innerHTML = `
                <label for="newItemName">Hotel Name:</label>
                <input type="text" id="newItemName">
                <label for="newItemEmail">Contact Email:</label>
                <input type="email" id="newItemEmail">
                <button onclick="addItem('hotels')">Add</button>
            `;
            list.forEach((item, index) => {
                itemsDiv.innerHTML += `
                    <div class="list-item">
                        <input type="text" value="${item.name}" id="hotelName-${index}">
                        <input type="email" value="${item.email}" id="hotelEmail-${index}">
                        <button onclick="removeItem('hotels', ${index})">Remove</button>
                    </div>
                `;
            });
            break;
        case 'packages':
            list = packages;
            newItemForm.innerHTML = `
                <label for="newItemName">Package Name:</label>
                <input type="text" id="newItemName">
                <button onclick="addItem('packages')">Add</button>
            `;
            list.forEach((item, index) => {
                itemsDiv.innerHTML += `<div class="list-item"><input type="text" value="${item}" id="package-${index}"><button onclick="removeItem('packages', ${index})">Remove</button></div>`;
            });
            break;
    }
}

function toggleDeposit(index) {
    const checkbox = document.querySelector(`#listItems .list-item:nth-child(${index + 1}) input[type='checkbox']`);
    const depositInput = document.getElementById(`carDeposit-${index}`);
    if (checkbox && depositInput) depositInput.disabled = !checkbox.checked;
}

function addItem(listType) {
    const name = document.getElementById('newItemName').value.trim();
    if (!name) return;

    switch (listType) {
        case 'cars':
            const requiresDeposit = document.getElementById('requiresDeposit').checked;
            const depositAmount = requiresDeposit ? parseInt(document.getElementById('depositAmount').value) || 0 : 0;
            const originalExcess = parseInt(document.getElementById('originalExcess').value) || 0;
            const insuranceExcess = parseInt(document.getElementById('insuranceExcess').value) || 0;
            const raceIncPrice = parseInt(document.getElementById('raceIncPrice').value) || 0;
            cars.push({ 
                name, 
                requiresDeposit, 
                depositAmount, 
                originalExcess, 
                insuranceExcess, 
                raceIncPrice 
            });
            break;
        case 'taxis':
            taxis.push(name);
            break;
        case 'hotels':
            const email = document.getElementById('newItemEmail').value.trim();
            if (!email) return;
            hotels.push({ name, email });
            break;
        case 'packages':
            packages.push(name);
            break;
    }
    saveAllData().then(() => showListEditor(listType));
}

function removeItem(listType, index) {
    switch (listType) {
        case 'cars': cars.splice(index, 1); break;
        case 'taxis': taxis.splice(index, 1); break;
        case 'hotels': hotels.splice(index, 1); break;
        case 'packages': packages.splice(index, 1); break;
    }
    showListEditor(listType);
}

async function saveList() {
    const listType = document.getElementById('listTitle').textContent.split(' ')[1].toLowerCase();
    switch (listType) {
        case 'cars':
            cars = Array.from(document.querySelectorAll('#listItems .list-item')).map((_, index) => ({
                name: document.getElementById(`carName-${index}`).value,
                requiresDeposit: document.querySelector(`#listItems .list-item:nth-child(${index + 1}) input[type='checkbox']`).checked,
                depositAmount: parseInt(document.getElementById(`carDeposit-${index}`).value) || 0,
                originalExcess: parseInt(document.getElementById(`carOriginalExcess-${index}`).value) || 0,
                insuranceExcess: parseInt(document.getElementById(`carInsuranceExcess-${index}`).value) || 0,
                raceIncPrice: parseInt(document.getElementById(`carRaceIncPrice-${index}`).value) || 0
            }));
            break;
        case 'taxis':
            taxis = Array.from(document.querySelectorAll('#listItems .list-item')).map((_, index) => document.getElementById(`taxi-${index}`).value);
            break;
        case 'hotels':
            hotels = Array.from(document.querySelectorAll('#listItems .list-item')).map((_, index) => ({
                name: document.getElementById(`hotelName-${index}`).value,
                email: document.getElementById(`hotelEmail-${index}`).value
            }));
            break;
        case 'packages':
            packages = Array.from(document.querySelectorAll('#listItems .list-item')).map((_, index) => document.getElementById(`package-${index}`).value);
            break;
    }
    
    try {
        await saveAllData();
        alert(`${listType} list saved!`);
    } catch (error) {
        alert(`Error saving ${listType} list: ${error.message}`);
    }
}

function extractPlaceholders(template) {
    const regex = /\{([^{}]+)\}/g;
    const matches = [];
    let match;
    while ((match = regex.exec(template)) !== null) {
        matches.push(match[1]);
    }
    return [...new Set(matches)]; // Remove duplicates
}

// Edit Templates Functions
function loadEditTemplatesDropdown() {
    const select = document.getElementById('templateSelect');
    const sortedTemplates = Object.keys(templates).sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
    select.innerHTML = '<option value="">-- Select a Template --</option>' + 
        sortedTemplates.map(key => `<option value="${key}">${key}</option>`).join('');
    loadTemplateToEdit();
}

function loadTemplateToEdit() {
    const select = document.getElementById('templateSelect');
    const textarea = document.getElementById('templateBody');
    textarea.value = templates[select.value] || '';
}

function renameTemplate() {
    const select = document.getElementById('templateSelect');
    const currentName = select.value;
    
    if (!currentName) {
        alert('Please select a template to rename.');
        return;
    }
    
    const newName = prompt('Enter new template name:', currentName);
    if (newName && newName !== currentName && !templates[newName]) {
        // Store the template content
        const templateContent = templates[currentName];
        // Delete the old template
        delete templates[currentName];
        // Add the template with the new name
        templates[newName] = templateContent;
        // Save to Firebase
        saveAllData().then(() => {
            loadEditTemplatesDropdown();
            document.getElementById('templateSelect').value = newName;
            loadTemplateToEdit();
            alert('Template renamed successfully!');
        });
    } else if (newName === currentName) {
        // Do nothing if the name hasn't changed
        return;
    } else if (templates[newName]) {
        alert('Template name already exists!');
    }
}

function addTemplate() {
    const name = prompt('Enter new template name:');
    if (name && !templates[name]) {
        templates[name] = '';
        loadEditTemplatesDropdown();
        document.getElementById('templateSelect').value = name;
        loadTemplateToEdit();
    } else if (templates[name]) {
        alert('Template name already exists!');
    }
}

function saveTemplate() {
    const select = document.getElementById('templateSelect');
    const textarea = document.getElementById('templateBody');
    if (select.value) {
        templates[select.value] = textarea.value;
        saveAllData().then(() => alert('Template saved!'));
    }
}

function deleteTemplate() {
    const select = document.getElementById('templateSelect');
    if (select.value && confirm(`Delete ${select.value}?`)) {
        delete templates[select.value];
        loadEditTemplatesDropdown();
    }
}

// Initial setup
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    showScreen('initial');
    
    // Load dropdowns if needed
    if (currentScreen === 'templates') {
        loadTemplateDropdown();
    }
    if (currentScreen === 'editTemplates') {
        loadEditTemplatesDropdown();
    }
});
