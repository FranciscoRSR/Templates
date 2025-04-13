// Predefined lists
let cars = [
    { name: "BMW M240i", requiresDeposit: false, depositAmount: 0 },
    { name: "VW Golf R", requiresDeposit: false, depositAmount: 0 },
    { name: "Porsche GT3", requiresDeposit: true, depositAmount: 10000 },
    { name: "Nissan GT-R", requiresDeposit: false, depositAmount: 0 },
    { name: "Hyundai i30N", requiresDeposit: false, depositAmount: 0 },
    { name: "Porsche GT3 RS", requiresDeposit: true, depositAmount: 15000 }
];
let taxis = ["Audi e-tron", "BMW M5", "Porsche GT3 RS"];
let hotels = [
    { name: "Tiergarten Hotel", email: "info@tiergartenhotel.com" },
    { name: "Blaue Ecke", email: "reservations@blaueecke.com" }
];
let packages = ["Allinc Package", "Track Self Drive", "Taxi Lap"];

let templates = {
    PremiumTrackDays: `Hello {name},

Unfortunately, we don’t have the schedule for TF on Nürburgring 2023 yet but, we already have some dates for our Premium Track Days on SPA!

On our Premium Track Days we rent all the track only for us, and you can go on your own car paying only the entry or rent one of our car fleet https://rsrbooking.com/cars (WE ALREADY HAVE THE PORSCHE GT3 RS 992).

If you are interested in this, please tell me on which date, and I'll help you with the perfect package for you!

Any questions, just let me know.`,
    BookingConfirmationDeposit: `Hi {name},

As I mentioned previously, we require a deposit of €{deposit} for your booking of the {car} for {laps} {package} on the next {day} of {month} {year}. Here is a LINK https://www.saferpay.com/SecurePayGate/Payment/651824/17726469/df189ddc-2190-4ba5-9b48-2ab40d4842e1 for you to make the deposit. This payment will not be processed, and we will cancel it once the car is returned.`,
    BookingConfirmationFull: `Hello {name},

Thank you for booking with RSR! I’m happy to confirm that everything is available and booked:

{day}/{month}/{year} {time}
{car} - {laps} {package}

We are expecting you at our office at {arrivalTime} at latest to finalise the paperwork and for the drivers briefing.

RSRNurburg,
Antoniusweg 1a
53520 Nurburg
Germany

I will be your contact person, so if you have any questions feel free to contact me and I will help you.
{depositSection}`,
    TaxiLapOffer: `Hello {name},

My name is Francisco, I'll be your contact with RSR.

Regarding your question, I can offer you a taxi lap in the {taxi} on the {day} of {month} {year} from {firstTime} to {lastTime}. If that sounds good to you, please confirm the time, and here is the payment link https://www.saferpay.com/SecurePayGate/Payment/651824/17726469/58cd919f-995a-4a00-aa9a-e50880d1602b to make the booking.

If you have any doubts, feel free to let me know.`,
    HotelRecommendation: `Hello dear {hotel} team,

Our customer {name} is looking for a room for the {day} of {month} {year}. We will be very happy if you can help him.

I let you deal with this yourselves.`
};

let currentScreen = 'initial';
let isSidebarListVisible = false;

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
    if (screenId === 'templates') loadTemplateDropdown();
    if (screenId === 'editTemplates') loadEditTemplatesDropdown();
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
    select.innerHTML = '<option value="">-- Select a Template --</option>' + 
        Object.keys(templates).map(key => `<option value="${key}">${key}</option>`).join('');
}

