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

})();
