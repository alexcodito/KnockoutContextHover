// Todo: Check if KOJS exists on the page, otherwise don't create a context menu option.

browser.contextMenus.create({
    id: "knockout-context-hover",
    title: "Toggle KnockoutJS Context",
    contexts: ["page"]
});

browser.contextMenus.onClicked.addListener((info, tab) => {

    browser.tabs.sendMessage(tab.id, {
        "functiontoInvoke": "toggleKoContextHover"
    });

});