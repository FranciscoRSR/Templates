import { getCars, getTaxis, getHotels, getPackages, getTemplates, getCategories, loadData } from './dataManager.js';
import { extractPlaceholders } from './utils.js';

let currentScreen = 'initial';
let isSidebarListVisible = false;
const pageSize = 10;

export function toggleTheme() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

export function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
}

export function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.getElementById('hamburgerBtn');
    const mainContent = document.getElementById('mainContent');
    sidebar.classList.toggle('active');
    hamburger.classList.toggle('active');
    mainContent.classList.toggle('shifted');
}

export function showScreen(screenId) {
    const screens = ['initialScreen', 'templatesScreen', 'editListScreen', 'editTemplatesScreen'];
    screens.forEach(id => document.getElementById(id).classList.add('hidden'));
    document.getElementById(`${screenId}Screen`).classList.remove('hidden');

    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const initialListOptions = document.getElementById('initialListOptions');
    const sidebarListOptions = document.getElementById('sidebarListOptions');
    const hamburger = document.getElementById('hamburgerBtn');

    if (screenId === 'initial') {
        sidebar.classList.add('hidden');
        sidebar.classList.remove('active');
        mainContent.classList.remove('shifted');
        hamburger.classList.remove('active');
        initialListOptions.style.display = 'none';
        sidebarListOptions.style.display = 'none';
    } else {
        sidebar.classList.remove('hidden');
        if (window.innerWidth > 768) {
            sidebar.classList.add('active');
        }
        sidebarListOptions.style.display = (screenId === 'editList' && isSidebarListVisible) ? 'flex' : 'none';
        initialListOptions.style.display = 'none';
    }
    currentScreen = screenId;

    if (screenId === 'templates') {
        loadCategoryDropdown();
        loadTemplateDropdown();
        showFields();
    }
    if (screenId === 'editTemplates') {
        loadCategoryDropdown();
        loadEditTemplatesDropdown();
    }
    if (screenId === 'editList') {
        showListEditor(currentScreen.listType || 'cars');
    }
}

export function toggleInitialEditList() {
    const initialListOptions = document.getElementById('initialListOptions');
    initialListOptions.style.display = (initialListOptions.style.display === 'none' || initialListOptions.style.display === '') ? 'flex' : 'none';
}

export function toggleEditList() {
    isSidebarListVisible = !isSidebarListVisible;
    const sidebarListOptions = document.getElementById('sidebarListOptions');
    sidebarListOptions.style.display = isSidebarListVisible ? 'flex' : 'none';
}

export async function loadTemplateDropdown(page = 1) {
    const dropdown = document.getElementById('emailType');
    const categorySelect = document.getElementById('categorySelect');
    const selectedCategory = categorySelect ? categorySelect.value : '';
    const fragment = document.createDocumentFragment();
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a template';
    fragment.appendChild(defaultOption);

    await loadData('templates', pageSize);
    const templates = getTemplates();
    const filteredTemplates = Object.keys(templates)
        .filter(key => !selectedCategory || templates[key].category === selectedCategory)
        .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
        .slice((page - 1) * pageSize, page * pageSize);

    filteredTemplates.forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key;
        fragment.appendChild(option);
    });

    dropdown.innerHTML = '';
    dropdown.appendChild(fragment);

    // Add pagination controls
    const paginationDiv = document.getElementById('templatePagination') || document.createElement('div');
    paginationDiv.id = 'templatePagination';
    paginationDiv.innerHTML = `
        <button onclick="loadTemplateDropdown(${page - 1})" ${page === 1 ? 'disabled' : ''}>Previous</button>
        <span>Page ${page}</span>
        <button onclick="loadTemplateDropdown(${page + 1})">Next</button>
    `;
    dropdown.parentElement.appendChild(paginationDiv);
}

