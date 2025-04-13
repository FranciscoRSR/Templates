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
            templates = {};
            // Convert templates to new format
            for (const [key, value] of Object.entries(data.templates || {})) {
                if (typeof value === 'string') {
                    templates[key] = { body: value, excelInfo: [], steps: [] };
                } else {
                    templates[key] = {
                        body: value.body || '',
                        excelInfo: value.excelInfo || [],
                        steps: value.steps || []
                    };
                }
            }
        } else {
            console.log("No document found, saving default data...");
            await saveAllData();
        }
    } catch (error) {
        console.error("Error loading data:", error);
        cars = defaultData.cars || [];
        taxis = defaultData.taxis || [];
        hotels = defaultData.hotels || [];
        packages = defaultData.packages || [];
        templates = {};
        for (const [key, value] of Object.entries(defaultData.templates || {})) {
            templates[key] = { body: value, excelInfo: [], steps: [] };
        }
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
        loadTemplateDropdown(); // Ensure dropdown is populated
        showFields(); // Refresh fields if a template is selected
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
    select.innerHTML = '<option value="">-- Select a Template --</option>';
    // Ensure templates are sorted alphabetically
    const sortedTemplates = Object.keys(templates).sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
    select.innerHTML += sortedTemplates.map(key => `<option value="${key}">${key}</option>`).join('');
}

