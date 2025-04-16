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
    navigator.clipboard.writeText(body).then(() => alert('Email body copied to clipboard!'));
}

export function copyExcelInfo() {
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