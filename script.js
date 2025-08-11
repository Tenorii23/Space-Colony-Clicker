// Fixed planet unlock order
const planetOrder = ["mars", "moon", "europa", "titan"];

// Game state
const gameState = {
    energy: 100,
    energyPerClick: 1,
    energyPerSec: 0,
    protection: 0,
    colonists: 0,
    colonyProgress: 0,
    colonyStage: 0, // 0: pod, 1: farms, 2: city
    currentPlanet: "mars", // mars, moon, europa, titan

    // Planets data with progress tracking
    planets: {
        mars: {
            name: "Mars",
            icon: "fas fa-globe-americas",
            description: "The red planet - our first step in colonizing the solar system",
            progress: 0,
            stage: 0,
            completed: false,
            unlocked: true
        },
        moon: {
            name: "Earth's Moon",
            icon: "fas fa-moon",
            description: "Earth's natural satellite - ideal for mining operations",
            progress: 0,
            stage: 0,
            completed: false,
            unlocked: false
        },
        europa: {
            name: "Europa",
            icon: "fas fa-water",
            description: "Jupiter's icy moon - potential source of extraterrestrial life",
            progress: 0,
            stage: 0,
            completed: false,
            unlocked: false
        },
        titan: {
            name: "Titan",
            icon: "fas fa-ring",
            description: "Saturn's largest moon - rich in organic compounds",
            progress: 0,
            stage: 0,
            completed: false,
            unlocked: false
        }
    },

    // Buildings - persistent across planets
    buildings: {
        solarPanel: {
            name: "Solar Panel",
            icon: "fas fa-solar-panel",
            cost: 15,
            count: 0,
            energyPerSec: 0.5,
            description: "Generates energy from sunlight"
        },
        mine: {
            name: "Auto-Miner",
            icon: "fas fa-hammer",
            cost: 100,
            count: 0,
            energyPerSec: 2,
            description: "Automatically mines resources"
        },
        shield: {
            name: "Shield Generator",
            icon: "fas fa-shield-alt",
            cost: 200,
            count: 0,
            protection: 5,
            description: "Protects against asteroid storms"
        },
        farm: {
            name: "Hydroponic Farm",
            icon: "fas fa-tractor",
            cost: 500,
            count: 0,
            energyPerSec: 5,
            colonists: 10,
            description: "Produces food for colonists"
        },
        reactor: {
            name: "Fusion Reactor",
            icon: "fas fa-atom",
            cost: 2000,
            count: 0,
            energyPerSec: 20,
            description: "High-output energy generator"
        },
        city: {
            name: "Habitat Dome",
            icon: "fas fa-building",
            cost: 10000,
            count: 0,
            energyPerSec: 50,
            protection: 20,
            colonists: 100,
            description: "Housing for thousands of colonists"
        },
        spaceport: {
            name: "Interplanetary Spaceport",
            icon: "fas fa-rocket",
            cost: 5000,
            count: 0,
            energyPerSec: 30,
            description: "Enables travel to other planets"
        }
    }
};

// DOM Elements (may be null if missing in HTML; guarded later)
const energyDisplay = document.getElementById('energy');
const protectionDisplay = document.getElementById('protection');
const energyPerSecDisplay = document.getElementById('energyPerSec');
const colonistsDisplay = document.getElementById('colonists');
const planet = document.getElementById('planet');
const eventDisplay = document.getElementById('event-display');
const notification = document.getElementById('notification');
const notificationContent = document.getElementById('notification-content');
const progressBar = document.getElementById('colony-progress');
const progressPercent = document.getElementById('progress-percent');
const colonyPod = document.getElementById('colony-pod');
const colonyFarms = document.getElementById('colony-farms');
const colonyCity = document.getElementById('colony-city');
const currentPlanetDisplay = document.getElementById('current-planet');
const planetsSection = document.getElementById('planets-section');

// -----------------
// Helper: add progress and handle completion once
// -----------------
function addProgressToPlanet(planetKey, amount) {
    const p = gameState.planets[planetKey];
    if (!p) return;
    if (p.completed) return; // do nothing if already completed

    // add and cap to 100
    p.progress = Math.min(100, p.progress + amount);
    gameState.colonyProgress = p.progress;

    // If we hit completion, mark complete and unlock next
    if (p.progress >= 100 && !p.completed) {
        p.progress = 100;
        p.completed = true;
        showNotification(`${p.name} colony complete! New planets unlocked!`, false, true);

        // ensure currentPlanet is the one that finished (only set if finishing the current planet)
        if (gameState.currentPlanet !== planetKey) {
            // optional: set currentPlanet to completed planet — usually you finish the current one,
            // but if other code could finish a non-current planet, handle it gracefully.
            gameState.currentPlanet = planetKey;
        }

        // Unlock next planet according to order
        unlockNextPlanet();
    }

    // Refresh UI immediately
    updateUI();
    initPlanets();
}

