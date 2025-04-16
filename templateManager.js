import { getCars, getTemplates, saveAllData, updateList, addTemplate, renameTemplate, deleteTemplate, updateTemplate } from './dataManager.js';
import { extractPlaceholders } from './utils.js';

const sampleData = {
    car: "Porsche 911",
    car1: "BMW M3",
    car2: "Audi R8",
    carSPA: "Mercedes AMG",
    carNUR: "Ferrari 488",
    taxi: "Standard Taxi",
    hotel: "Hotel Example",
    hotelEmail: "contact@hotelexample.com",
    package: "Track Day Package",
    packageSPA: "Spa Experience",
    packageNUR: "Nurburgring Tour",
    date: "15 October 2025",
    date1: "16 October 2025",
    date2: "17 October 2025",
    dateSPA: "18 October 2025",
    dateNUR: "19 October 2025",
    time: "09:00",
    firstTime: "08:00",
    lastTime: "17:00",
    kms: "100",
    Laps: "5",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "123-456-7890",
    arrivalTime: "08:00",
    depositSection: "Sample deposit section",
    day: "15",
    month: "October",
    year: "2025",
    Day1: "16",
    Month1: "October",
    Year1: "2025",
    day2: "17",
    month2: "October",
    year2: "2025",
    daySPA: "18",
    monthSPA: "October",
    yearSPA: "2025",
    dayNUR: "19",
    monthNUR: "October",
    yearNUR: "2025",
    originalexcess: "5000",
    insuranceexcess: "1000",
    insuranceprice: "200"
};