export function showFields() {
    const emailTypeInput = document.getElementById('emailType');
    const emailType = emailTypeInput.value;
    const fieldsDiv = document.getElementById('fields');
    const fragment = document.createDocumentFragment();
    const templates = getTemplates();
    document.getElementById('generateBtn').disabled = !emailType || !templates[emailType];

    if (!emailType || !templates[emailType]) {
        fieldsDiv.innerHTML = '';
        return;
    }

    const template = templates[emailType];
    const templateBody = template.body || '';
    const excelInfo = template.excelInfo || [];
    const steps = template.steps || [];

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

    placeholders = [...new Set(placeholders)].sort();

    const datePlaceholderMap = {};
    ['day', 'month', 'year'].forEach(p => {
        if (placeholders.includes(p)) {
            datePlaceholderMap['date'] = datePlaceholderMap['date'] || [];
            datePlaceholderMap['date'].push(p);
        }
    });
    ['day1', 'month1', 'year1', 'Day1', 'Month1', 'Year1'].forEach(p => {
        if (placeholders.includes(p)) {
            datePlaceholderMap['date1'] = datePlaceholderMap['date1'] || [];
            datePlaceholderMap['date1'].push(p);
        }
    });
    ['day2', 'month2', 'year2', 'Day2', 'Month2', 'Year2'].forEach(p => {
        if (placeholders.includes(p)) {
            datePlaceholderMap['date2'] = datePlaceholderMap['date2'] || [];
            datePlaceholderMap['date2'].push(p);
        }
    });
    ['daySPA', 'monthSPA', 'yearSPA'].forEach(p => {
        if (placeholders.includes(p)) {
            datePlaceholderMap['dateSPA'] = datePlaceholderMap['dateSPA'] || [];
            datePlaceholderMap['dateSPA'].push(p);
        }
    });
    ['dayNUR', 'monthNUR', 'yearNUR'].forEach(p => {
        if (placeholders.includes(p)) {
            datePlaceholderMap['dateNUR'] = datePlaceholderMap['dateNUR'] || [];
            datePlaceholderMap['dateNUR'].push(p);
        }
    });

    Object.keys(datePlaceholderMap).forEach(dateField => {
        if (!placeholders.includes(dateField)) {
            placeholders.push(dateField);
        }
    });

    placeholders = [...new Set(placeholders)].sort();

    const cars = getCars();
    const taxis = getTaxis();
    const hotels = getHotels();
    const packages = getPackages();

    placeholders.forEach(placeholder => {
        const id = placeholder;
        const label = document.createElement('label');
        label.htmlFor = id;
        label.textContent = placeholder.charAt(0).toUpperCase() + placeholder.slice(1) + ':';
        fragment.appendChild(label);

        if (placeholder === 'car' || placeholder === 'car1' || placeholder === 'car2' || placeholder === 'carSPA' || placeholder === 'carNUR') {
            const select = document.createElement('select');
            select.id = id;
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select a car';
            select.appendChild(defaultOption);
            cars.forEach(car => {
                const option = document.createElement('option');
                option.value = car.name;
                option.textContent = car.name;
                select.appendChild(option);
            });
            fragment.appendChild(select);
        } else if (placeholder === 'taxi') {
            const select = document.createElement('select');
            select.id = id;
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select a taxi';
            select.appendChild(defaultOption);
            taxis.forEach(taxi => {
                const option = document.createElement('option');
                option.value = taxi;
                option.textContent = taxi;
                select.appendChild(option);
            });
            fragment.appendChild(select);
        } else if (placeholder === 'hotel') {
            const select = document.createElement('select');
            select.id = id;
            select.setAttribute('onchange', `autoFillHotelEmailDynamic('${id}')`);
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select a hotel';
            select.appendChild(defaultOption);
            hotels.forEach(hotel => {
                const option = document.createElement('option');
                option.value = hotel.name;
                option.textContent = hotel.name;
                select.appendChild(option);
            });
            fragment.appendChild(select);

            const emailLabel = document.createElement('label');
            emailLabel.htmlFor = `${id}Email`;
            emailLabel.textContent = 'Hotel Email:';
            fragment.appendChild(emailLabel);

            const emailInput = document.createElement('input');
            emailInput.type = 'email';
            emailInput.id = `${id}Email`;
            emailInput.readOnly = true;
            fragment.appendChild(emailInput);
        } else if (placeholder === 'package' || placeholder === 'packageSPA' || placeholder === 'packageNUR') {
            const select = document.createElement('select');
            select.id = id;
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select a package';
            select.appendChild(defaultOption);
            packages.forEach(pkg => {
                const option = document.createElement('option');
                option.value = pkg;
                option.textContent = pkg;
                select.appendChild(option);
            });
            fragment.appendChild(select);
        } else if (['date', 'date1', 'date2', 'dateSPA', 'dateNUR'].includes(placeholder)) {
            const input = document.createElement('input');
            input.type = 'date';
            input.id = id;
            fragment.appendChild(input);
        } else if (placeholder.includes('time') || placeholder === 'firstTime' || placeholder === 'lastTime') {
            const input = document.createElement('input');
            input.type = 'text';
            input.id = id;
            input.placeholder = 'e.g., 08:00';
            fragment.appendChild(input);
        } else if (placeholder === 'kms' || placeholder === 'Laps') {
            const input = document.createElement('input');
            input.type = 'number';
            input.id = id;
            input.min = '0';
            input.step = '1';
            fragment.appendChild(input);
        } else if (placeholder !== 'arrivalTime' && placeholder !== 'depositSection' && placeholder !== 'day' && placeholder !== 'month' && placeholder !== 'year' && placeholder !== 'day1' && placeholder !== 'month1' && placeholder !== 'year1' && placeholder !== 'Day1' && placeholder !== 'Month1' && placeholder !== 'Year1' && placeholder !== 'day2' && placeholder !== 'month2' && placeholder !== 'year2' && placeholder !== 'daySPA' && placeholder !== 'monthSPA' && placeholder !== 'yearSPA' && placeholder !== 'dayNUR' && placeholder !== 'monthNUR' && placeholder !== 'yearNUR' && placeholder !== 'originalexcess' && placeholder !== 'insuranceexcess' && placeholder !== 'insuranceprice') {
            const input = document.createElement('input');
            input.type = 'text';
            input.id = id;
            fragment.appendChild(input);
        }
    });

    fieldsDiv.innerHTML = '';
    fieldsDiv.appendChild(fragment);
}

