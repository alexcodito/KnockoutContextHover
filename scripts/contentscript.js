async function runScriptInPageScope(scriptPath) {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(scriptPath);
    script.type = "text/javascript";

    return new Promise((resolve, reject) => {
        script.onload = () => {
            script.remove();
            resolve();
        };
        script.onerror = () => reject(new Error(`Failed to load script: ${scriptPath}`));
        (document.head || document.documentElement).appendChild(script);
    });
}

async function loadHtml(url, element, callback) {
    try {
        const response = await fetch(url);
        const success = response.status === 200;

        if (element && success) {
            element.innerHTML = await response.text();
        }

        callback?.(response.status);
        return success;
    } catch (error) {
        console.error(`Error loading HTML from ${url}:`, error);
        callback?.(0);
        return false;
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Handle ping message for script injection check
    if (message.ping) {
        sendResponse(true);
        return;
    }

    if (message.functionToInvoke === "toggleKoContextHover") {
        handleKoContextHover()
            .then(() => sendResponse(true))
            .catch((error) => {
                console.error(error);
                sendResponse(false);
            });
        return true;
    }
});

async function handleKoContextHover() {
    const PANEL_ID = 'ko-context-hover';
    let panel = document.getElementById(PANEL_ID);

    if (panel) {
        panel.style.display = panel.style.display ? '' : 'none';
        return;
    }

    panel = document.createElement('div');
    panel.id = PANEL_ID;
    document.body.appendChild(panel);

    const panelUrl = await chrome.runtime.getURL("markup/panel.html");
    const success = await loadHtml(panelUrl, panel);

    if (success) {
        try {
            await Promise.all([
                'reference-binding-handlers/ko.bindingHandlers.kchLet.js',
                'reference-binding-handlers/ko.bindingHandlers.kchHoverClass.js',
                'scripts/ko-context-hover.js'
            ].map(runScriptInPageScope));
        } catch (error) {
            console.error('Failed to load scripts for knockout-context-hover:', error);
        }
    } else {
        console.error('Failed to load markup for knockout-context-hover browser extension');
    }
}