export function generateEmail() {
    const emailTypeInput = document.getElementById('emailType');
    const emailType = emailTypeInput.value;
    const templates = getTemplates();
    if (!emailType || !templates[emailType]) {
        alert('Please select a valid template.');
        return;
    }

    let subject = templates[emailType].subject || `RSRNurburg Email`;
    let template = templates[emailType] || { body: '', excelInfo: [], steps: [] };
    let body = template.body || '';

    let placeholders = extractPlaceholders(template.body || '');
    (template.excelInfo || []).forEach(col => {
        if (col.value) placeholders.push(...extractPlaceholders(col.value));
    });
    (template.steps || []).forEach(step => {
        if (step.description) placeholders.push(...extractPlaceholders(step.description));
    });
    const uniquePlaceholders = [...new Set(placeholders)];

    let values = {};
    let missingFields = [];
    document.querySelectorAll('#fields input, #fields select').forEach(input => {
        if (input.value.trim() === '') {
            missingFields.push(input.id);
        }
        values[input.id] = input.value.trim();
        if (['car', 'car1', 'car2', 'carSPA', 'carNUR'].includes(input.id)) {
            const carExists = getCars().some(car => car.name === input.value);
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

    let arrivalTime = '';
    if (values['time']) {
        const [hours, minutes] = values['time'].split(':').map(Number);
        const adjustedHours = hours - 1;
        arrivalTime = `${adjustedHours.toString().padStart(2, '0')}:${minutes ? minutes.toString().padStart(2, '0') : '00'}`;
    }

    let depositSection = '';
    const carFields = ['car', 'carNUR', 'carSPA', 'car1', 'car2'];
    let depositCars = [];

    carFields.forEach(field => {
        if (values[field]) {
            const selectedCar = getCars().find(c => c.name === values[field]);
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
                    selectedCar = getCars().find(c => c.name === values[field]);
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

    const computedPlaceholders = ['arrivalTime', 'depositSection', 'day', 'month', 'year', 'Day1', 'Month1', 'Year1', 'day2', 'month2', 'year2', 'daySPA', 'monthSPA', 'yearSPA', 'dayNUR', 'monthNUR', 'yearNUR', 'originalexcess', 'insuranceexcess', 'insuranceprice'];
    const missingPlaceholders = uniquePlaceholders.filter(p => !computedPlaceholders.includes(p) && (!replacements[p] || replacements[p].trim() === ''));
    if (missingPlaceholders.length > 0) {
        alert(`The following placeholders are missing values: ${missingPlaceholders.join(', ')}`);
        return;
    }

    Object.keys(replacements).forEach(placeholder => {
        const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
        subject = subject.replace(regex, replacements[placeholder]);
        body = body.replace(regex, replacements[placeholder]);
    });

    document.getElementById('subject').value = subject;
    document.getElementById('body').value = body;

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
            excelData.values.push(columnValue.trim() === '' ? '' : columnValue);
        });
    } else {
        excelInfoSection.classList.add('hidden');
    }

    window.currentExcelData = excelData;

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

export async function addItem(listType) {
    const name = document.getElementById('newItemName').value.trim();
    if (!name) return;

    let newItem;
    switch (listType) {
        case 'cars':
            const requiresDeposit = document.getElementById('requiresDeposit').checked;
            const depositAmount = requiresDeposit ? parseInt(document.getElementById('depositAmount').value) || 0 : 0;
            const originalExcess = parseInt(document.getElementById('originalExcess').value) || 0;
            const insuranceExcess = parseInt(document.getElementById('insuranceExcess').value) || 0;
            const raceIncPrice = parseInt(document.getElementById('raceIncPrice').value) || 0;
            newItem = { 
                name, 
                requiresDeposit, 
                depositAmount, 
                originalExcess, 
                insuranceExcess, 
                raceIncPrice 
            };
            updateList(listType, [...getCars(), newItem]);
            break;
        case 'taxis':
            updateList(listType, [...getTaxis(), name]);
            break;
        case 'hotels':
            const email = document.getElementById('newItemEmail').value.trim();
            if (!email) return;
            newItem = { name, email };
            updateList(listType, [...getHotels(), newItem]);
            break;
        case 'packages':
            updateList(listType, [...getPackages(), name]);
            break;
    }
    await saveAllData();
}

export function removeItem(listType, index) {
    let list;
    switch (listType) {
        case 'cars': list = getCars(); break;
        case 'taxis': list = getTaxis(); break;
        case 'hotels': list = getHotels(); break;
        case 'packages': list = getPackages(); break;
    }
    list.splice(index, 1);
    updateList(listType, list);
}

export async function saveList() {
    const listType = document.getElementById('listTitle').textContent.split(' ')[1].toLowerCase();
    let newList;
    switch (listType) {
        case 'cars':
            newList = Array.from(document.querySelectorAll('#listItems .list-item')).map((_, index) => ({
                name: document.getElementById(`carName-${index}`).value,
                requiresDeposit: document.querySelector(`#listItems .list-item:nth-child(${index + 1}) input[type='checkbox']`).checked,
                depositAmount: parseInt(document.getElementById(`carDeposit-${index}`).value) || 0,
                originalExcess: parseInt(document.getElementById(`carOriginalExcess-${index}`).value) || 0,
                insuranceExcess: parseInt(document.getElementById(`carInsuranceExcess-${index}`).value) || 0,
                raceIncPrice: parseInt(document.getElementById(`carRaceIncPrice-${index}`).value) || 0
            }));
            break;
        case 'taxis':
            newList = Array.from(document.querySelectorAll('#listItems .list-item')).map((_, index) => document.getElementById(`taxi-${index}`).value);
            break;
        case 'hotels':
            newList = Array.from(document.querySelectorAll('#listItems .list-item')).map((_, index) => ({
                name: document.getElementById(`hotelName-${index}`).value,
                email: document.getElementById(`hotelEmail-${index}`).value
            }));
            break;
        case 'packages':
            newList = Array.from(document.querySelectorAll('#listItems .list-item')).map((_, index) => document.getElementById(`package-${index}`).value);
            break;
    }
    
    updateList(listType, newList);
    try {
        await saveAllData();
        alert(`${listType} list saved!`);
    } catch (error) {
        alert(`Error saving ${listType} list: ${error.message}`);
    }
}

export async function addNewTemplate() {
    const name = prompt('Enter new template name:');
    const category = prompt('Enter category for this template:') || 'Uncategorized';
    const subject = prompt('Enter email subject for this template:') || '';
    if (name) {
        const success = addTemplate(name, category, subject);
        if (success) {
            await saveAllData();
            document.getElementById('templateSelect').value = name;
            document.getElementById('templateCategory').value = category;
            document.getElementById('templateSubject').value = subject;
            alert('Template added successfully!');
            return true;
        } else {
            alert('Template name already exists!');
            return false;
        }
    }
    return false;
}

export async function renameExistingTemplate() {
    const templateInput = document.getElementById('templateSelect');
    const currentName = templateInput.value;
    
    if (!currentName) {
        alert('Please select a template to rename.');
        return false;
    }
    
    const newName = prompt('Enter new template name:', currentName);
    const newCategory = prompt('Enter new category:', getTemplates()[currentName].category || 'Uncategorized');
    const newSubject = prompt('Enter new email subject:', getTemplates()[currentName].subject || '');
    const success = renameTemplate(currentName, newName, newCategory, newSubject);
    if (success) {
        await saveAllData();
        document.getElementById('templateSelect').value = newName;
        document.getElementById('templateCategory').value = newCategory;
        document.getElementById('templateSubject').value = newSubject;
        alert('Template renamed successfully!');
        return true;
    } else {
        alert('Template name already exists!');
        return false;
    }
}

export function addExcelColumn() {
    const templateInput = document.getElementById('templateSelect');
    const templateKey = templateInput.value;
    const templates = getTemplates();
    if (!templateKey || !templates[templateKey]) {
        alert('Please select a valid template first.');
        return;
    }
    const columnName = prompt('Enter Excel column name:');
    if (columnName) {
        const columnValue = prompt('Enter default value for this column (optional):') || '';
        const template = templates[templateKey];
        template.excelInfo = template.excelInfo || [];
        template.excelInfo.push({ column: columnName, value: columnValue });
    }
}

export function removeExcelColumn(index) {
    const templateInput = document.getElementById('templateSelect');
    const templateKey = templateInput.value;
    const templates = getTemplates();
    if (templateKey && templates[templateKey]) {
        templates[templateKey].excelInfo.splice(index, 1);
    }
}

export function addStep() {
    const templateInput = document.getElementById('templateSelect');
    const templateKey = templateInput.value;
    const templates = getTemplates();
    if (!templateKey || !templates[templateKey]) {
        alert('Please select a valid template first.');
        return;
    }
    const stepName = prompt('Enter step name:');
    if (stepName) {
        const template = templates[templateKey];
        template.steps = template.steps || [];
        template.steps.push({ name: stepName, description: '' });
    }
}

export function removeStep(index) {
    const templateInput = document.getElementById('templateSelect');
    const templateKey = templateInput.value;
    const templates = getTemplates();
    if (templateKey && templates[templateKey]) {
        templates[templateKey].steps.splice(index, 1);
    }
}

export async function saveTemplate() {
    const templateInput = document.getElementById('templateSelect');
    const templateKey = templateInput.value;
    const textarea = document.getElementById('templateBody');
    const subjectInput = document.getElementById('templateSubject');
    const excelColumnsList = document.getElementById('excelColumnsList');
    const stepsEditList = document.getElementById('stepsEditList');
    const categoryInput = document.getElementById('templateCategory');
    
    if (templateKey && getTemplates()[templateKey]) {
        const templateData = {
            body: textarea.value,
            subject: subjectInput.value,
            excelInfo: Array.from(excelColumnsList.querySelectorAll('.list-item')).map((_, index) => ({
                column: document.getElementById(`excelColumn-${index}`).value,
                value: document.getElementById(`excelValue-${index}`).value
            })),
            steps: Array.from(stepsEditList.querySelectorAll('.list-item')).map((_, index) => ({
                name: document.getElementById(`stepName-${index}`).value,
                description: document.getElementById(`stepDesc-${index}`).value
            })),
            category: categoryInput.value || 'Uncategorized'
        };
        
        const success = updateTemplate(templateKey, templateData);
        if (success) {
            await saveAllData();
            alert('Template saved!');
            return true;
        }
    }
    alert('Please select a valid template.');
    return false;
}

export async function deleteExistingTemplate() {
    const templateInput = document.getElementById('templateSelect');
    const templateKey = templateInput.value;
    if (templateKey && getTemplates()[templateKey] && confirm(`Delete ${templateKey}?`)) {
        const success = deleteTemplate(templateKey);
        if (success) {
            await saveAllData();
            templateInput.value = '';
            document.getElementById('templateCategory').value = '';
            document.getElementById('templateBody').value = '';
            alert('Template deleted successfully!');
            return true;
        }
    }
    return false;
}