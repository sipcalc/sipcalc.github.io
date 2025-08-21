function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatIndianNumber(num) {
    if (num === null || num === undefined) return '';
    const toFormat = Math.floor(num).toString();
    const afterPoint = num.toString().includes('.') ? '.' + num.toString().split('.')[1] : '';
    let lastThree = toFormat.slice(-3);
    let otherNumbers = toFormat.slice(0, -3);
    if (otherNumbers !== '') {
        lastThree = ',' + lastThree;
    }
    const res = otherNumbers.replace(/(\d)(?=(\d{2})+(?!\d))/g, '$1,') + lastThree;
    return res + afterPoint;
}

function parseIndianNumber(str) {
    if (typeof str !== 'string') return str;
    return parseFloat(str.replace(/,/g, ''));
}