// Initialize buildings
function initBuildings() {
    const container = document.getElementById('buildings-container');
    if (!container) return;
    container.innerHTML = '';

    for (const key in gameState.buildings) {
        const building = gameState.buildings[key];
        const buildingEl = document.createElement('div');
        buildingEl.className = 'building';
        buildingEl.innerHTML = `
            <div class="building-icon">${building.icon ? `<i class="${building.icon}"></i>` : ''}</div>
            <div class="building-name">${building.name}</div>
            <div class="building-cost">Cost: ${building.cost} energy</div>
            <div class="building-count">${building.count}</div>
        `;
        buildingEl.addEventListener('click', () => purchaseBuilding(key));
        container.appendChild(buildingEl);
    }
}

// Initialize planets (use planetOrder for stable sequence)
function initPlanets() {
    const container = document.getElementById('planets-container');
    if (!container) return;
    container.innerHTML = '';

    // Use planetOrder so UI order is predictable
    planetOrder.forEach(key => {
        const pdata = gameState.planets[key];
        const planetEl = document.createElement('div');
        planetEl.className = `planet-card ${pdata.unlocked ? '' : 'locked'} ${gameState.currentPlanet === key ? 'active' : ''}`;
        planetEl.innerHTML = `
            <div class="planet-header">
                <div class="planet-icon">${pdata.icon ? `<i class="${pdata.icon}"></i>` : ''}</div>
                <div class="planet-title">${pdata.name}</div>
            </div>
            <div class="planet-description">${pdata.description}</div>
            <div class="planet-progress">Progress: ${pdata.progress.toFixed(0)}%</div>
            ${pdata.unlocked ? `<button class="btn ${gameState.currentPlanet === key ? 'btn-success' : ''}" data-planet="${key}">${gameState.currentPlanet === key ? 'Current Planet' : 'Travel To'}</button>` : '<div class="planet-progress">Locked - Complete previous planet</div>'}
        `;

        if (pdata.unlocked) {
            const btn = planetEl.querySelector('button');
            if (btn) btn.addEventListener('click', () => travelToPlanet(key));
        }

        container.appendChild(planetEl);
    });
}

// Purchase a building
function purchaseBuilding(buildingKey) {
    const building = gameState.buildings[buildingKey];
    if (!building) return;

    if (gameState.energy >= building.cost) {
        gameState.energy -= building.cost;
        building.count++;

        if (building.energyPerSec) {
            gameState.energyPerSec += building.energyPerSec;
        }
        if (building.protection) {
            gameState.protection += building.protection;
        }
        if (building.colonists) {
            gameState.colonists += building.colonists;
        }

        // Add progress to current planet using helper (caps & triggers completion)
        addProgressToPlanet(gameState.currentPlanet, building.cost * 0.1);

        showNotification(`Built a new ${building.name}!`);
        if (buildingKey === 'spaceport' && building.count > 0) {
            // unlocking via spaceport still allowed
            unlockNextPlanet();
        }
    } else {
        showNotification(`Not enough energy to build ${building.name}!`, true);
    }
}

// Travel to another planet
function travelToPlanet(planetKey) {
    if (planetKey === gameState.currentPlanet) return;

    const p = gameState.planets[planetKey];
    if (!p) return;

    if (!p.unlocked) {
        showNotification(`This planet is still locked! Complete the previous planet first.`, true);
        return;
    }
    function resetStatsForNewPlanet() {
    gameState.energy = 100;
    gameState.energyPerClick = 1;
    gameState.energyPerSec = 0;
    gameState.protection = 0;
    gameState.colonists = 0;

    // Reset building counts for the new planet (optional: comment out if you want to keep buildings)
    for (const key in gameState.buildings) {
        gameState.buildings[key].count = 0;
    }
}

    gameState.currentPlanet = planetKey;
    if (currentPlanetDisplay) currentPlanetDisplay.textContent = p.name;
    updatePlanetVisual();
    gameState.colonyProgress = p.progress;
    updateUI();
    initPlanets();
    showNotification(`Traveling to ${p.name}!`, false, true);
    // ...inside updatePlanetVisual or updateUI...
const diffSpan = document.getElementById('planet-difficulty');
if (diffSpan && pdata.difficulty) {
    diffSpan.textContent = ` | Difficulty: ${pdata.difficulty}`;
}
}

