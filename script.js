import { initializeFirebase } from './firebase.js';
import { loadData } from './dataManager.js';
import { toggleTheme, loadTheme, toggleSidebar, showScreen, toggleInitialEditList, toggleEditList, clearInput, showFields, autoFillHotelEmailDynamic, showListEditor, toggleDeposit, loadCategoryDropdown, loadTemplateDropdown, filterDropdown, showDropdown, hideDropdown, updateCategoryDropdown, loadEditTemplatesDropdown, loadTemplateToEdit } from './uiRenderer.js';
import { generateEmail, addItem, removeItem, saveList, addNewTemplate, renameExistingTemplate, addExcelColumn, removeExcelColumn, addStep, removeStep, saveTemplate, deleteExistingTemplate } from './templateManager.js';
import { copyToClipboard, copyExcelInfo } from './utils.js';

// Expose functions to global scope for HTML event handlers
window.toggleTheme = toggleTheme;
window.toggleSidebar = toggleSidebar;
window.showScreen = showScreen;
window.toggleInitialEditList = toggleInitialEditList;
window.toggleEditList = toggleEditList;
window.clearInput = clearInput;
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
window.filterDropdown = filterDropdown;
window.showDropdown = showDropdown;
window.hideDropdown = hideDropdown;
window.updateCategoryDropdown = updateCategoryDropdown;
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
    initializeFirebase();
    loadTheme();
    await loadData();
    showScreen('initial');

    // Attach event listeners
    document.getElementById('hamburgerBtn').addEventListener('click', toggleSidebar);
    document.getElementById('themeToggle').addEventListener('change', toggleTheme);

    // Sidebar buttons
    document.getElementById('sidebar-generate-email').addEventListener('click', () => showScreen('templates'));
    document.getElementById('sidebar-edit-templates').addEventListener('click', () => showScreen('editTemplates'));
    document.getElementById('sidebar-edit-list').addEventListener('click', toggleEditList);
    document.getElementById('sidebar-list-cars').addEventListener('click', () => {
        window.isSidebarListVisible = true;
        showScreen('editList');
        showListEditor('cars');
    });
    document.getElementById('sidebar-list-taxis').addEventListener('click', () => {
        window.isSidebarListVisible = true;
        showScreen('editList');
        showListEditor('taxis');
    });
    document.getElementById('sidebar-list-hotels').addEventListener('click', () => {
        window.isSidebarListVisible = true;
        showScreen('editList');
        showListEditor('hotels');
    });
    document.getElementById('sidebar-list-packages').addEventListener('click', () => {
        window.isSidebarListVisible = true;
        showScreen('editList');
        showListEditor('packages');
    });

    // Initial screen buttons
    document.getElementById('initial-generate-email').addEventListener('click', () => showScreen('templates'));
    document.getElementById('initial-edit-templates').addEventListener('click', () => showScreen('editTemplates'));
    document.getElementById('initial-edit-list').addEventListener('click', toggleInitialEditList);
    document.getElementById('initial-list-cars').addEventListener('click', () => {
        window.isSidebarListVisible = true;
        showScreen('editList');
        showListEditor('cars');
    });
    document.getElementById('initial-list-taxis').addEventListener('click', () => {
        window.isSidebarListVisible = true;
        showScreen('editList');
        showListEditor('taxis');
    });
    document.getElementById('initial-list-hotels').addEventListener('click', () => {
        window.isSidebarListVisible = true;
        showScreen('editList');
        showListEditor('hotels');
    });
    document.getElementById('initial-list-packages').addEventListener('click', () => {
        window.isSidebarListVisible = true;
        showScreen('editList');
        showListEditor('packages');
    });

    // Dropdown click handling
    document.addEventListener('click', (e) => {
        const dropdowns = document.getElementsByClassName('dropdown-options');
        Array.from(dropdowns).forEach(dropdown => {
            if (!dropdown.contains(e.target) && !e.target.closest('.searchable-dropdown input')) {
                dropdown.classList.remove('visible');
            }
        });
    });
});