// Game State
let gameState = {
    money: 0,
    totalEarned: 0,
    totalClicks: 0,
    moneyPerClick: 1,
    moneyPerSecond: 0,
    prestigeLevel: 0,
    prestigeMultiplier: 1,
    
    // Casino
    totalBets: 0,
    totalWins: 0,
    totalLosses: 0,
    
    // Upgrades
    upgrades: {
        cursor: { level: 0, baseCost: 10, costMultiplier: 1.15, baseEffect: 1, effectMultiplier: 1.5 },
        grandma: { level: 0, baseCost: 100, costMultiplier: 1.2, baseEffect: 1, effectMultiplier: 1.3 },
        farm: { level: 0, baseCost: 1100, costMultiplier: 1.2, baseEffect: 8, effectMultiplier: 1.3 },
        mine: { level: 0, baseCost: 12000, costMultiplier: 1.2, baseEffect: 47, effectMultiplier: 1.3 },
        factory: { level: 0, baseCost: 130000, costMultiplier: 1.2, baseEffect: 260, effectMultiplier: 1.3 },
        bank: { level: 0, baseCost: 1400000, costMultiplier: 1.2, baseEffect: 1400, effectMultiplier: 1.3 }
    },
    
    // Achievements
    achievements: {}
};

const upgradeData = {
    cursor: { name: 'AUTO CLICKER', desc: 'CLICKS FOR YOU', icon: '🖱️' },
    grandma: { name: 'GRANDMA', desc: 'BAKES MONEY COOKIES', icon: '👵' },
    farm: { name: 'MONEY FARM', desc: 'GROWS MONEY TREES', icon: '🌾' },
    mine: { name: 'GOLD MINE', desc: 'EXTRACTS CURRENCY', icon: '⛏️' },
    factory: { name: 'CASH FACTORY', desc: 'MASS PRODUCES CASH', icon: '🏭' },
    bank: { name: 'INVESTMENT BANK', desc: 'COMPOUND INTEREST', icon: '🏦' }
};

const achievementData = [
    { id: 'first_click', name: 'FIRST CLICK', desc: 'CLICK ONCE', icon: '👆', check: () => gameState.totalClicks >= 1, reward: 100 },
    { id: 'hundred_clicks', name: 'ENTHUSIAST', desc: 'CLICK 100 TIMES', icon: '💪', check: () => gameState.totalClicks >= 100, reward: 1000 },
    { id: 'first_upgrade', name: 'INVESTOR', desc: 'BUY FIRST UPGRADE', icon: '📈', check: () => Object.values(gameState.upgrades).some(u => u.level > 0), reward: 500 },
    { id: 'millionaire', name: 'MILLIONAIRE', desc: 'EARN $1,000,000', icon: '💰', check: () => gameState.totalEarned >= 1000000, reward: 50000 },
    { id: 'gambler', name: 'HIGH ROLLER', desc: 'PLACE 50 BETS', icon: '🎰', check: () => gameState.totalBets >= 50, reward: 10000 },
    { id: 'lucky_seven', name: 'LUCKY 7S', desc: 'HIT TRIPLE 7S', icon: '🍀', check: () => gameState.achievements.lucky_seven, reward: 100000 },
    { id: 'prestige_one', name: 'ASCENDED', desc: 'PRESTIGE ONCE', icon: '⭐', check: () => gameState.prestigeLevel >= 1, reward: 0 },
    { id: 'hundred_per_second', name: 'PASSIVE INCOME', desc: 'EARN $100/SEC', icon: '💵', check: () => gameState.moneyPerSecond >= 100, reward: 25000 }
];

// Initialize achievements
achievementData.forEach(a => {
    if (!gameState.achievements[a.id]) {
        gameState.achievements[a.id] = false;
    }
});

// DOM Elements
const moneyDisplay = document.getElementById('money-display');
const perClickDisplay = document.getElementById('per-click');
const perSecondDisplay = document.getElementById('per-second');
const totalEarnedDisplay = document.getElementById('total-earned');
const totalClicksDisplay = document.getElementById('total-clicks');
const clickBag = document.getElementById('click-bag');
const prestigeDisplay = document.getElementById('prestige-display');

// Tab Navigation
const tabs = {
    'click-button': 'click-panel',
    'casino-button': 'casino-panel',
    'upgrade-button': 'upgrades-panel',
    'achievements-button': 'achievements-panel',
    'prestige-button': 'prestige-panel'
};

Object.keys(tabs).forEach(buttonId => {
    document.getElementById(buttonId).addEventListener('click', () => {
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.header-buttons button').forEach(b => b.classList.remove('active'));
        document.getElementById(tabs[buttonId]).classList.add('active');
        document.getElementById(buttonId).classList.add('active');
    });
});