// FIXED unlock order
function unlockNextPlanet() {
    const currentIndex = planetOrder.indexOf(gameState.currentPlanet);
    if (currentIndex !== -1 && currentIndex < planetOrder.length - 1) {
        const nextPlanetKey = planetOrder[currentIndex + 1];
        if (!gameState.planets[nextPlanetKey].unlocked) {
            gameState.planets[nextPlanetKey].unlocked = true;
            console.log(`Unlocked planet: ${gameState.planets[nextPlanetKey].name}`);
            showNotification(`New planet unlocked: ${gameState.planets[nextPlanetKey].name}!`, false, true);
        }
    }
    initPlanets();
}

// Update planet visual
function updatePlanetVisual() {
    const pdata = gameState.planets[gameState.currentPlanet];
    if (!pdata) return;

    let planetClass = `planet-${gameState.currentPlanet}`;
    if (pdata.progress >= 100) {
        planetClass += '-colonized';
        pdata.completed = true;
    }

    const planetElement = document.getElementById('planet');
    if (planetElement) {
        planetElement.className = `planet-view ${planetClass}`;
        planetElement.textContent = `${pdata.name.toUpperCase()} ${pdata.completed ? 'COLONIZED' : 'COLONY'}`;
    }

    const detailEl = document.querySelector('.planet-details');
    if (detailEl) detailEl.textContent = pdata.description;

    const progressLabel = document.querySelector('.progress-label span:first-child');
    if (progressLabel) progressLabel.textContent = `${pdata.name} Progress`;
}

// Update UI
function updateUI() {
    if (energyDisplay) energyDisplay.textContent = Math.floor(gameState.energy);
    if (protectionDisplay) protectionDisplay.textContent = gameState.protection;
    if (energyPerSecDisplay) energyPerSecDisplay.textContent = gameState.energyPerSec.toFixed(1);
    if (colonistsDisplay) colonistsDisplay.textContent = gameState.colonists;

    const currentPlanet = gameState.planets[gameState.currentPlanet];
    if (currentPlanet) {
        const progress = Math.min(100, currentPlanet.progress);
        if (progressBar) progressBar.style.width = `${progress}%`;
        if (progressPercent) progressPercent.textContent = `${Math.floor(progress)}%`;

        updatePlanetVisual();

        // keep colony stage logic (stages won't change after completion because progress is capped)
        if (currentPlanet.progress >= 30 && currentPlanet.stage < 1) currentPlanet.stage = 1;
        else if (currentPlanet.progress >= 70 && currentPlanet.stage < 2) currentPlanet.stage = 2;

        if (colonyPod) colonyPod.classList.toggle('active', currentPlanet.stage >= 0);
        if (colonyFarms) colonyFarms.classList.toggle('active', currentPlanet.stage >= 1);
        if (colonyCity) colonyCity.classList.toggle('active', currentPlanet.stage >= 2);
    }

    // Update buildings display safely
    const buildingElements = document.querySelectorAll('.building');
    let i = 0;
    for (const key in gameState.buildings) {
        const b = gameState.buildings[key];
        if (!b) continue;
        const el = buildingElements[i];
        if (el) {
            const countEl = el.querySelector('.building-count');
            if (countEl) countEl.textContent = b.count;
        }
        i++;
    }

    // Make sure planet list is up-to-date too
    initPlanets();
}

