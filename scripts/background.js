chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "knockout-context-hover",
        title: "KO Context Hover",
        contexts: ["page", "image", "selection", "link", "editable"]
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!tab?.id) return;

    try {
        // Check communication with the content script
        try {
            await chrome.tabs.sendMessage(tab.id, { ping: true });
        } catch (e) {
            // Content script not available, inject it
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['scripts/contentscript.js']
            });
        }

        // Send the command
        await chrome.tabs.sendMessage(tab.id, {
            functionToInvoke: "toggleKoContextHover"
        });
    } catch (error) {
        console.error('Failed to send message to content script:', error);
    }
});
