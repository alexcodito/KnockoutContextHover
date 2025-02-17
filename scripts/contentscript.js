async function runScriptInPageScope(scriptPath) {
    try {
        const scriptUrl = chrome.runtime.getURL(scriptPath);
        const response = await fetch(scriptUrl);
        const scriptContent = await response.text();

        const script = document.createElement('script');
        script.type = "text/javascript";
        script.src = scriptUrl;

        return new Promise((resolve, reject) => {
            script.onload = () => {
                script.remove();
                resolve();
            };
            script.onerror = () => reject(new Error(`Failed to load script: ${scriptPath}`));
            (document.head || document.documentElement).appendChild(script);
        });
    } catch (error) {
        console.error(`Error loading script ${scriptPath}:`, error);
        throw error;
    }
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

chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.functionToInvoke === "toggleKoContextHover") {
        handleKoContextHover().catch(console.error);
    }
    return true;
});

async function handleKoContextHover() {
    const PANEL_ID = 'ko-context-hover';
    let contextHoverPanel = document.getElementById(PANEL_ID);

    if (contextHoverPanel) {
        contextHoverPanel.style.display = contextHoverPanel.style.display ? '' : 'none';
        return;
    }

    contextHoverPanel = document.createElement('div');
    contextHoverPanel.id = PANEL_ID;
    (document.body || document.documentElement).appendChild(contextHoverPanel);

    const panelUrl = await chrome.runtime.getURL("markup/panel.html");
    const success = await loadHtml(panelUrl, contextHoverPanel);

    if (success) {
        try {
            const scripts = [
                'reference-binding-handlers/ko.bindingHandlers.kchLet.js',
                'reference-binding-handlers/ko.bindingHandlers.kchHoverClass.js',
                'scripts/ko-context-hover.js'
            ];

            await Promise.all(scripts.map(runScriptInPageScope));
        } catch (error) {
            console.error('Failed to load scripts for knockout-context-hover:', error);
        }
    } else {
        console.error('Failed to load markup for knockout-context-hover browser extension');
    }
}