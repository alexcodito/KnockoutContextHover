chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "knockout-context-hover",
        title: "KO Context Hover",
        contexts: ["page", "image", "selection", "link", "editable"]
    });

    chrome.contextMenus.onClicked.addListener(async (info, tab) => {
        if (!tab?.id) return;

        try {
            // First try to inject the content script if it's not already there
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['scripts/contentscript.js']
            });

            // Then send the message
            await chrome.tabs.sendMessage(tab.id, {
                "functionToInvoke": "toggleKoContextHover"
            });
        } catch (error) {
            console.error('Failed to send message to content script:', error);
        }
    });
});
