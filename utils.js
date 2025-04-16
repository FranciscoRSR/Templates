import { handleSuccess, handleError } from './errorHandler.js';

export function extractPlaceholders(template) {
    const regex = /\{([^{}]+)\}/g;
    const matches = [];
    let match;
    while ((match = regex.exec(template)) !== null) {
        matches.push(match[1]);
    }
    return [...new Set(matches)];
}

export function copyToClipboard() {
    const body = document.getElementById('body').value;
    navigator.clipboard.writeText(body)
        .then(() => handleSuccess('Email body copied to clipboard!'))
        .catch(err => handleError(err, 'Failed to copy email body'));
}

export function copyExcelInfo() {
    const data = window.currentExcelData;
    if (!data || !data.values.length) {
        handleError(new Error('No Excel data available'), 'Copy Excel Data');
        return;
    }
    const text = data.values.join('\t');
    navigator.clipboard.writeText(text)
        .then(() => handleSuccess('Excel values copied to clipboard!'))
        .catch(err => handleError(err, 'Failed to copy Excel data'));
}
