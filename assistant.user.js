// ==UserScript==
// @name         3D Printing Assistant
// @namespace    https://github.com/Raph24/3D-Printing-Assistant
// @version      0.1.0
// @description  Enhance Printables, MakerWorld, Cults3D and Thingiverse.
// @author       Raph24
// @license      MIT

// @match        https://www.printables.com/*
// @match        https://makerworld.com/*
// @match        https://cults3d.com/*
// @match        https://www.thingiverse.com/*

// @run-at       document-idle

// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    "use strict";

    const APP = {
        name: "3D Printing Assistant",
        version: "0.1.0",
        currentSite: "Unknown",

        supportedSites: {
            printables: {
                host: "printables.com",
                name: "Printables"
            },
            makerworld: {
                host: "makerworld.com",
                name: "MakerWorld"
            },
            cults3d: {
                host: "cults3d.com",
                name: "Cults3D"
            },
            thingiverse: {
                host: "thingiverse.com",
                name: "Thingiverse"
            }
        }
    };

let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

function injectStyles() {
    GM_addStyle(`
        /* ===========================
           Bouton flottant
        =========================== */

        #tpa-button {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            border: none;
            background: #ff6b00;
            color: white;
            cursor: pointer;
            box-shadow: 0 8px 20px rgba(0,0,0,.35);
            z-index: 999999;
            transition: transform .2s ease, box-shadow .2s ease;
        }

        #tpa-button:hover {
            transform: scale(1.08);
            box-shadow: 0 12px 28px rgba(0,0,0,.45);
        }

        #tpa-button svg{
            width:30px;
            height:30px;
        }

        /* ===========================
           Fenêtre principale
        =========================== */

        #tpa-panel {

            position: fixed;

            right: 100px;
            bottom: 24px;

            width: 360px;

            background: #1f1f23;
            color: white;

            border-radius: 16px;

            box-shadow: 0 15px 40px rgba(0,0,0,.45);

            overflow: hidden;

            z-index: 999998;

            font-family: "Segoe UI", Arial, sans-serif;

            /* Animation */

            opacity: 0;

            transform: translateY(20px) scale(.95);

            pointer-events: none;

            transition:
                opacity .25s ease,
                transform .25s ease;

        }

        #tpa-panel.show{

            opacity:1;

            transform:translateY(0) scale(1);

            pointer-events:auto;

        }

        /* ===========================
           Header
        =========================== */

        #tpa-header {

            display:flex;

            justify-content:space-between;

            align-items:center;

            padding:14px 18px;

            background:#ff6b00;

            font-weight:bold;

        }

        #tpa-title{

            display:flex;

            align-items:center;

            gap:10px;

        }

        #tpa-title svg{

            width:24px;

            height:24px;

        }

        /* ===========================
           Bouton fermer
        =========================== */

        #tpa-close{

            cursor:pointer;

            font-size:24px;

            transition:.2s;

            user-select:none;

        }

        #tpa-close:hover{

            transform:rotate(90deg);

        }

        /* ===========================
           Contenu
        =========================== */

        #tpa-content{

            padding:20px;

            line-height:2;

        }
        /* ===========================
   Barre des onglets
=========================== */

#tpa-tabs{

    display:flex;

    background:#2b2b30;

    border-bottom:1px solid #444;

}

.tpa-tab{

    flex:1;

    padding:12px;

    border:none;

    background:none;

    color:#bbb;

    cursor:pointer;

    transition:.2s;

    font-size:14px;

}

.tpa-tab:hover{

    background:#3a3a40;

    color:white;

}

.tpa-tab.active{

    background:#ff6b00;

    color:white;

    font-weight:bold;

}


    `);
}
const printerIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 64 64"
     width="32"
     height="32"
     fill="none"
     stroke="white"
     stroke-width="4"
     stroke-linecap="round"
     stroke-linejoin="round">

    <rect x="14" y="16" width="36" height="30" rx="3"/>
    <line x1="22" y1="8" x2="42" y2="8"/>
    <line x1="32" y1="8" x2="32" y2="22"/>
    <polygon points="28,22 36,22 32,30" fill="white"/>
    <rect x="24" y="34" width="16" height="8" rx="2" fill="white"/>