// Asteroid storm
function asteroidStorm() {
    const stormStrength = Math.floor(Math.random() * 100) + 50;
    for (let i = 0; i < 10; i++) createAsteroid();

    setTimeout(() => {
        if (gameState.protection < stormStrength) {
            const damage = Math.min(gameState.energy, Math.floor(gameState.energy * 0.3));
            gameState.energy -= damage;
            if (eventDisplay) {
                eventDisplay.innerHTML = `ASTEROID STORM!<br>${stormStrength} strength<br>Lost ${damage} energy!`;
                eventDisplay.style.color = '#ff4d4d';
            }
            showNotification(`Asteroid storm hit! Lost ${damage} energy!`, true);
        } else {
            if (eventDisplay) {
                eventDisplay.innerHTML = `ASTEROID STORM!<br>${stormStrength} strength<br>Defenses held!`;
                eventDisplay.style.color = '#4dffdb';
            }
            showNotification(`Asteroid storm repelled by defenses!`);
        }
        updateUI();
        setTimeout(() => {
            if (eventDisplay) {
                eventDisplay.innerHTML = "Scanning space...";
                eventDisplay.style.color = '#ffcc00';
            }
        }, 5000);
    }, 1500);
}

// Create asteroid
function createAsteroid() {
    const asteroid = document.createElement('div');
    asteroid.className = 'event-asteroid';
    asteroid.innerHTML = '<i class="fas fa-meteor"></i>';
    asteroid.style.left = `${Math.random() * window.innerWidth}px`;
    asteroid.style.top = `${Math.random() * window.innerHeight}px`;
    const colors = ['#ff9900', '#ff4d4d', '#ffcc00', '#aaff00'];
    asteroid.style.color = colors[Math.floor(Math.random() * colors.length)];
    document.body.appendChild(asteroid);
    setTimeout(() => asteroid.remove(), 5000);
}

// Show notification
function showNotification(message, isError = false, isSuccess = false) {
    if (notificationContent && notification) {
        notificationContent.textContent = message;
        notification.className = 'notification show';
        if (isError) notification.classList.add('warning');
        else if (isSuccess) notification.classList.add('success');
        setTimeout(() => {
            notification.classList.remove('show', 'warning', 'success');
        }, 3000);
    } else {
        // Fallback if notification area missing
        console.log('NOTIFICATION:', message);
    }
}
// ...existing code...
planets: {
    mars: {
        name: "Mars"
        icon: "fas fa-globe-americas"
        description: "The red planet - our first step in colonizing the solar system"
        progress: 0
        stage: 0
        completed: false
        unlocked: true
        difficulty: 1 // new
    }
    moon: {
        name: "Earth's Moon"
        icon: "fas fa-moon"
        description: "Earth's natural satellite - ideal for mining operations"
        progress: 0
        stage: 0
        completed: false
        unlocked: false
        difficulty: 2 // new
    }
    europa: {
        name: "Europa"
        icon: "fas fa-water"
        description: "Jupiter's icy moon - potential source of extraterrestrial life"
        progress: 0
        stage: 0
        completed: false
        unlocked: false
        difficulty: 3 
    }
    titan: {
        name: "Titan"
        icon: "fas fa-ring"
        description: "Saturn's largest moon - rich in organic compounds"
        progress: 0
        stage: 0
        completed: false
        unlocked: false
        difficulty: 4 
    }
}

// Create stars
function createStars() {
    const starsContainer = document.querySelector('.stars');
    if (!starsContainer) return;
    const starCount = 200;
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}vw`;
        star.style.top = `${Math.random() * 100}vh`;
        const size = Math.random() * 3;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.opacity = Math.random();
        starsContainer.appendChild(star);
    }
}


// Resource feedback
function createResourceFeedback(x, y, amount) {
    const feedback = document.createElement('div');
    feedback.className = 'resource-feedback';
    feedback.textContent = `+${amount}`;
    feedback.style.left = `${x}px`;
    feedback.style.top = `${y}px`;
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 1000);
}

// Init game
function initGame() {
    createStars();
    initBuildings();
    initPlanets();

    if (planet) {
        planet.addEventListener('click', (e) => {
            const energyGain = gameState.energyPerClick;
            gameState.energy += energyGain;
            // use helper to handle capping and completion
            addProgressToPlanet(gameState.currentPlanet, energyGain * 0.05);
            planet.style.transform = 'scale(0.95)';
            setTimeout(() => planet.style.transform = 'scale(1)', 100);
            createResourceFeedback(e.clientX, e.clientY, energyGain);
        });
    }

    const forceBtn = document.getElementById('force-event');
    if (forceBtn) forceBtn.addEventListener('click', asteroidStorm);

    setInterval(() => {
        gameState.energy += gameState.energyPerSec;
        updateUI();
    }, 1000);

    setInterval(() => {
        if (Math.random() > 0.7) asteroidStorm();
    }, 30000);

    updateUI();
}

window.addEventListener('load', initGame);
