function runScriptInPageScope(scriptPath) {

    var script = document.createElement('script');
    script.setAttribute("type", "text/javascript");
    script.setAttribute("src", browser.extension.getURL(scriptPath));

    script.onload = function () {
        this.remove();
    };

    (document.body || document.documentElement).appendChild(script);
}

browser.runtime.onMessage.addListener(function (message, sender, callback) {

    if (message.functiontoInvoke === "toggleKoContextHover") {

        // Toggle Off
        if ($("#ko-context-hover").length) {
            $("#ko-context-hover").detach();
            $("#ko-context-hover").remove();
            return;
        }

        // Toggle On
        var contextHoverPanel = document.createElement('div');
        contextHoverPanel.id = 'ko-context-hover';

        (document.body || document.documentElement).appendChild(contextHoverPanel);

        $(contextHoverPanel).load(browser.extension.getURL("markup/panel.html"), function (response, status, xhr) {

            if (status === "success") {

                runScriptInPageScope('reference-binding-handlers/ko.bindingHandlers.let.js');
                runScriptInPageScope('reference-binding-handlers/ko.bindingHandlers.hoverClass.js');
                runScriptInPageScope('scripts/ko-context-hover.js');

            }

        });

    }

});