export function autoFillHotelEmailDynamic(hotelId) {
    const hotelSelect = document.getElementById(hotelId);
    const hotelEmail = document.getElementById(`${hotelId}Email`);
    const hotels = getHotels();
    const selectedHotel = hotels.find(h => h.name === hotelSelect.value);
    hotelEmail.value = selectedHotel ? selectedHotel.email : '';
}

export async function showListEditor(listType) {
    currentScreen.listType = listType;
    const editor = document.getElementById('listEditor');
    editor.classList.remove('hidden');
    document.getElementById('listTitle').textContent = `Edit ${listType.charAt(0).toUpperCase() + listType.slice(1)}`;

    const itemsDiv = document.getElementById('listItems');
    const newItemForm = document.getElementById('newItemForm');
    const fragment = document.createDocumentFragment();

    await loadData(listType, pageSize);
    let list = [];
    switch (listType) {
        case 'cars':
            list = getCars();
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
                const div = document.createElement('div');
                div.className = 'list-item';
                div.innerHTML = `
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
                `;
                fragment.appendChild(div);
            });
            break;
        case 'taxis':
            list = getTaxis();
            newItemForm.innerHTML = `
                <label for="newItemName">Taxi Name:</label>
                <input type="text" id="newItemName">
                <button onclick="addItem('taxis')">Add</button>
            `;
            list.forEach((item, index) => {
                const div = document.createElement('div');
                div.className = 'list-item';
                div.innerHTML = `<input type="text" value="${item}" id="taxi-${index}"><button onclick="removeItem('taxis', ${index})">Remove</button>`;
                fragment.appendChild(div);
            });
            break;
        case 'hotels':
            list = getHotels();
            newItemForm.innerHTML = `
                <label for="newItemName">Hotel Name:</label>
                <input type="text" id="newItemName">
                <label for="newItemEmail">Contact Email:</label>
                <input type="email" id="newItemEmail">
                <button onclick="addItem('hotels')">Add</button>
            `;
            list.forEach((item, index) => {
                const div = document.createElement('div');
                div.className = 'list-item';
                div.innerHTML = `
                    <input type="text" value="${item.name}" id="hotelName-${index}">
                    <input type="email" value="${item.email}" id="hotelEmail-${index}">
                    <button onclick="removeItem('hotels', ${index})">Remove</button>
                `;
                fragment.appendChild(div);
            });
            break;
        case 'packages':
            list = getPackages();
            newItemForm.innerHTML = `
                <label for="newItemName">Package Name:</label>
                <input type="text" id="newItemName">
                <button onclick="addItem('packages')">Add</button>
            `;
            list.forEach((item, index) => {
                const div = document.createElement('div');
                div.className = 'list-item';
                div.innerHTML = `<input type="text" value="${item}" id="package-${index}"><button onclick="removeItem('packages', ${index})">Remove</button>`;
                fragment.appendChild(div);
            });
            break;
    }

    itemsDiv.innerHTML = '';
    itemsDiv.appendChild(fragment);

    // Add pagination controls
    const paginationDiv = document.getElementById('listPagination') || document.createElement('div');
    paginationDiv.id = 'listPagination';
    paginationDiv.innerHTML = `
        <button onclick="showListEditor('${listType}', ${page - 1})" ${page === 1 ? 'disabled' : ''}>Previous</button>
        <span>Page ${page}</span>
        <button onclick="showListEditor('${listType}', ${page + 1})">Next</button>
    `;
    itemsDiv.parentElement.appendChild(paginationDiv);
}

