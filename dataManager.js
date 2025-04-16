import { loadDataFromFirebase, saveDataToFirebase } from './firebase.js';

let cars = [];
let taxis = [];
let hotels = [];
let packages = [];
let templates = {};
let categories = [];

const defaultData = {
    cars: [],
    taxis: [],
    hotels: [],
    packages: [],
    templates: {}
};

export async function loadData() {
    try {
        const data = await loadDataFromFirebase();
        if (data) {
            cars = data.cars || [];
            taxis = data.taxis || [];
            hotels = data.hotels || [];
            packages = data.packages || [];
            templates = {};
            categories = [];
            for (const [key, value] of Object.entries(data.templates || {})) {
                const template = {
                    body: typeof value === 'string' ? value : value.body || '',
                    subject: value.subject || '',
                    excelInfo: value.excelInfo || [],
                    steps: value.steps || [],
                    category: value.category || 'Uncategorized'
                };
                templates[key] = template;
                if (template.category && !categories.includes(template.category)) {
                    categories.push(template.category);
                }
            }
            categories.sort();
        } else {
            cars = defaultData.cars;
            taxis = defaultData.taxis;
            hotels = defaultData.hotels;
            packages = defaultData.packages;
            templates = {};
            categories = ['Uncategorized'];
            for (const [key, value] of Object.entries(defaultData.templates || {})) {
                templates[key] = {
                    body: value,
                    subject: '',
                    excelInfo: [],
                    steps: [],
                    category: 'Uncategorized'
                };
            }
            await saveAllData();
        }
    } catch (error) {
        console.error("Failed to load data, using defaults:", error);
        cars = defaultData.cars;
        taxis = defaultData.taxis;
        hotels = defaultData.hotels;
        packages = defaultData.packages;
        templates = defaultData.templates;
        categories = ['Uncategorized'];
    }
}

export async function saveAllData() {
    try {
        await saveDataToFirebase({
            cars,
            taxis,
            hotels,
            packages,
            templates
        });
    } catch (error) {
        alert("Error saving data to database");
        throw error;
    }
}

export function getCars() {
    return cars;
}

export function getTaxis() {
    return taxis;
}

export function getHotels() {
    return hotels;
}

export function getPackages() {
    return packages;
}

export function getTemplates() {
    return templates;
}

export function getCategories() {
    return categories;
}

export function updateList(listType, newList) {
    switch (listType) {
        case 'cars':
            cars = newList;
            break;
        case 'taxis':
            taxis = newList;
            break;
        case 'hotels':
            hotels = newList;
            break;
        case 'packages':
            packages = newList;
            break;
    }
}

export function addTemplate(name, category, subject) {
    if (!templates[name]) {
        templates[name] = {
            body: '',
            subject: subject || '',
            excelInfo: [],
            steps: [],
            category: category || 'Uncategorized'
        };
        if (!categories.includes(category)) {
            categories.push(category);
            categories.sort();
        }
        return true;
    }
    return false;
}

export function renameTemplate(oldName, newName, newCategory, newSubject) {
    if (newName && newName !== oldName && !templates[newName]) {
        templates[newName] = { ...templates[oldName], category: newCategory || 'Uncategorized', subject: newSubject || '' };
        delete templates[oldName];
        if (!categories.includes(newCategory)) {
            categories.push(newCategory);
            categories.sort();
        }
        return true;
    } else if (newName === oldName) {
        templates[oldName].category = newCategory;
        templates[oldName].subject = newSubject;
        if (!categories.includes(newCategory)) {
            categories.push(newCategory);
            categories.sort();
        }
        return true;
    }
    return false;
}

export function deleteTemplate(name) {
    if (templates[name]) {
        const deletedCategory = templates[name].category;
        delete templates[name];
        categories = [...new Set(Object.values(templates).map(t => t.category))].sort();
        return true;
    }
    return false;
}

export function updateTemplate(name, templateData) {
    if (templates[name]) {
        templates[name] = templateData;
        if (!categories.includes(templateData.category)) {
            categories.push(templateData.category);
            categories.sort();
        }
        return true;
    }
    return false;
}