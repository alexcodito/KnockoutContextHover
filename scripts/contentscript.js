async function runScriptInPageScope(scriptPath) {

    let script = document.createElement('script');
	// top level script module allows using ECMA-modiule imports
    script.setAttribute("type", "module");
    script.setAttribute("src", await chrome.runtime.getURL(scriptPath));

	script.onload = function () {
		this.remove();
	};

	(document.body || document.documentElement).appendChild(script);

}


/**
 * Fetches HTML from @see url
 * on successfull fetch injects
 * its contents into @see element DOM Node
 * and calls for a function given in @see callback
 * 
 * @param {String} url 
 * @param {Node} element 
 * @param {CallableFunction} callback 
 */
async function loadHtml(url, element, callback) {

    const request = await fetch(url);

    if (element && request.status === 200) {
        element.innerHTML = await request.text();
    }

    if (typeof callback === "function") {
        callback(request.status);
    }

}

chrome.runtime.onMessage.addListener(async function (message, sender, callback) {

	if (message.functiontoInvoke === "toggleKoContextHover") {

        let contextHoverPanel = document.getElementById('ko-context-hover');

        // Toggle visibility when already intialized
        if (contextHoverPanel) {            
            contextHoverPanel.style.display = !contextHoverPanel.style.display ? 'none' : '';
			return;
		}

		// Load KoContextHover markup and scripts
		contextHoverPanel = document.createElement('div');
		contextHoverPanel.id = 'ko-context-hover';

		(document.body || document.documentElement).appendChild(contextHoverPanel);

        await loadHtml(
            await chrome.runtime.getURL("markup/panel.html"), contextHoverPanel,
			/**
             * Binds addon KO bindings and hoverable markup
             * to a page if markup successfuly fetched
             * 
             * @param {Number} status Response HTTP code
             */
            async function (status) {

                if (status === 200) {

                    // Load custom binding handlers and the main script
                    await runScriptInPageScope(
                        'reference-binding-handlers/ko.bindingHandlers.kchLet.js')
                    await runScriptInPageScope(
                        'reference-binding-handlers/ko.bindingHandlers.kchHoverClass.js')
                    await runScriptInPageScope(
                        'scripts/ko-context-hover.js')

                } else {
                    console.error('Failed to load markup for the \'knockout-context-hover\' browser extension.')
                }
            }
        );

	}

});