let gameDatabase = [];
let currentCategory = 'all';

const originalTitle = document.title;
const originalFavicon = document.getElementById('favicon').href;

const cloakPresets = {
    classroom: {
        title: "Home",
        icon: "https://gstatic.com"
    },
    drive: {
        title: "My Drive - Google Drive",
        icon: "https://gstatic.com"
    },
    canvas: {
        title: "Dashboard",
        icon: "https://cloudfront.net"
    }
};

let activePanicUrl = localStorage.getItem('userPanicUrl') || 'https://wikipedia.org';

const gameGrid = document.getElementById('gameGrid');
const gameModal = document.getElementById('gameModal');
const gameFrame = document.getElementById('gameFrame');

async function initSite() {
    try {
        const response = await fetch('games.json');
        if (!response.ok) throw new Error(`HTTP error status: ${response.status}`);
        gameDatabase = await response.json();
        renderGrid(gameDatabase);
    } catch (error) {
        console.error("Could not load the game database:", error);
        gameGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #ff3b30;">Error loading game files. Run on a local web server framework.</p>`;
    }
}

function renderGrid(dataList) {
    gameGrid.innerHTML = "";
    if(dataList.length === 0) {
        gameGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #a0a0a5;">No games match your selection.</p>`;
        return;
    }
    dataList.forEach(game => {
        const card = document.createElement('div');
        card.classList.add('game-card');
        card.onclick = () => launchGame(game.iframeUrl);
        card.innerHTML = `
            <img src="${game.thumbnail}" alt="${game.title}" loading="lazy">
            <h3>${game.title}</h3>
        `;
        gameGrid.appendChild(card);
    });
}

function launchGame(url) {
    gameFrame.src = url;
    gameModal.style.display = "flex";
}

function closeGame() {
    gameModal.style.display = "none";
    gameFrame.src = ""; 
}

function filterCategory(category, buttonElement) {
    currentCategory = category;
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    buttonElement.classList.add('active');
    document.getElementById('searchBar').value = "";
    if (category === 'all') {
        renderGrid(gameDatabase);
    } else {
        const filtered = gameDatabase.filter(game => game.category.toLowerCase() === category.toLowerCase());
        renderGrid(filtered);
    }
}

function searchGames() {
    const query = document.getElementById('searchBar').value.toLowerCase();
    const filtered = gameDatabase.filter(game => {
        const matchesQuery = game.title.toLowerCase().includes(query);
        const matchesCategory = (currentCategory === 'all' || game.category.toLowerCase() === currentCategory.toLowerCase());
        return matchesQuery && matchesCategory;
    });
    renderGrid(filtered);
}

function changeCloak() {
    const select = document.getElementById('cloakSelect');
    const favicon = document.getElementById('favicon');
    const selectedValue = select.value;
    if (selectedValue === 'none') {
        document.title = originalTitle;
        favicon.href = originalFavicon;
    } else if (cloakPresets[selectedValue]) {
        document.title = cloakPresets[selectedValue].title;
        favicon.href = cloakPresets[selectedValue].icon;
    }
}

function updatePanicUrl() {
    const select = document.getElementById('panicSelect');
    if (select.value === 'custom') {
        const customTarget = prompt("Enter the exact redirect URL:", "https://");
        if (customTarget && customTarget.trim() !== "" && customTarget !== "https://") {
            activePanicUrl = customTarget.trim();
            localStorage.setItem('userPanicUrl', activePanicUrl);
        } else {
            select.value = activePanicUrl;
        }
    } else {
        activePanicUrl = select.value;
        localStorage.setItem('userPanicUrl', activePanicUrl);
    }
}

// Redirects current page smoothly
function triggerPanic() {
    window.location.replace(activePanicUrl);
}

function syncPanicInterface() {
    const select = document.getElementById('panicSelect');
    if (!select) return;
    const options = Array.from(select.options).map(opt => opt.value);
    if (options.includes(activePanicUrl)) {
        select.value = activePanicUrl;
    } else {
        select.value = 'custom';
    }
}

window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') triggerPanic();
});

window.onload = function() {
    initSite();
    syncPanicInterface();
};