// Click Handler
clickBag.addEventListener('click', (e) => {
    const earnings = gameState.moneyPerClick * gameState.prestigeMultiplier;
    gameState.money += earnings;
    gameState.totalEarned += earnings;
    gameState.totalClicks++;
    
    // Floating number effect
    const floatingNum = document.createElement('div');
    floatingNum.className = 'floating-number';
    floatingNum.textContent = '+$' + earnings.toFixed(2);
    floatingNum.style.left = e.pageX + 'px';
    floatingNum.style.top = e.pageY + 'px';
    document.body.appendChild(floatingNum);
    setTimeout(() => floatingNum.remove(), 1000);
    
    updateDisplay();
    checkAchievements();
});

// Casino
const betInput = document.getElementById('bet-input');
const spinButton = document.getElementById('spin-button');
const slots = [document.getElementById('slot-1'), document.getElementById('slot-2'), document.getElementById('slot-3')];

spinButton.addEventListener('click', () => {
    const bet = parseFloat(betInput.value);
    if (isNaN(bet) || bet <= 0) {
        showNotification('ENTER A VALID BET AMOUNT');
        return;
    }
    if (bet > gameState.money) {
        showNotification('INSUFFICIENT FUNDS');
        return;
    }

    gameState.money -= bet;
    gameState.totalBets++;

    // Spin animation
    slots.forEach(slot => slot.classList.add('spinning'));
    
    setTimeout(() => {
        const numbers = [
            Math.floor(Math.random() * 9) + 1,
            Math.floor(Math.random() * 9) + 1,
            Math.floor(Math.random() * 9) + 1
        ];
        
        slots.forEach((slot, i) => {
            slot.textContent = numbers[i];
            slot.classList.remove('spinning');
        });

        let multiplier = 0;
        const [a, b, c] = numbers;
        
        if (a === b && b === c) {
            if (a === 7) {
                multiplier = 50;
                gameState.achievements.lucky_seven = true;
                showNotification('JACKPOT! TRIPLE 7S!');
            } else {
                multiplier = 15;
                showNotification('TRIPLE MATCH!');
            }
        } else if (a === b || a === c || b === c) {
            multiplier = 3;
        }

        const winnings = bet * multiplier;
        gameState.money += winnings;
        
        if (winnings > bet) {
            gameState.totalWins += winnings - bet;
            gameState.totalEarned += winnings - bet;
        } else {
            gameState.totalLosses += bet;
        }

        updateDisplay();
        checkAchievements();
    }, 500);
});

betInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') spinButton.click();
});

// Upgrades
function calculateUpgradeCost(upgrade) {
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
}

function calculateUpgradeEffect(upgrade) {
    if (upgrade.level === 0) return 0;
    return upgrade.baseEffect * Math.pow(upgrade.effectMultiplier, upgrade.level - 1);
}

function renderUpgrades() {
    const container = document.getElementById('upgrade-container');
    container.innerHTML = '';

    Object.keys(gameState.upgrades).forEach(key => {
        const upgrade = gameState.upgrades[key];
        const data = upgradeData[key];
        const cost = calculateUpgradeCost(upgrade);
        const effect = calculateUpgradeEffect(upgrade);

        const div = document.createElement('div');
        div.className = 'upgrade-item';
        div.innerHTML = `
            <div class="upgrade-info">
                <h3>${data.icon} ${data.name} [${upgrade.level}]</h3>
                <p>${data.desc}</p>
                <p style="margin-top: 5px;">+$${effect.toFixed(2)}/SEC</p>
            </div>
            <button id="buy-${key}" ${gameState.money < cost ? 'disabled' : ''}>
                $${cost.toLocaleString()}
            </button>
        `;
        container.appendChild(div);

        document.getElementById(`buy-${key}`).addEventListener('click', () => {
            if (gameState.money >= cost) {
                gameState.money -= cost;
                upgrade.level++;
                updateProduction();
                updateDisplay();
                renderUpgrades();
                checkAchievements();
            }
        });
    });
}

function updateProduction() {
    gameState.moneyPerSecond = 0;
    gameState.moneyPerClick = 1;

    Object.keys(gameState.upgrades).forEach(key => {
        const upgrade = gameState.upgrades[key];
        if (key === 'cursor') {
            gameState.moneyPerClick += calculateUpgradeEffect(upgrade);
        } else {
            gameState.moneyPerSecond += calculateUpgradeEffect(upgrade);
        }
    });
}

