// Game State
let gameState = {
    money: 0,
    totalClicks: 0,
    currentWood: 'oak',
    woodTypes: {
        oak: { unlocked: true, icon: '/assets/oakwood.png', bonus: 1, cost: 0, name: 'Oak Wood' },
        birch: { unlocked: false, icon: 'assets/birchwood.png', bonus: 1.5, cost: 100, name: 'Birch Wood' },
        cherry: { unlocked: false, icon: 'assets/cherrywood.png', bonus: 2, cost: 500, name: 'Cherry Wood' },
        jungle: { unlocked: false, icon: 'assets/pinewood.png', bonus: 3, cost: 2000, name: 'Jungle Wood' },
        dark_oak: { unlocked: false, icon: 'assets/wallnut.png', bonus: 5, cost: 10000, name: 'Dark Oak Wood' },
        spruce: { unlocked: false, icon: 'assets/maplewood.png', bonus: 10, cost: 50000, name: 'Spruce Wood' }
    },
    upgrades: {
        doubleSwing: { level: 0, maxLevel: 10, baseCost: 50, costMultiplier: 2 },
        sharpAxe: { level: 0, maxLevel: 10, baseCost: 200, costMultiplier: 2.5 },
        strongArms: { level: 0, maxLevel: 10, baseCost: 1000, costMultiplier: 3 },
        autoChop: { level: 0, maxLevel: 5, baseCost: 5000, costMultiplier: 4 }
    }
};


// Upgrade Information
const upgradeInfo = {
    doubleSwing: {
        name: 'Double Swing',
        icon: '⚡',
        description: 'Doubles your money per chop'
    },
    sharpAxe: {
        name: 'Sharp Axe',
        icon: '🪓',
        description: '+50% money per chop'
    },
    strongArms: {
        name: 'Strong Arms',
        icon: '💪',
        description: '+100% money per chop'
    },
    autoChop: {
        name: 'Auto-Chop',
        icon: '🤖',
        description: 'Automatic chopping every 2 seconds'
    }
};

// Initialize Game
function initGame() {
    loadGame();
    updateUI();
    renderWoodTypes();
    renderUpgrades();
    setupEventListeners();
    
    // Auto-chop interval
    setInterval(autoChop, 2000);
}

// Calculate money per click
function getMoneyPerClick() {
    let baseAmount = 1;
    
    // Wood type bonus
    const currentWoodData = gameState.woodTypes[gameState.currentWood];
    baseAmount *= currentWoodData.bonus;
    
    // Double Swing upgrade (x2 per level)
    if (gameState.upgrades.doubleSwing.level > 0) {
        baseAmount *= Math.pow(2, gameState.upgrades.doubleSwing.level);
    }
    
    // Sharp Axe upgrade (+50% per level)
    if (gameState.upgrades.sharpAxe.level > 0) {
        baseAmount *= (1 + (gameState.upgrades.sharpAxe.level * 0.5));
    }
    
    // Strong Arms upgrade (+100% per level)
    if (gameState.upgrades.strongArms.level > 0) {
        baseAmount *= (1 + (gameState.upgrades.strongArms.level * 1));
    }
    
    return Math.floor(baseAmount);
}

// Chop wood (main action)
function chopWood() {
    const earnedMoney = getMoneyPerClick();
    gameState.money += earnedMoney;
    gameState.totalClicks++;
    
    // Visual feedback
    createFloatingText('+€' + earnedMoney);
    
    updateUI();
    saveGame();
}

// Auto chop (from upgrade)
function autoChop() {
    if (gameState.upgrades.autoChop.level > 0) {
        const earnedMoney = getMoneyPerClick() * gameState.upgrades.autoChop.level * 0.1;
        gameState.money += Math.floor(earnedMoney);
        updateUI();
        saveGame();
    }
}

