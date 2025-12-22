let isDarkMode = true;

document.addEventListener('DOMContentLoaded', () => {
    const manifest = chrome.runtime.getManifest();
    document.getElementById('app-version').textContent = 'v' + manifest.version;

    loadPreferences();
    updateThemeUI();
    setupEvents();
    generatePassword();
});

function setupEvents() {
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

    const num = document.getElementById('length-num');
    const range = document.getElementById('length-range');

    num.addEventListener('input', () => {
        if (parseInt(num.value) > 32) num.value = 32;
        range.value = num.value;
        generatePassword();
        savePreferences();
    });
    range.addEventListener('input', () => {
        num.value = range.value;
        generatePassword();
        savePreferences();
    });

    document.getElementById('generate-btn').addEventListener('click', generatePassword);

    document.getElementById('btn-copy').addEventListener('click', () => {
        const text = document.getElementById('password-display').textContent;
        navigator.clipboard.writeText(text).then(() => {
            const btn = document.getElementById('btn-copy');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = `<span style="color:var(--primary); font-weight:bold;">✓</span>`;
            setTimeout(() => btn.innerHTML = originalHTML, 1500);
        });
    });

    ['uppercase', 'numbers', 'symbols', 'exclude-ambiguous', 'no-start-symbol'].forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            generatePassword();
            savePreferences();
        });
    });
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    updateThemeUI();
    savePreferences();
}

function updateThemeUI() {
    const body = document.body;
    const btn = document.getElementById('theme-toggle');
    if (isDarkMode) {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        btn.textContent = "Light Mode";
    } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        btn.textContent = "Dark Mode";
    }
}

function generatePassword() {
    const length = parseInt(document.getElementById('length-num').value);

    // Standard character sets
    let cLower = "abcdefghijklmnopqrstuvwxyz";
    let cUpper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let cNum = "0123456789";
    let cSym = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (document.getElementById('exclude-ambiguous').checked) {
        const amb = /[il1Lo0O]/g;
        cLower = cLower.replace(amb, '');
        cUpper = cUpper.replace(amb, '');
        cNum = cNum.replace(amb, '');
    }

    let nonSymbolPool = cLower;
    if (document.getElementById('uppercase').checked) nonSymbolPool += cUpper;
    if (document.getElementById('numbers').checked) nonSymbolPool += cNum;

    let pool = nonSymbolPool;
    if (document.getElementById('symbols').checked) pool += cSym;

    if (!pool) pool = "abcdef";
    if (!nonSymbolPool) nonSymbolPool = pool;

    const noStartSymbol = document.getElementById('no-start-symbol').checked;

    let password = "";
    const arr = new Uint32Array(length);
    window.crypto.getRandomValues(arr);

    for (let i = 0; i < length; i++) {
        const currentPool = (i === 0 && noStartSymbol) ? nonSymbolPool : pool;
        password += currentPool[arr[i] % currentPool.length];
    }

    document.getElementById('password-display').textContent = password;

    const entropy = Math.floor(length * Math.log2(pool.length));
    document.getElementById('entropy-display').textContent = `Entropy: ${entropy} bits`;
}

function savePreferences() {
    const prefs = {
        darkMode: isDarkMode,
        length: document.getElementById('length-num').value,
        opts: {
            upper: document.getElementById('uppercase').checked,
            num: document.getElementById('numbers').checked,
            sym: document.getElementById('symbols').checked,
            amb: document.getElementById('exclude-ambiguous').checked,
            noStart: document.getElementById('no-start-symbol').checked
        }
    };
    localStorage.setItem('xpass_prefs', JSON.stringify(prefs));
}

function loadPreferences() {
    const saved = JSON.parse(localStorage.getItem('xpass_prefs'));
    if (saved) {
        isDarkMode = (saved.darkMode !== undefined) ? saved.darkMode : true;

        if (saved.length) {
            let len = parseInt(saved.length);
            if (len > 32) len = 32;
            document.getElementById('length-num').value = len;
            document.getElementById('length-range').value = len;
        }
        if (saved.opts) {
            document.getElementById('uppercase').checked = saved.opts.upper;
            document.getElementById('numbers').checked = saved.opts.num;
            document.getElementById('symbols').checked = saved.opts.sym;
            document.getElementById('exclude-ambiguous').checked = saved.opts.amb;
            document.getElementById('no-start-symbol').checked = saved.opts.noStart || false;
        }
    }
}