function showFields() {
    const emailType = document.getElementById('emailType').value;
    const fieldsDiv = document.getElementById('fields');
    fieldsDiv.innerHTML = '';
    document.getElementById('generateBtn').disabled = !emailType;

    if (!emailType) return;

    let fields = '<label for="name">Name:</label><input type="text" id="name">';
    switch (emailType) {
        case 'PremiumTrackDays':
            break;
        case 'BookingConfirmationDeposit':
            fields += `
                <label for="car">Car:</label>
                <select id="car">${cars.map(car => `<option value="${car.name}">${car.name}</option>`).join('')}</select>
                <label for="date">Date:</label>
                <input type="date" id="date">
                <label for="laps">Laps (e.g., 6 laps):</label>
                <input type="text" id="laps">
                <label for="package">Package:</label>
                <select id="package">${packages.map(pkg => `<option value="${pkg}">${pkg}</option>`).join('')}</select>
            `;
            break;
        case 'BookingConfirmationFull':
            fields += `
                <label for="car">Car:</label>
                <select id="car">${cars.map(car => `<option value="${car.name}">${car.name}</option>`).join('')}</select>
                <label for="date">Date:</label>
                <input type="date" id="date">
                <label for="laps">Laps (e.g., 4 laps):</label>
                <input type="text" id="laps">
                <label for="time">Time (e.g., 08:00):</label>
                <input type="text" id="time">
                <label for="package">Package:</label>
                <select id="package">${packages.map(pkg => `<option value="${pkg}">${pkg}</option>`).join('')}</select>
            `;
            break;
        case 'TaxiLapOffer':
            fields += `
                <label for="taxi">Taxi:</label>
                <select id="taxi">${taxis.map(taxi => `<option value="${taxi}">${taxi}</option>`).join('')}</select>
                <label for="date">Date:</label>
                <input type="date" id="date">
                <label for="firstTime">First Time (e.g., 08:00):</label>
                <input type="text" id="firstTime">
                <label for="lastTime">Last Time (e.g., 19:00):</label>
                <input type="text" id="lastTime">
            `;
            break;
        case 'HotelRecommendation':
            fields += `
                <label for="hotel">Hotel:</label>
                <select id="hotel" onchange="autoFillHotelEmail()">${hotels.map(hotel => `<option value="${hotel.name}">${hotel.name}</option>`).join('')}</select>
                <label for="hotelEmail">Hotel Email:</label>
                <input type="email" id="hotelEmail" readonly>
                <label for="date">Date:</label>
                <input type="date" id="date">
            `;
            break;
    }
    fieldsDiv.innerHTML = fields;
}

function autoFillHotelEmail() {
    const hotelSelect = document.getElementById('hotel');
    const hotelEmail = document.getElementById('hotelEmail');
    const selectedHotel = hotels.find(h => h.name === hotelSelect.value);
    hotelEmail.value = selectedHotel ? selectedHotel.email : '';
}

