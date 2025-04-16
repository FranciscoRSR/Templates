import { initializeFirebase } from './firebase.js';
import { loadData } from './dataManager.js';
import { toggleTheme, loadTheme, toggleSidebar, showScreen, toggleInitialEditList, toggleEditList, showFields, autoFillHotelEmailDynamic, showListEditor, toggleDeposit, loadCategoryDropdown, loadTemplateDropdown, loadTemplateToEdit } from './uiRenderer.js';
import { generateEmail, addItem, removeItem, saveList, addNewTemplate, renameExistingTemplate, addExcelColumn, removeExcelColumn, addStep, removeStep, saveTemplate, deleteExistingTemplate } from './templateManager.js';
import { copyToClipboard, copyExcelInfo } from './utils.js';
import { handleError } from './errorHandler.js';

// Expose functions to global scope for HTML event handlers
window.toggleTheme = toggleTheme;
window.toggleSidebar = toggleSidebar;
window.showScreen = showScreen;
window.toggleInitialEditList = toggleInitialEditList;
window.toggleEditList = toggleEditList;
window.showFields = showFields;
window.autoFillHotelEmailDynamic = autoFillHotelEmailDynamic;
window.showListEditor = showListEditor;
window.toggleDeposit = toggleDeposit;
window.generateEmail = generateEmail;
window.copyToClipboard = copyToClipboard;
window.copyExcelInfo = copyExcelInfo;
window.addItem = addItem;
window.removeItem = removeItem;
window.saveList = saveList;
window.loadTemplateToEdit = loadTemplateToEdit;
window.addExcelColumn = addExcelColumn;
window.removeExcelColumn = removeExcelColumn;
window.addStep = addStep;
window.removeStep = removeStep;
window.addTemplate = addNewTemplate;
window.renameTemplate = renameExistingTemplate;
window.saveTemplate = saveTemplate;
window.deleteTemplate = deleteExistingTemplate;
window.filterTemplatesByCategory = () => {
    loadTemplateDropdown();
    showFields();
};

// Initial setup
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded fired');
    try {
        initializeFirebase();
        loadTheme();
        showScreen('initial');
        // Load initial data lazily when needed
    } catch (error) {
        handleError(error, 'Application initialization failed');
    }

    // Event delegation for buttons
    document.addEventListener('click', (e) => {
        const target = e.target;
        if (target.id === 'hamburgerBtn') toggleSidebar();
        if (target.id === 'themeToggle') toggleTheme();
        if (target.id === 'sidebar-generate-email') showScreen('templates');
        if (target.id === 'sidebar-edit-templates') showScreen('editTemplates');
        if (target.id === 'sidebar-edit-list') toggleEditList();
        if (target.id === 'sidebar-list-cars') {
            window.isSidebarListVisible = true;
            showScreen('editList');
            showListEditor('cars');
        }
        if (target.id === 'sidebar-list-taxis') {
            window.isSidebarListVisible = true;
            showScreen('editList');
            showListEditor('taxis');
        }
        if (target.id === 'sidebar-list-hotels') {
            window.isSidebarListVisible = true;
            showScreen('editList');
            showListEditor('hotels');
        }
        if (target.id === 'sidebar-list-packages') {
            window.isSidebarListVisible = true;
            showScreen('editList');
            showListEditor('packages');
        }
        if (target.id === 'initial-generate-email') showScreen('templates');
        if (target.id === 'initial-edit-templates') showScreen('editTemplates');
        if (target.id === 'initial-edit-list') toggleInitialEditList();
        if (target.id === 'initial-list-cars') {
            window.isSidebarListVisible = true;
            showScreen('editList');
            showListEditor('cars');
        }
        if (target.id === 'initial-list-taxis') {
            window.isSidebarListVisible = true;
            showScreen('editList');
            showListEditor('taxis');
        }
        if (target.id === 'initial-list-hotels') {
            window.isSidebarListVisible = true;
            showScreen('editList');
            showListEditor('hotels');
        }
        if (target.id === 'initial-list-packages') {
            window.isSidebarListVisible = true;
            showScreen('editList');
            showListEditor('packages');
        }
    });
});