</svg>
`;
function createPanel() {

    const panel = document.createElement("div");
    panel.id = "tpa-panel";

    const savedLeft = GM_getValue("panelLeft", null);
    const savedTop = GM_getValue("panelTop", null);

    if (savedLeft !== null && savedTop !== null) {
    panel.style.left = savedLeft + "px";
    panel.style.top = savedTop + "px";
    panel.style.right = "auto";
    panel.style.bottom = "auto";
}
    panel.innerHTML = `
    <div id="tpa-header">

        <div id="tpa-title">
            ${printerIconSVG}
            <span>3D Printing Assistant</span>
        </div>

        <div id="tpa-close">✕</div>

    </div>

    <div id="tpa-tabs">

        <button class="tpa-tab active" data-tab="home">🏠 Accueil</button>

        <button class="tpa-tab" data-tab="calculator">💰 Calcul</button>

        <button class="tpa-tab" data-tab="filament">🧵 Filament</button>

        <button class="tpa-tab" data-tab="settings">⚙️</button>

    </div>

    <div id="tpa-content">

        <div id="tpa-page"></div>

    </div>
`;

    document.body.appendChild(panel);

    document
        .getElementById("tpa-close")
        .addEventListener("click", togglePanel);

    enableDragging();
    showHome();
    initTabs();
}
function togglePanel(){

    const panel = document.getElementById("tpa-panel");

    panel.classList.toggle("show");

}
function enableDragging() {

    const panel = document.getElementById("tpa-panel");
    const header = document.getElementById("tpa-header");

    header.addEventListener("mousedown", (e) => {

        isDragging = true;

        dragOffsetX = e.clientX - panel.offsetLeft;
        dragOffsetY = e.clientY - panel.offsetTop;

    });

    document.addEventListener("mousemove", (e) => {

        if (!isDragging) return;

        panel.style.left = (e.clientX - dragOffsetX) + "px";
        panel.style.top = (e.clientY - dragOffsetY) + "px";

        panel.style.right = "auto";
        panel.style.bottom = "auto";

    });

   document.addEventListener("mouseup", () => {

    if (isDragging) {

        GM_setValue("panelLeft", panel.offsetLeft);
        GM_setValue("panelTop", panel.offsetTop);

        console.log("📍 Position sauvegardée :", panel.offsetLeft, panel.offsetTop);

    }

    isDragging = false;

});

}
function createButton() {

    const button = document.createElement("button");

    button.id = "tpa-button";

    button.innerHTML = printerIconSVG;

    button.title = "3D Printing Assistant";

    button.addEventListener("click", togglePanel);

    document.body.appendChild(button);
}
function detectSite() {

        const host = window.location.hostname;

        for (const key in APP.supportedSites) {

            const site = APP.supportedSites[key];

            if (host.includes(site.host)) {
                APP.currentSite = site.name;
                break;
            }
        }

        console.log(`🖨 ${APP.name}`);
        console.log(`📦 Version : ${APP.version}`);
        console.log(`🌐 Site détecté : ${APP.currentSite}`);

}
function showHome(){

    document.getElementById("tpa-page").innerHTML = `

        <h3>Bienvenue 👋</h3>

        <p><strong>🌐 Site :</strong> ${APP.currentSite}</p>

        <p><strong>📦 Version :</strong> ${APP.version}</p>

        <p><strong>🟢 Statut :</strong> Connecté</p>

    `;

}
function showCalculator() {

    document.getElementById("tpa-page").innerHTML = `
        <h3>💰 Calculateur</h3>
        <p>Cette fonctionnalité arrivera dans la prochaine version.</p>
    `;

}

function showFilament() {

    document.getElementById("tpa-page").innerHTML = `
        <h3>🧵 Filaments</h3>
        <p>Gestion des bobines à venir.</p>
    `;

}

function showSettings() {

    document.getElementById("tpa-page").innerHTML = `
        <h3>⚙️ Paramètres</h3>
        <p>Configuration de l'assistant.</p>
    `;

}
function initTabs() {

    const tabs = document.querySelectorAll(".tpa-tab");

    tabs.forEach(tab => {

        tab.addEventListener("click", () => {

            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            switch (tab.dataset.tab) {

                case "home":
                    showHome();
                    break;

                case "calculator":
                    showCalculator();
                    break;

                case "filament":
                    showFilament();
                    break;

                case "settings":
                    showSettings();
                    break;
            }

        });

    });

}
detectSite();

injectStyles();

createPanel();

createButton();

})();