// Create floating text animation
function createFloatingText(text) {
    const floatingText = document.createElement('div');
    floatingText.textContent = text;
    floatingText.style.position = 'fixed';
    floatingText.style.left = '50%';
    floatingText.style.top = '45%';
    floatingText.style.transform = 'translate(-50%, -50%)';
    floatingText.style.fontSize = '3rem';
    floatingText.style.fontWeight = 'bold';
    floatingText.style.color = '#ffd700';
    floatingText.style.textShadow = '0 0 20px rgba(255, 215, 0, 0.8), 2px 2px 4px rgba(0,0,0,0.8)';
    floatingText.style.pointerEvents = 'none';
    floatingText.style.zIndex = '1000';
    floatingText.style.animation = 'floatUp 1.2s ease-out forwards';
    floatingText.style.fontFamily = "'Bebas Neue', sans-serif";
    floatingText.style.letterSpacing = '3px';
    
    document.body.appendChild(floatingText);
    
    setTimeout(() => {
        floatingText.remove();
    }, 1200);
}

// Switch wood type
function switchWood(woodType) {
    const wood = gameState.woodTypes[woodType];
    
    if (!wood.unlocked) {
        if (gameState.money >= wood.cost) {
            gameState.money -= wood.cost;
            wood.unlocked = true;
            gameState.currentWood = woodType;
            updateUI();
            renderWoodTypes();
            saveGame();
        } else {
            alert(`Not enough money! You need €${wood.cost}`);
        }
    } else {
        gameState.currentWood = woodType;
        updateUI();
        saveGame();
    }
}

// Buy upgrade
function buyUpgrade(upgradeKey) {
    const upgrade = gameState.upgrades[upgradeKey];
    
    if (upgrade.level >= upgrade.maxLevel) {
        return;
    }
    
    const cost = getUpgradeCost(upgradeKey);
    
    if (gameState.money >= cost) {
        gameState.money -= cost;
        upgrade.level++;
        updateUI();
        saveGame();
    } else {
        alert(`Not enough money! You need €${cost}`);
    }
}

// Calculate upgrade cost
function getUpgradeCost(upgradeKey) {
    const upgrade = gameState.upgrades[upgradeKey];
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
}

// Render wood types
function renderWoodTypes() {
    const container = document.getElementById('woodTypes');
    container.innerHTML = '';
    
    for (const [key, wood] of Object.entries(gameState.woodTypes)) {
        const woodDiv = document.createElement('div');
        woodDiv.className = 'wood-type';
        
        if (wood.unlocked) {
            woodDiv.classList.remove('locked');
            if (gameState.currentWood === key) {
                woodDiv.classList.add('active');
            }
        } else {
            woodDiv.classList.add('locked');
        }
        
        const bonusText = wood.bonus === 1 ? 'Standard' : `×${wood.bonus} Multiplier`;
        
        woodDiv.innerHTML = `
            <div class="wood-header">
                <span class="wood-icon"><img src='${wood.icon}'></span>
                <span class="wood-name">${wood.name}</span>
            </div>
            <div class="wood-bonus">${bonusText}</div>
            ${!wood.unlocked ? `<div class="wood-cost">Cost: €${wood.cost.toLocaleString()}</div>` : ''}
        `;
        
        woodDiv.addEventListener('click', () => switchWood(key));
        container.appendChild(woodDiv);
    }
}

// Render upgrades
function renderUpgrades() {
    const container = document.getElementById('upgrades');
    container.innerHTML = '';
    
    for (const [key, upgrade] of Object.entries(gameState.upgrades)) {
        const info = upgradeInfo[key];
        const upgradeDiv = document.createElement('div');
        upgradeDiv.className = 'upgrade';
        
        if (upgrade.level > 0) {
            upgradeDiv.classList.add('unlocked');
        } else {
            upgradeDiv.classList.add('locked');
        }
        
        const cost = getUpgradeCost(key);
        const isMaxLevel = upgrade.level >= upgrade.maxLevel;
        const canAfford = gameState.money >= cost;
        
        upgradeDiv.innerHTML = `
            <div class="upgrade-header">
                <div class="upgrade-name">
                    <span class="upgrade-icon">${info.icon}</span>
                    ${info.name}
                </div>
                <div class="upgrade-level">Level ${upgrade.level}/${upgrade.maxLevel}</div>
            </div>
            <div class="upgrade-description">${info.description}</div>
            <button class="upgrade-button" data-upgrade="${key}">
                ${isMaxLevel ? 'MAX LEVEL' : `Buy: €${cost.toLocaleString()}`}
            </button>
        `;
        
        // Add event listener to the button
        const button = upgradeDiv.querySelector('.upgrade-button');
        if (isMaxLevel || !canAfford) {
            button.disabled = true;
        } else {
            button.disabled = false;
            button.addEventListener('click', () => buyUpgrade(key));
        }
        
        container.appendChild(upgradeDiv);
    }
}