function generateEmail() {
    const emailType = document.getElementById('emailType').value;
    let subject = '';
    let body = templates[emailType] || '';

    switch (emailType) {
        case 'PremiumTrackDays': {
            const name = document.getElementById('name').value;
            subject = `RSRNurburg`;
            body = body.replace('{name}', name);
            break;
        }
        case 'BookingConfirmationDeposit': {
            const name = document.getElementById('name').value;
            const car = document.getElementById('car').value;
            const date = new Date(document.getElementById('date').value);
            const day = date.getDate().toString().padStart(2, '0');
            const month = date.toLocaleString('default', { month: 'long' });
            const year = date.getFullYear();
            const laps = document.getElementById('laps').value;
            const pkg = document.getElementById('package').value;
            const selectedCar = cars.find(c => c.name === car);
            const deposit = selectedCar.requiresDeposit ? selectedCar.depositAmount : 0;
            subject = `RSRNurburg Booking Confirmation`;
            body = body.replace('{name}', name).replace('{car}', car).replace('{day}', day).replace('{month}', month).replace('{year}', year).replace('{laps}', laps).replace('{package}', pkg).replace('{deposit}', deposit);
            if (!selectedCar.requiresDeposit) body = body.replace('As I mentioned previously, we require a deposit of €{deposit} for your booking of the {car} for {laps} {package} on the next {day} of {month} {year}. Here is a LINK https://www.saferpay.com/SecurePayGate/Payment/651824/17726469/df189ddc-2190-4ba5-9b48-2ab40d4842e1 for you to make the deposit. This payment will not be processed, and we will cancel it once the car is returned.', '');
            break;
        }
        case 'BookingConfirmationFull': {
            const name = document.getElementById('name').value;
            const car = document.getElementById('car').value;
            const date = new Date(document.getElementById('date').value);
            const day = date.getDate().toString().padStart(2, '0');
            const month = date.toLocaleString('default', { month: 'long' });
            const year = date.getFullYear();
            const laps = document.getElementById('laps').value;
            const time = document.getElementById('time').value;
            const arrivalTime = `${parseInt(time.split(':')[0]) - 1}:00`;
            const pkg = document.getElementById('package').value;
            const selectedCar = cars.find(c => c.name === car);
            subject = `RSRNurburg Booking Confirmation`;
            body = body.replace('{name}', name).replace('{car}', car).replace('{day}', day).replace('{month}', month).replace('{year}', year).replace('{laps}', laps).replace('{time}', time).replace('{arrivalTime}', arrivalTime).replace('{package}', pkg);
            body = body.replace('{depositSection}', selectedCar.requiresDeposit ? `\n\nDeposit: Finally, for this car you must make a deposit of €${selectedCar.depositAmount}. So I send you the payment link to do that deposit. This is a payment that we are not going to take and when the car is back we cancel it.` : '');
            break;
        }
        case 'TaxiLapOffer': {
            const name = document.getElementById('name').value;
            const taxi = document.getElementById('taxi').value;
            const date = new Date(document.getElementById('date').value);
            const day = date.getDate().toString().padStart(2, '0');
            const month = date.toLocaleString('default', { month: 'long' });
            const year = date.getFullYear();
            const firstTime = document.getElementById('firstTime').value;
            const lastTime = document.getElementById('lastTime').value;
            subject = `Taxi Lap ${taxi} - ${day} of ${month}`;
            body = body.replace('{name}', name).replace('{taxi}', taxi).replace('{day}', day).replace('{month}', month).replace('{year}', year).replace('{firstTime}', firstTime).replace('{lastTime}', lastTime);
            break;
        }
        case 'HotelRecommendation': {
            const name = document.getElementById('name').value;
            const hotel = document.getElementById('hotel').value;
            const date = new Date(document.getElementById('date').value);
            const day = date.getDate().toString().padStart(2, '0');
            const month = date.toLocaleString('default', { month: 'long' });
            const year = date.getFullYear();
            subject = `RSR Nurburg Hotel recommendation`;
            body = body.replace('{name}', name).replace('{hotel}', hotel).replace('{day}', day).replace('{month}', month).replace('{year}', year);
            break;
        }
    }

    document.getElementById('subject').value = subject;
    document.getElementById('body').value = body;
}

function copyToClipboard() {
    const subject = document.getElementById('subject').value;
    const body = document.getElementById('body').value;
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`).then(() => alert('Email copied to clipboard!'));
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
                <button onclick="addItem('cars')">Add</button>
            `;
            document.getElementById('requiresDeposit').addEventListener('change', function() {
                document.getElementById('depositAmount').disabled = !this.checked;
            });
            list.forEach((item, index) => {
                itemsDiv.innerHTML += `
                    <div class="list-item">
                        <input type="text" value="${item.name}" id="carName-${index}">
                        <label><input type="checkbox" ${item.requiresDeposit ? 'checked' : ''} onchange="toggleDeposit(${index})">Deposit</label>
                        <input type="number" value="${item.depositAmount}" id="carDeposit-${index}" ${item.requiresDeposit ? '' : 'disabled'}>
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
            cars.push({ name, requiresDeposit, depositAmount });
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
    showListEditor(listType);
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

function saveList() {
    const listType = document.getElementById('listTitle').textContent.split(' ')[1].toLowerCase();
    switch (listType) {
        case 'cars':
            cars = Array.from(document.querySelectorAll('#listItems .list-item')).map((_, index) => ({
                name: document.getElementById(`carName-${index}`).value,
                requiresDeposit: document.querySelector(`#listItems .list-item:nth-child(${index + 1}) input[type='checkbox']`).checked,
                depositAmount: parseInt(document.getElementById(`carDeposit-${index}`).value) || 0
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
    alert(`${listType} list saved!`);
}

// Edit Templates Functions
function loadEditTemplatesDropdown() {
    const select = document.getElementById('templateSelect');
    select.innerHTML = '<option value="">-- Select a Template --</option>' + 
        Object.keys(templates).map(key => `<option value="${key}">${key}</option>`).join('');
    loadTemplateToEdit();
}

function loadTemplateToEdit() {
    const select = document.getElementById('templateSelect');
    const textarea = document.getElementById('templateBody');
    textarea.value = templates[select.value] || '';
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
        alert('Template saved!');
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
document.addEventListener('DOMContentLoaded', () => {
    showScreen('initial');
});