// ==UserScript==
// @name         tabmove
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  able to move the tabs to different positions
// @author       @squirrel
// @match        https://pikidiary.lol/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pikidiary.lol
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const containerSelector = '.tab-cont';
    const tabSelector = '.tab';
    const storageKey = 'pikidiary_tab_order';

    function init() {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        let tabs = Array.from(container.querySelectorAll(tabSelector));
        if (!tabs.length) return;

        const savedOrder = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (savedOrder.length) {
            savedOrder.forEach(href => {
                const tab = tabs.find(t => t.getAttribute('href') === href);
                if (tab) container.appendChild(tab);
            });
            tabs = Array.from(container.querySelectorAll(tabSelector));
        }

        tabs.forEach(tab => {
            tab.setAttribute('draggable', 'true');
            tab.style.userSelect = 'none';
        });

        let dragged = null;

        tabs.forEach(tab => {
            tab.addEventListener('dragstart', e => {
                dragged = tab;
                tab.style.opacity = '0.4';
                e.dataTransfer.effectAllowed = 'move';
            });

            tab.addEventListener('dragend', () => {
                dragged.style.opacity = '';
                dragged = null;
                const newOrder = Array.from(container.querySelectorAll(tabSelector))
                    .map(t => t.getAttribute('href'));
                localStorage.setItem(storageKey, JSON.stringify(newOrder));
            });

            tab.addEventListener('dragover', e => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                const target = tab;
                if (dragged && target !== dragged) {
                    const rect = target.getBoundingClientRect();
                    const before = (e.clientX - rect.left) < rect.width / 2;
                    container.insertBefore(dragged, before ? target : target.nextSibling);
                }
            });
        });
    }

    const observer = new MutationObserver(() => {
        if (document.querySelector(containerSelector) &&
            document.querySelectorAll(tabSelector).length) {
            observer.disconnect();
            init();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();