// Update UI
function updateUI() {
    document.getElementById('money').textContent = Math.floor(gameState.money).toLocaleString();
    document.getElementById('moneyPerClick').textContent = getMoneyPerClick().toLocaleString();
    document.getElementById('totalClicks').textContent = gameState.totalClicks.toLocaleString();
    
    const currentWood = gameState.woodTypes[gameState.currentWood];
    document.getElementById('currentWoodName').textContent = currentWood.name;
    document.getElementById('currentWoodIcon').innerHTML = `<img src="${currentWood.icon}" alt="${currentWood.name}">`;
    document.getElementById('currentWoodMultiplier').textContent = `×${currentWood.bonus} Multiplier`;
    
    // Update upgrade buttons based on current money
    renderUpgrades();
}

// Save game to localStorage
function saveGame() {
    localStorage.setItem('lumberTycoonSave', JSON.stringify(gameState));
}

// Load game from localStorage
function loadGame() {
    const savedGame = localStorage.getItem('lumberTycoonSave');
    if (savedGame) {
        try {
            const loadedState = JSON.parse(savedGame);
            // Merge saved state with default state (in case new features were added)
            gameState = { ...gameState, ...loadedState };
            
            // Ensure all wood types have names (for old saves)
            const defaultWoodTypes = {
                oak: { name: 'Oak Wood' },
                birch: { name: 'Birch Wood' },
                cherry: { name: 'Cherry Wood' },
                jungle: { name: 'Jungle Wood' },
                dark_oak: { name: 'Dark Oak Wood' },
                spruce: { name: 'Spruce Wood' }
            };
            
            for (const [key, wood] of Object.entries(gameState.woodTypes)) {
                if (!wood.name) {
                    wood.name = defaultWoodTypes[key].name;
                }
            }
        } catch (e) {
            console.error('Error loading save:', e);
        }
    }
}

// Reset game
function resetGame() {
    if (confirm('Are you sure you want to reset the game? All progress will be lost!')) {
        localStorage.removeItem('lumberTycoonSave');
        location.reload();
    }
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('chopButton').addEventListener('click', chopWood);
    document.getElementById('resetButton').addEventListener('click', resetGame);
    
    // Audio setup
    const bgMusic = document.getElementById('bgMusic');
    
    if (bgMusic) {
        // Set volume
        bgMusic.volume = 0.5;
        
        // Try to play - handle autoplay blocking
        const playPromise = bgMusic.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Autoplay started successfully
                console.log('Background music playing');
            }).catch(error => {
                // Autoplay was prevented - show play button
                console.log('Autoplay blocked - user interaction needed');
                createPlayButton();
            });
        }
    }
}

// Create a play button when autoplay is blocked
function createPlayButton() {
    const playBtn = document.createElement('button');
    playBtn.id = 'playMusicButton';
    playBtn.innerHTML = 'Click to Enable Music';
    playBtn.style.position = 'fixed';
    playBtn.style.top = '20px';
    playBtn.style.right = '20px';
    playBtn.style.padding = '15px 25px';
    playBtn.style.background = '#4CAF50';
    playBtn.style.color = 'white';
    playBtn.style.border = 'none';
    playBtn.style.borderRadius = '10px';
    playBtn.style.cursor = 'pointer';
    playBtn.style.fontSize = '1rem';
    playBtn.style.fontWeight = '600';
    playBtn.style.zIndex = '1000';
    playBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
    playBtn.style.fontFamily = "'Poppins', sans-serif";
    
    playBtn.addEventListener('click', () => {
        const bgMusic = document.getElementById('bgMusic');
        bgMusic.play().then(() => {
            playBtn.remove();
            console.log('Music started after user interaction');
        }).catch(error => {
            console.error('Error playing music:', error);
        });
    });
    
    document.body.appendChild(playBtn);
}

// Start game when page loads
window.addEventListener('DOMContentLoaded', initGame);