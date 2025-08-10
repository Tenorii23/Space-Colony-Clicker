 // Game state
        const gameState = {
            energy: 0,
            energyPerClick: 1,
            energyPerSec: 0,
            protection: 0,
            colonyProgress: 0,
            colonyStage: 0, // 0: pod, 1: farms, 2: city
            
            // Buildings
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
                    description: "Housing for thousands of colonists"
                }
            },
            
            // Upgrades
            upgrades: {
                drill: {
                    name: "Laser Drill",
                    icon: "fas fa-bolt",
                    cost: 500,
                    purchased: false,
                    effect: "Doubles click energy",
                    description: "Advanced mining technology"
                },
                storage: {
                    name: "Energy Storage",
                    icon: "fas fa-battery-full",
                    cost: 1000,
                    purchased: false,
                    effect: "+50% energy from all sources",
                    description: "Store excess energy for later use"
                },
                defense: {
                    name: "Planetary Defense",
                    icon: "fas fa-satellite-dish",
                    cost: 5000,
                    purchased: false,
                    effect: "Triples shield effectiveness",
                    description: "Advanced asteroid defense system"
                }
            }
        };
        
        // DOM Elements
        const energyDisplay = document.getElementById('energy');
        const protectionDisplay = document.getElementById('protection');
        const energyPerSecDisplay = document.getElementById('energyPerSec');
        const planet = document.getElementById('planet');
        const eventDisplay = document.getElementById('event-display');
        const notification = document.getElementById('notification');
        const notificationContent = document.getElementById('notification-content');
        const progressBar = document.getElementById('colony-progress');
        const progressPercent = document.getElementById('progress-percent');
        const colonyPod = document.getElementById('colony-pod');
        const colonyFarms = document.getElementById('colony-farms');
        const colonyCity = document.getElementById('colony-city');
        
        // Initialize buildings
        function initBuildings() {
            const container = document.getElementById('buildings-container');
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
        
        // Initialize upgrades
        function initUpgrades() {
            const container = document.getElementById('upgrades-container');
            container.innerHTML = '';
            
            for (const key in gameState.upgrades) {
                const upgrade = gameState.upgrades[key];
                if (!upgrade.purchased) {
                    const upgradeEl = document.createElement('div');
                    upgradeEl.className = 'building';
                    upgradeEl.innerHTML = `
                        <div class="building-icon">${upgrade.icon ? `<i class="${upgrade.icon}"></i>` : ''}</div>
                        <div class="building-name">${upgrade.name}</div>
                        <div class="building-cost">Cost: ${upgrade.cost} energy</div>
                        <div class="building-description">${upgrade.description}</div>
                        <div class="building-effect">Effect: ${upgrade.effect}</div>
                    `;
                    
                    upgradeEl.addEventListener('click', () => purchaseUpgrade(key));
                    container.appendChild(upgradeEl);
                }
            }
        }
        
        // Purchase a building
        function purchaseBuilding(buildingKey) {
            const building = gameState.buildings[buildingKey];
            
            if (gameState.energy >= building.cost) {
                gameState.energy -= building.cost;
                building.count++;
                
                // Apply building effects
                if (building.energyPerSec) {
                    gameState.energyPerSec += building.energyPerSec;
                }
                if (building.protection) {
                    gameState.protection += building.protection;
                }
                
                // Update colony progress
                gameState.colonyProgress += building.cost * 0.1;
                
                updateUI();
                showNotification(`Built a new ${building.name}!`);
            } else {
                showNotification(`Not enough energy to build ${building.name}!`, true);
            }
        }
        
        // Purchase an upgrade
        function purchaseUpgrade(upgradeKey) {
            const upgrade = gameState.upgrades[upgradeKey];
            
            if (gameState.energy >= upgrade.cost) {
                gameState.energy -= upgrade.cost;
                upgrade.purchased = true;
                
                // Apply upgrade effects
                if (upgradeKey === 'drill') {
                    gameState.energyPerClick *= 2;
                } else if (upgradeKey === 'storage') {
                    // This effect is applied in the energy calculation
                } else if (upgradeKey === 'defense') {
                    // This effect is applied in asteroid events
                }
                
                updateUI();
                showNotification(`Upgrade purchased: ${upgrade.name}!`);
            } else {
                showNotification(`Not enough energy for ${upgrade.name} upgrade!`, true);
            }
        }
        
        // Update UI elements
        function updateUI() {
            // Update stats
            energyDisplay.textContent = Math.floor(gameState.energy);
            protectionDisplay.textContent = gameState.protection;
            energyPerSecDisplay.textContent = gameState.energyPerSec.toFixed(1);
            
            // Update progress bar
            const progress = Math.min(100, gameState.colonyProgress);
            progressBar.style.width = `${progress}%`;
            progressPercent.textContent = `${Math.floor(progress)}%`;
            
            // Update colony stage visuals
            colonyPod.classList.toggle('active', gameState.colonyStage >= 0);
            colonyFarms.classList.toggle('active', gameState.colonyStage >= 1);
            colonyCity.classList.toggle('active', gameState.colonyStage >= 2);
            
            // Update buildings display
            const buildingElements = document.querySelectorAll('.building');
            let i = 0;
            for (const key in gameState.buildings) {
                const building = gameState.buildings[key];
                buildingElements[i].querySelector('.building-count').textContent = building.count;
                i++;
            }
            
            // Reinitialize upgrades to remove purchased ones
            initUpgrades();
        }
        
        // Generate asteroid storm event
        function asteroidStorm() {
            const stormStrength = Math.floor(Math.random() * 100) + 50;
            
            // Create visual asteroids
            for (let i = 0; i < 10; i++) {
                createAsteroid();
            }
            
            setTimeout(() => {
                if (gameState.protection < stormStrength) {
                    // Storm causes damage
                    const damage = Math.min(gameState.energy, Math.floor(gameState.energy * 0.3));
                    gameState.energy -= damage;
                    
                    eventDisplay.innerHTML = `ASTEROID STORM!<br>${stormStrength} strength<br>Lost ${damage} energy!`;
                    eventDisplay.style.color = '#ff4d4d';
                    showNotification(`Asteroid storm hit! Lost ${damage} energy!`, true);
                } else {
                    // Successfully defended
                    eventDisplay.innerHTML = `ASTEROID STORM!<br>${stormStrength} strength<br>Defenses held!`;
                    eventDisplay.style.color = '#4dffdb';
                    showNotification(`Asteroid storm repelled by defenses!`);
                }
                
                updateUI();
                
                // Reset event display after delay
                setTimeout(() => {
                    eventDisplay.innerHTML = "Scanning space...";
                    eventDisplay.style.color = '#ffcc00';
                }, 5000);
            }, 1500);
        }
        
        // Create a visual asteroid
        function createAsteroid() {
            const asteroid = document.createElement('div');
            asteroid.className = 'event-asteroid';
            asteroid.innerHTML = '<i class="fas fa-meteor"></i>';
            
            // Random position
            const startX = Math.random() * window.innerWidth;
            const startY = Math.random() * window.innerHeight;
            asteroid.style.left = `${startX}px`;
            asteroid.style.top = `${startY}px`;
            
            // Random color
            const colors = ['#ff9900', '#ff4d4d', '#ffcc00', '#aaff00'];
            asteroid.style.color = colors[Math.floor(Math.random() * colors.length)];
            
            document.body.appendChild(asteroid);
            
            // Remove after animation
            setTimeout(() => {
                asteroid.remove();
            }, 5000);
        }
        
        // Show notification
        function showNotification(message, isError = false) {
            notificationContent.textContent = message;
            notification.style.borderLeftColor = isError ? '#ff4d4d' : '#4dffdb';
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
        
        // Create background stars
        function createStars() {
            const starsContainer = document.querySelector('.stars');
            const starCount = 200;
            
            for (let i = 0; i < starCount; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                
                // Random position
                const x = Math.random() * 100;
                const y = Math.random() * 100;
                star.style.left = `${x}vw`;
                star.style.top = `${y}vh`;
                
                // Random size
                const size = Math.random() * 3;
                star.style.width = `${size}px`;
                star.style.height = `${size}px`;
                
                // Random opacity
                star.style.opacity = Math.random();
                
                starsContainer.appendChild(star);
            }
        }
        
        // Initialize game
        function initGame() {
            // Create stars
            createStars();
            
            // Initialize buildings and upgrades
            initBuildings();
            initUpgrades();
            
            // Set up planet click
            planet.addEventListener('click', () => {
                // Add energy
                let energyGain = gameState.energyPerClick;
                
                // Apply storage upgrade
                if (gameState.upgrades.storage.purchased) {
                    energyGain *= 1.5;
                }
                
                gameState.energy += energyGain;
                
                // Add colony progress
                gameState.colonyProgress += energyGain * 0.05;
                
                // Visual feedback
                planet.style.boxShadow = '0 0 50px rgba(77, 121, 255, 1)';
                setTimeout(() => {
                    planet.style.boxShadow = '0 0 30px rgba(77, 121, 255, 0.7)';
                }, 100);
                
                // Update UI
                updateUI();
                
                // Create click effect
                const clickEffect = document.createElement('div');
                clickEffect.className = 'event-asteroid';
                clickEffect.innerHTML = '+1';
                clickEffect.style.color = '#4dffdb';
                clickEffect.style.left = `${event.clientX}px`;
                clickEffect.style.top = `${event.clientY}px`;
                document.body.appendChild(clickEffect);
                
                setTimeout(() => {
                    clickEffect.remove();
                }, 1000);
            });
            
            // Force event button
            document.getElementById('force-event').addEventListener('click', asteroidStorm);
            
            // Game loop - energy per second
            setInterval(() => {
                // Apply storage upgrade
                let energyGain = gameState.energyPerSec;
                if (gameState.upgrades.storage.purchased) {
                    energyGain *= 1.5;
                }
                
                gameState.energy += energyGain;
                
                // Update colony progress
                gameState.colonyProgress += energyGain * 0.02;
                
                // Update colony stage
                if (gameState.colonyProgress >= 30 && gameState.colonyStage < 1) {
                    gameState.colonyStage = 1;
                    showNotification("Colony expanded: Farms established!");
                } else if (gameState.colonyProgress >= 70 && gameState.colonyStage < 2) {
                    gameState.colonyStage = 2;
                    showNotification("Colony expanded: City dome constructed!");
                }
                
                updateUI();
            }, 1000);
            
            // Random events
            setInterval(() => {
                if (Math.random() > 0.7) {
                    asteroidStorm();
                }
            }, 30000);
        }
        
        // Start the game when page loads
        window.addEventListener('load', initGame);