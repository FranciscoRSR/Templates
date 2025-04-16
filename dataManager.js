import { loadDataFromFirebase, saveDataToFirebase } from './firebase.js';
import { handleError } from './errorHandler.js';

let dataCache = {
    cars: { items: [], lastDoc: null, hasMore: true },
    taxis: { items: [], lastDoc: null, hasMore: true },
    hotels: { items: [], lastDoc: null, hasMore: true },
    packages: { items: [], lastDoc: null, hasMore: true },
    templates: { items: {}, lastDoc: null, hasMore: true },
    categories: []
};

const defaultData = {
    cars: [],
    taxis: [],
    hotels: [],
    packages: [],
    templates: {}
};

export async function loadData(collectionName, pageSize = 10) {
    try {
        const cache = dataCache[collectionName];
        if (!cache.hasMore && cache.items.length > 0) {
            return cache.items;
        }
        const { data, lastDoc } = await loadDataFromFirebase(collectionName, pageSize, cache.lastDoc);
        cache.lastDoc = lastDoc;
        cache.hasMore = data.length === pageSize;
        if (collectionName === 'templates') {
            data.forEach(item => {
                cache.items[item.id] = {
                    body: item.body || '',
                    subject: item.subject || '',
                    excelInfo: item.excelInfo || [],
                    steps: item.steps || [],
                    category: item.category || 'Uncategorized'
                };
                if (item.category && !dataCache.categories.includes(item.category)) {
                    dataCache.categories.push(item.category);
                }
            });
            dataCache.categories.sort();
        } else {
            cache.items.push(...data);
        }
        return cache.items;
    } catch (error) {
        handleError(error, `Failed to load ${collectionName} data`);
        dataCache[collectionName].items = defaultData[collectionName];
        dataCache.categories = ['Uncategorized'];
        return dataCache[collectionName].items;
    }
}

export async function saveAllData() {
    try {
        const dataToSave = {
            cars: dataCache.cars.items,
            taxis: dataCache.taxis.items,
            hotels: dataCache.hotels.items,
            packages: dataCache.packages.items,
            templates: Object.values(dataCache.templates.items)
        };
        await saveDataToFirebase(dataToSave);
    } catch (error) {
        handleError(error, 'Failed to save data to database');
        throw error;
    }
}

export function getCars() {
    return dataCache.cars.items;
}

export function getTaxis() {
    return dataCache.taxis.items;
}

export function getHotels() {
    return dataCache.hotels.items;
}

export function getPackages() {
    return dataCache.packages.items;
}

export function getTemplates() {
    return dataCache.templates.items;
}

export function getCategories() {
    return dataCache.categories;
}

export function updateList(listType, newList) {
    dataCache[listType].items = newList;
}

export function addTemplate(name, category, subject) {
    if (!name || !name.trim()) {
        handleValidationError('Template name is required.');
        return false;
    }
    if (!dataCache.templates.items[name]) {
        dataCache.templates.items[name] = {
            id: name,
            body: '',
            subject: subject || '',
            excelInfo: [],
            steps: [],
            category: category || 'Uncategorized'
        };
        if (!dataCache.categories.includes(category)) {
            dataCache.categories.push(category);
            dataCache.categories.sort();
        }
        return true;
    }
    return false;
}

export function renameTemplate(oldName, newName, newCategory, newSubject) {
    if (!newName || !newName.trim()) {
        handleValidationError('New template name is required.');
        return false;
    }
    if (newName && newName !== oldName && !dataCache.templates.items[newName]) {
        dataCache.templates.items[newName] = { ...dataCache.templates.items[oldName], id: newName, category: newCategory || 'Uncategorized', subject: newSubject || '' };
        delete dataCache.templates.items[oldName];
        if (!dataCache.categories.includes(newCategory)) {
            dataCache.categories.push(newCategory);
            dataCache.categories.sort();
        }
        return true;
    } else if (newName === oldName) {
        dataCache.templates.items[oldName].category = newCategory;
        dataCache.templates.items[oldName].subject = newSubject;
        if (!dataCache.categories.includes(newCategory)) {
            dataCache.categories.push(newCategory);
            dataCache.categories.sort();
        }
        return true;
    }
    return false;
}

export function deleteTemplate(name) {
    if (!name || !dataCache.templates.items[name]) {
        handleValidationError('Invalid template name.');
        return false;
    }
    delete dataCache.templates.items[name];
    dataCache.categories = [...new Set(Object.values(dataCache.templates.items).map(t => t.category))].sort();
    return true;
}

export function updateTemplate(name, templateData) {
    if (!name || !dataCache.templates.items[name]) {
        handleValidationError('Invalid template name.');
        return false;
    }
    dataCache.templates.items[name] = { ...templateData, id: name };
    if (!dataCache.categories.includes(templateData.category)) {
        dataCache.categories.push(templateData.category);
        dataCache.categories.sort();
    }
    return true;
}