export function toggleDeposit(index) {
    const checkbox = document.querySelector(`#listItems .list-item:nth-child(${index + 1}) input[type='checkbox']`);
    const depositInput = document.getElementById(`carDeposit-${index}`);
    if (checkbox && depositInput) depositInput.disabled = !checkbox.checked;
}

export async function loadEditTemplatesDropdown(page = 1) {
    const dropdown = document.getElementById('templateSelect');
    const categorySelect = document.getElementById('categorySelect');
    const selectedCategory = categorySelect ? categorySelect.value : '';
    const fragment = document.createDocumentFragment();
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a template';
    fragment.appendChild(defaultOption);

    await loadData('templates', pageSize);
    const templates = getTemplates();
    const filteredTemplates = Object.keys(templates)
        .filter(key => !selectedCategory || templates[key].category === selectedCategory)
        .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
        .slice((page - 1) * pageSize, page * pageSize);

    filteredTemplates.forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key;
        fragment.appendChild(option);
    });

    dropdown.innerHTML = '';
    dropdown.appendChild(fragment);

    // Add pagination controls
    const paginationDiv = document.getElementById('editTemplatePagination') || document.createElement('div');
    paginationDiv.id = 'editTemplatePagination';
    paginationDiv.innerHTML = `
        <button onclick="loadEditTemplatesDropdown(${page - 1})" ${page === 1 ? 'disabled' : ''}>Previous</button>
        <span>Page ${page}</span>
        <button onclick="loadEditTemplatesDropdown(${page + 1})">Next</button>
    `;
    dropdown.parentElement.appendChild(paginationDiv);

    loadTemplateToEdit();
}

export function loadTemplateToEdit() {
    const templateInput = document.getElementById('templateSelect');
    const templateKey = templateInput.value;
    const textarea = document.getElementById('templateBody');
    const subjectInput = document.getElementById('templateSubject');
    const excelColumnsList = document.getElementById('excelColumnsList');
    const stepsEditList = document.getElementById('stepsEditList');
    const categoryInput = document.getElementById('templateCategory');
    const templates = getTemplates();
    const template = templates[templateKey] || {};

    if (!templateKey || !templates[templateKey]) {
        textarea.value = '';
        subjectInput.value = '';
        excelColumnsList.innerHTML = '';
        stepsEditList.innerHTML = '';
        categoryInput.value = '';
        return;
    }

    textarea.value = typeof template === 'string' ? template : template.body || '';
    subjectInput.value = template.subject || '';
    categoryInput.value = template.category || 'Uncategorized';

    const excelFragment = document.createDocumentFragment();
    const excelInfo = template.excelInfo || [];
    excelInfo.forEach((col, index) => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <label>Column Name:</label>
            <input type="text" value="${col.column}" id="excelColumn-${index}">
            <label>Default Value:</label>
            <input type="text" value="${col.value || ''}" id="excelValue-${index}">
            <button onclick="removeExcelColumn(${index})">Remove</button>
        `;
        excelFragment.appendChild(div);
    });
    excelColumnsList.innerHTML = '';
    excelColumnsList.appendChild(excelFragment);

    const stepsFragment = document.createDocumentFragment();
    const steps = template.steps || [];
    steps.forEach((step, index) => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <label>Step Name:</label>
            <input type="text" value="${step.name}" id="stepName-${index}">
            <label>Description:</label>
            <textarea id="stepDesc-${index}">${step.description}</textarea>
            <button onclick="removeStep(${index})">Remove</button>
        `;
        stepsFragment.appendChild(div);
    });
    stepsEditList.innerHTML = '';
    stepsEditList.appendChild(stepsFragment);
}

export function loadCategoryDropdown() {
    const categorySelect = document.getElementById('categorySelect');
    const categoryInput = document.getElementById('templateCategory');
    const categories = getCategories();
    const fragment = document.createDocumentFragment();

    if (categorySelect) {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'All Categories';
        fragment.appendChild(defaultOption);
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            fragment.appendChild(option);
        });
        categorySelect.innerHTML = '';
        categorySelect.appendChild(fragment);
    }

    if (categoryInput) {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a category';
        fragment.appendChild(defaultOption);
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            fragment.appendChild(option);
        });
        categoryInput.innerHTML = '';
        categoryInput.appendChild(fragment);
    }
}
