// Todo: Check if KOJS exists on the page, otherwise don't create a context menu option.

chrome.contextMenus.create({
    id: "knockout-context-hover",
    title: "KO Context Hover",
    contexts: ["page"]
});

chrome.contextMenus.onClicked.addListener((info, tab) => {

    chrome.tabs.sendMessage(tab.id, {
        "functiontoInvoke": "toggleKoContextHover"
    });

});