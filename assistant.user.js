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
            font-size: 28px;
            cursor: pointer;
            box-shadow: 0 8px 20px rgba(0,0,0,.35);
            z-index: 999999;
            transition: transform .2s ease, box-shadow .2s ease;
        }

        #tpa-button:hover {
            transform: scale(1.08);
            box-shadow: 0 12px 28px rgba(0,0,0,.45);
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
            display: none;
            font-family: "Segoe UI", Arial, sans-serif;
        }

        #tpa-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 14px 18px;
            background: #ff6b00;
            font-weight: bold;
        }

        #tpa-title {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        #tpa-title svg {
            width: 24px;
            height: 24px;
        }

        #tpa-close {
            cursor: pointer;
            font-size: 20px;
            user-select: none;
            transition: transform .2s ease;
        }

        #tpa-close:hover {
            transform: scale(1.2);
        }

        #tpa-content {
            padding: 18px;
            line-height: 1.8;
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

    panel.innerHTML = `
        <div id="tpa-header">

            <div id="tpa-title">
                ${printerIconSVG}
                <span>3D Printing Assistant</span>
            </div>

            <div id="tpa-close">✕</div>

        </div>

        <div id="tpa-content">

            <p><strong>🌐 Site :</strong> ${APP.currentSite}</p>
            <p><strong>📦 Version :</strong> ${APP.version}</p>
            <p><strong>🟢 Statut :</strong> Connecté</p>

        </div>
    `;

    document.body.appendChild(panel);

    document
        .getElementById("tpa-close")
        .addEventListener("click", togglePanel);
}
function togglePanel() {

    const panel = document.getElementById("tpa-panel");

    if (panel.style.display === "block") {
        panel.style.display = "none";
    } else {
        panel.style.display = "block";
    }

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

detectSite();

injectStyles();

createPanel();

createButton();

})();