function showFields() {
    const emailType = document.getElementById('emailType').value;
    const fieldsDiv = document.getElementById('fields');
    fieldsDiv.innerHTML = '';
    document.getElementById('generateBtn').disabled = !emailType;

    if (!emailType) return;

    const template = templates[emailType];
    const templateBody = template.body || '';
    const excelInfo = template.excelInfo || [];
    const steps = template.steps || [];

    // Collect all placeholders uniquely
    let placeholders = extractPlaceholders(templateBody);
    excelInfo.forEach(col => {
        if (col.value) {
            placeholders.push(...extractPlaceholders(col.value));
        }
    });
    steps.forEach(step => {
        if (step.description) {
            placeholders.push(...extractPlaceholders(step.description));
        }
    });

    // Remove duplicates immediately
    placeholders = [...new Set(placeholders)].sort();

    let fields = '';

    // Generate input fields for unique placeholders
    placeholders.forEach(placeholder => {
        const id = placeholder;
        const label = placeholder.charAt(0).toUpperCase() + placeholder.slice(1);
        if (placeholder === 'car' || placeholder === 'car1' || placeholder === 'car2' || placeholder === 'carSPA' || placeholder === 'carNUR') {
            fields += `
                <label for="${id}">${label}:</label>
                <input type="text" id="${id}" list="${id}-list" autocomplete="off" placeholder="Type to search cars">
                <datalist id="${id}-list">
                    ${cars.map(car => `<option value="${car.name}">`).join('')}
                </datalist>
            `;
        } else if (placeholder === 'taxi') {
            fields += `
                <label for="${id}">${label}:</label>
                <select id="${id}">${taxis.map(taxi => `<option value="${taxi}">${taxi}</option>`).join('')}</select>
            `;
        } else if (placeholder === 'hotel') {
            fields += `
                <label for="${id}">${label}:</label>
                <select id="${id}" onchange="autoFillHotelEmailDynamic('${id}')">${hotels.map(hotel => `<option value="${hotel.name}">${hotel.name}</option>`).join('')}</select>
                <label for="${id}Email">Hotel Email:</label>
                <input type="email" id="${id}Email" readonly>
            `;
        } else if (placeholder === 'package' || placeholder === 'packageSPA' || placeholder === 'packageNUR') {
            fields += `
                <label for="${id}">${label}:</label>
                <select id="${id}">${packages.map(pkg => `<option value="${pkg}">${pkg}</option>`).join('')}</select>
            `;
        } else if (['date', 'date1', 'date2', 'dateSPA', 'dateNUR'].includes(placeholder)) {
            fields += `
                <label for="${id}">${label}:</label>
                <input type="date" id="${id}">
            `;
        } else if (placeholder.includes('time') || placeholder === 'firstTime' || placeholder === 'lastTime') {
            fields += `
                <label for="${id}">${label} (e.g., 08:00):</label>
                <input type="text" id="${id}" placeholder="e.g., 08:00">
            `;
        } else if (placeholder === 'kms' || placeholder === 'Laps') {
            fields += `
                <label for="${id}">${label}:</label>
                <input type="number" id="${id}" min="0" step="1">
            `;
        } else if (placeholder !== 'arrivalTime' && placeholder !== 'depositSection' && !placeholder.includes('day') && !placeholder.includes('month') && !placeholder.includes('year') && placeholder !== 'originalexcess' && placeholder !== 'insuranceexcess' && placeholder !== 'insuranceprice') {
            fields += `
                <label for="${id}">${label}:</label>
                <input type="text" id="${id}">
            `;
        }
    });

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
    if (!emailType) {
        alert('Please select a template.');
        return;
    }

    let subject = `RSRNurburg Email`;
    let template = templates[emailType] || { body: '', excelInfo: [], steps: [] };
    let body = template.body || '';

    // Collect unique placeholders
    let placeholders = extractPlaceholders(template.body || '');
    (template.excelInfo || []).forEach(col => {
        if (col.value) placeholders.push(...extractPlaceholders(col.value));
    });
    (template.steps || []).forEach(step => {
        if (step.description) placeholders.push(...extractPlaceholders(step.description));
    });
    const uniquePlaceholders = [...new Set(placeholders)];

    // Collect values from input fields
    let values = {};
    let missingFields = [];
    document.querySelectorAll('#fields input, #fields select').forEach(input => {
        if (input.value.trim() === '') {
            missingFields.push(input.id);
        }
        values[input.id] = input.value.trim();
        if (['car', 'car1', 'car2', 'carSPA', 'carNUR'].includes(input.id)) {
            const carExists = cars.some(car => car.name === input.value);
            if (!carExists && input.value) {
                alert(`Invalid car name for ${input.id}: ${input.value}`);
                return;
            }
        }
    });

    if (missingFields.length > 0) {
        alert(`Please fill in all fields: ${missingFields.join(', ')}`);
        return;
    }

    if (document.querySelector('#fields input:invalid')) {
        alert('Please correct invalid inputs.');
        return;
    }

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

    // Prepare replacement map
    let replacements = {};

    uniquePlaceholders.forEach(placeholder => {
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

    // Ensure all placeholders have values
    const computedPlaceholders = ['arrivalTime', 'depositSection', 'day', 'month', 'year', 'Day1', 'Month1', 'Year1', 'day2', 'month2', 'year2', 'daySPA', 'monthSPA', 'yearSPA', 'dayNUR', 'monthNUR', 'yearNUR', 'originalexcess', 'insuranceexcess', 'insuranceprice'];
    const missingPlaceholders = uniquePlaceholders.filter(p => !computedPlaceholders.includes(p) && (!replacements[p] || replacements[p].trim() === ''));
    if (missingPlaceholders.length > 0) {
        alert(`The following placeholders are missing values: ${missingPlaceholders.join(', ')}`);
        return;
    }

    // Replace placeholders in email body
    Object.keys(replacements).forEach(placeholder => {
        const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
        body = body.replace(regex, replacements[placeholder]);
    });

    document.getElementById('subject').value = subject;
    document.getElementById('body').value = body;

    // Handle Excel Information
    const excelInfoSection = document.getElementById('excelInfoSection');
    let excelData = { names: [], values: [] };

    if (template.excelInfo && Array.isArray(template.excelInfo) && template.excelInfo.length > 0) {
        excelInfoSection.classList.remove('hidden');
        template.excelInfo.forEach(col => {
            if (!col || typeof col !== 'object' || !col.column || col.value === undefined) return;
            let columnName = col.column;
            let columnValue = col.value;
            Object.keys(replacements).forEach(placeholder => {
                const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
                columnName = columnName.replace(regex, replacements[placeholder] || '');
                columnValue = columnValue.replace(regex, replacements[placeholder] || '');
            });
            excelData.names.push(columnName);
            // Normalize blank values to empty string
            excelData.values.push(columnValue.trim() === '' ? '' : columnValue);
        });
    } else {
        excelInfoSection.classList.add('hidden');
    }

    window.currentExcelData = excelData;

    // Handle Steps
    const stepsSection = document.getElementById('stepsSection');
    const stepsList = document.getElementById('stepsList');
    stepsList.innerHTML = '';
    template.steps = Array.isArray(template.steps) ? template.steps : [];

    if (template.steps.length > 0) {
        stepsSection.classList.remove('hidden');
        let stepsHTML = '<ol>';
        template.steps.forEach(step => {
            if (!step || typeof step !== 'object' || !step.description) return;
            let description = step.description;
            Object.keys(replacements).forEach(placeholder => {
                const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
                description = description.replace(regex, replacements[placeholder] || '');
            });
            let stepName = step.name && typeof step.name === 'string' ? step.name : 'Step';
            stepsHTML += `
                <li>
                    <strong>${stepName}</strong>
                    <p>${description}</p>
                </li>
            `;
        });
        stepsHTML += '</ol>';
        stepsList.innerHTML = stepsHTML;
        if (stepsList.innerHTML === '<ol></ol>') {
            stepsSection.classList.add('hidden');
        }
    } else {
        stepsSection.classList.add('hidden');
    }
}

function copyExcelInfo() {
    const data = window.currentExcelData;
    if (!data || !data.values.length) {
        alert('No Excel data available to copy.');
        return;
    }
    const text = data.values.join('\t');
    navigator.clipboard.writeText(text).then(() => {
        alert('Excel values copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy Excel data:', err);
        alert('Failed to copy Excel data.');
    });
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
    const excelColumnsList = document.getElementById('excelColumnsList');
    const stepsEditList = document.getElementById('stepsEditList');
    const template = templates[select.value] || {};

    textarea.value = typeof template === 'string' ? template : template.body || '';
    
    // Load Excel Columns
    excelColumnsList.innerHTML = '';
    const excelInfo = template.excelInfo || [];
    excelInfo.forEach((col, index) => {
        excelColumnsList.innerHTML += `
            <div class="list-item">
                <label>Column Name:</label>
                <input type="text" value="${col.column}" id="excelColumn-${index}">
                <label>Default Value:</label>
                <input type="text" value="${col.value || ''}" id="excelValue-${index}">
                <button onclick="removeExcelColumn(${index})">Remove</button>
            </div>
        `;
    });

    // Load Steps
    stepsEditList.innerHTML = '';
    const steps = template.steps || [];
    steps.forEach((step, index) => {
        stepsEditList.innerHTML += `
            <div class="list-item">
                <label>Step Name:</label>
                <input type="text" value="${step.name}" id="stepName-${index}">
                <label>Description:</label>
                <textarea id="stepDesc-${index}">${step.description}</textarea>
                <button onclick="removeStep(${index})">Remove</button>
            </div>
        `;
    });
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
        templates[newName] = templates[currentName];
        delete templates[currentName];
        saveAllData().then(() => {
            loadEditTemplatesDropdown();
            document.getElementById('templateSelect').value = newName;
            loadTemplateToEdit();
            alert('Template renamed successfully!');
        });
    } else if (newName === currentName) {
        return;
    } else if (templates[newName]) {
        alert('Template name already exists!');
    }
}

function addExcelColumn() {
    const select = document.getElementById('templateSelect');
    if (!select.value) {
        alert('Please select a template first.');
        return;
    }
    const columnName = prompt('Enter Excel column name:');
    if (columnName) {
        const columnValue = prompt('Enter default value for this column (optional):') || '';
        const template = templates[select.value];
        template.excelInfo = template.excelInfo || [];
        template.excelInfo.push({ column: columnName, value: columnValue });
        loadTemplateToEdit();
    }
}

function removeExcelColumn(index) {
    const select = document.getElementById('templateSelect');
    if (select.value) {
        templates[select.value].excelInfo.splice(index, 1);
        loadTemplateToEdit();
    }
}

function addStep() {
    const select = document.getElementById('templateSelect');
    if (!select.value) {
        alert('Please select a template first.');
        return;
    }
    const stepName = prompt('Enter step name:');
    if (stepName) {
        const template = templates[select.value];
        template.steps = template.steps || [];
        template.steps.push({ name: stepName, description: '' });
        loadTemplateToEdit();
    }
}

function removeStep(index) {
    const select = document.getElementById('templateSelect');
    if (select.value) {
        templates[select.value].steps.splice(index, 1);
        loadTemplateToEdit();
    }
}
  
function addTemplate() {
    const name = prompt('Enter new template name:');
    if (name && !templates[name]) {
        templates[name] = {
            body: '',
            excelInfo: [],
            steps: []
        };
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
    const excelColumnsList = document.getElementById('excelColumnsList');
    const stepsEditList = document.getElementById('stepsEditList');
    
    if (select.value) {
        const template = templates[select.value] || {};
        
        // Save body
        template.body = textarea.value;
        
        // Save Excel columns
        template.excelInfo = Array.from(excelColumnsList.querySelectorAll('.list-item')).map((_, index) => ({
            column: document.getElementById(`excelColumn-${index}`).value,
            value: document.getElementById(`excelValue-${index}`).value
        }));
        
        // Save steps
        template.steps = Array.from(stepsEditList.querySelectorAll('.list-item')).map((_, index) => ({
            name: document.getElementById(`stepName-${index}`).value,
            description: document.getElementById(`stepDesc-${index}`).value
        }));
        
        templates[select.value] = template;
        saveAllData().then(() => alert('Template saved!'));
    }
}

function deleteTemplate() {
    const select = document.getElementById('templateSelect');
    if (select.value && confirm(`Delete ${select.value}?`)) {
        delete templates[select.value];
        saveAllData().then(() => {
            loadEditTemplatesDropdown();
            document.getElementById('templateBody').value = '';
        });
    }
}

// Initial setup
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    showScreen('initial');
    
    // Load dropdowns if needed
    if (currentScreen === 'templates') {
        loadTemplateDropdown();
        showFields();
    }
    if (currentScreen === 'editTemplates') {
        loadEditTemplatesDropdown();
    }
});
