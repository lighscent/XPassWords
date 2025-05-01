function generatePassword(length, useUppercase, useNumbers, useSymbols) {
    const lower = 'abcdefghjkmnpqrstuvwxyz';
    const upper = 'ABCDEFGHJKMNPQRSTUVWXYZ';
    const numbers = '23456789';
    const symbols = '!"#$%&\'()*+,-./:;<=>?@[]^_`{|}~';

    function isSequential(a, b) {
        return Math.abs(a.charCodeAt(0) - b.charCodeAt(0)) === 1;
    }

    let charSets = [lower];
    let requiredChars = [];
    let firstCharSet = lower;
    if (useUppercase) {
        charSets.push(upper);
        firstCharSet += upper;
        requiredChars.push(upper[getRandomInt(upper.length)]);
    }
    if (useNumbers) {
        charSets.push(numbers);
        requiredChars.push(numbers[getRandomInt(numbers.length)]);
    }
    if (useSymbols) {
        charSets.push(symbols);
        requiredChars.push(symbols[getRandomInt(symbols.length)]);
    }

    if (!charSets.length) return '';

    const allChars = charSets.join('');
    let password = [], used = new Set();
    let firstChar;
    do {
        firstChar = firstCharSet[getRandomInt(firstCharSet.length)];
    } while (!firstChar);
    password.push(firstChar);
    used.add(firstChar);

    while (password.length + requiredChars.length < length) {
        const c = allChars[getRandomInt(allChars.length)];
        if (used.has(c) || isSequential(password[password.length - 1], c)) continue;
        password.push(c);
        used.add(c);
    }

    for (const rc of requiredChars) {
        if (!used.has(rc) && !isSequential(password[password.length - 1], rc)) {
            password.push(rc);
            used.add(rc);
        }
    }

    const rest = password.slice(1);
    shuffleArray(rest);
    password = [password[0], ...rest].slice(0, length);

    const poolSize = lower.length + (useUppercase ? upper.length : 0) + (useNumbers ? numbers.length : 0) + (useSymbols ? symbols.length : 0);
    const entropy = Math.round(Math.log2(Math.pow(poolSize, length)));
    document.getElementById('entropy').textContent = `Entropie : ${entropy} bits`;

    return password.join('');
}

function updatePassword() {
    const length = +document.getElementById('length').value;
    const useUppercase = document.getElementById('uppercase').checked;
    const useNumbers = document.getElementById('numbers').checked;
    const useSymbols = document.getElementById('symbols').checked;
    const passwordField = document.getElementById('password');
    const copyBtn = document.getElementById('copy');

    if (!useUppercase && !useNumbers && !useSymbols) {
        passwordField.textContent = 'Sélectionnez au moins une option.';
        document.getElementById('entropy').textContent = '';
        return;
    }

    const pwd = generatePassword(length, useUppercase, useNumbers, useSymbols);
    passwordField.textContent = pwd;

    if (copyBtn.innerHTML !== 'Copier') copyBtn.innerHTML = 'Copier';
}

function saveCustomOptions() {
    const options = {
        length: document.getElementById('length').value,
        uppercase: document.getElementById('uppercase').checked,
        numbers: document.getElementById('numbers').checked,
        symbols: document.getElementById('symbols').checked
    };
    localStorage.setItem('xpass_options', JSON.stringify(options));
}

function loadCustomOptions() {
    const saved = localStorage.getItem('xpass_options');
    if (!saved) return;
    try {
        const o = JSON.parse(saved);
        document.getElementById('length').value = o.length || 12;
        document.getElementById('length-value').textContent = o.length || 12;
        document.getElementById('uppercase').checked = !!o.uppercase;
        document.getElementById('numbers').checked = !!o.numbers;
        document.getElementById('symbols').checked = !!o.symbols;
    } catch { }
}

function getRandomInt(max) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = getRandomInt(i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function copyToClipboard() {
    const pwd = document.getElementById('password').textContent;
    const copyBtn = document.getElementById('copy');
    if (!pwd || pwd.startsWith('Sélectionnez')) return;
    navigator.clipboard.writeText(pwd);
    const original = copyBtn.innerHTML;
    copyBtn.innerHTML = '<span style="color:#4caf50;font-size:1.2em;">&#10003;</span>';
    setTimeout(() => copyBtn.innerHTML = original, 1200);
}

window.onload = function () {
    loadCustomOptions();
    updatePassword();

    document.getElementById('generate').addEventListener('click', () => {
        updatePassword();
        saveCustomOptions();
    });

    document.getElementById('copy').addEventListener('click', copyToClipboard);

    document.getElementById('length').addEventListener('input', e => {
        document.getElementById('length-value').textContent = e.target.value;
        updatePassword();
        saveCustomOptions();
    });

    ['uppercase', 'numbers', 'symbols'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
            updatePassword();
            saveCustomOptions();
        });
    });
};