// Achievements
function renderAchievements() {
    const grid = document.getElementById('achievement-grid');
    grid.innerHTML = '';

    achievementData.forEach(achievement => {
        const unlocked = gameState.achievements[achievement.id];
        const div = document.createElement('div');
        div.className = `achievement ${unlocked ? 'unlocked' : 'locked'}`;
        div.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <h4>${achievement.name}</h4>
            <p>${achievement.desc}</p>
            ${unlocked ? '<p style="margin-top: 10px;">UNLOCKED</p>' : `<p style="margin-top: 10px;">REWARD: $${achievement.reward}</p>`}
        `;
        grid.appendChild(div);
    });
}

function checkAchievements() {
    achievementData.forEach(achievement => {
        if (!gameState.achievements[achievement.id] && achievement.check()) {
            gameState.achievements[achievement.id] = true;
            gameState.money += achievement.reward;
            gameState.totalEarned += achievement.reward;
            showNotification(`ACHIEVEMENT UNLOCKED: ${achievement.name}! +$${achievement.reward}`);
            renderAchievements();
        }
    });
}

// Prestige
const PRESTIGE_REQUIREMENT = 1000000;
document.getElementById('do-prestige').addEventListener('click', () => {
    if (gameState.totalEarned >= PRESTIGE_REQUIREMENT * Math.pow(10, gameState.prestigeLevel)) {
        if (confirm('ARE YOU SURE? THIS WILL RESET YOUR PROGRESS BUT GRANT A PERMANENT 10% PRODUCTION BONUS')) {
            gameState.prestigeLevel++;
            gameState.prestigeMultiplier = 1 + (gameState.prestigeLevel * 0.1);
            
            // Reset
            gameState.money = 0;
            gameState.totalEarned = 0;
            gameState.totalClicks = 0;
            gameState.totalBets = 0;
            gameState.totalWins = 0;
            gameState.totalLosses = 0;
            
            Object.keys(gameState.upgrades).forEach(key => {
                gameState.upgrades[key].level = 0;
            });
            
            updateProduction();
            updateDisplay();
            renderUpgrades();
            showNotification(`PRESTIGED! NEW MULTIPLIER: ${gameState.prestigeMultiplier.toFixed(1)}X`);
            checkAchievements();
        }
    } else {
        showNotification('NOT ENOUGH TOTAL EARNINGS TO PRESTIGE');
    }
});

// Display Updates
function updateDisplay() {
    moneyDisplay.textContent = '$' + gameState.money.toFixed(2);
    perClickDisplay.textContent = '$' + (gameState.moneyPerClick * gameState.prestigeMultiplier).toFixed(2);
    perSecondDisplay.textContent = '$' + (gameState.moneyPerSecond * gameState.prestigeMultiplier).toFixed(2);
    totalEarnedDisplay.textContent = '$' + gameState.totalEarned.toFixed(2);
    totalClicksDisplay.textContent = gameState.totalClicks.toLocaleString();
    
    // Casino stats
    document.getElementById('total-bets').textContent = gameState.totalBets;
    document.getElementById('total-wins').textContent = '$' + gameState.totalWins.toFixed(2);
    document.getElementById('total-losses').textContent = '$' + gameState.totalLosses.toFixed(2);
    document.getElementById('net-profit').textContent = '$' + (gameState.totalWins - gameState.totalLosses).toFixed(2);
    
    // Prestige
    prestigeDisplay.textContent = `PRESTIGE LV:${gameState.prestigeLevel} MULT:${gameState.prestigeMultiplier.toFixed(1)}X`;
    document.getElementById('current-multiplier').textContent = gameState.prestigeMultiplier.toFixed(1) + 'X';
    document.getElementById('prestige-points').textContent = gameState.prestigeLevel;
    document.getElementById('prestige-requirement').textContent = (PRESTIGE_REQUIREMENT * Math.pow(10, gameState.prestigeLevel)).toLocaleString();
    
    const prestigeButton = document.getElementById('do-prestige');
    prestigeButton.disabled = gameState.totalEarned < PRESTIGE_REQUIREMENT * Math.pow(10, gameState.prestigeLevel);
    
    renderUpgrades();
    saveGame();
}

// Notification System
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Game Loop
setInterval(() => {
    const earnings = gameState.moneyPerSecond * gameState.prestigeMultiplier;
    gameState.money += earnings;
    gameState.totalEarned += earnings;
    updateDisplay();
    checkAchievements();
}, 1000);

// Save/Load System
function saveGame() {
    localStorage.setItem('moneyMakerSave', JSON.stringify(gameState));
}

function loadGame() {
    const saved = localStorage.getItem('moneyMakerSave');
    if (saved) {
        try {
            const loaded = JSON.parse(saved);
            Object.assign(gameState, loaded);
            updateProduction();
        } catch (e) {
            console.error('Failed to load save:', e);
        }
    }
}

// Auto-save every 5 seconds
setInterval(saveGame, 5000);

// Initialize
loadGame();
updateProduction();
updateDisplay();
renderUpgrades();
renderAchievements();
checkAchievements();