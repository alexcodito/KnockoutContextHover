function runScriptInPageScope(scriptPath) {

	var script = document.createElement('script');
	script.setAttribute("type", "text/javascript");
	script.setAttribute("src", chrome.extension.getURL(scriptPath));

	script.onload = function () {
		this.remove();
	};

	(document.body || document.documentElement).appendChild(script);

}

function loadHtml(url, element, callback) {

	var request = new XMLHttpRequest();

	request.onreadystatechange = function () {
		if (this.status === 200) {

			if (element) {
				element.innerHTML = request.responseText;
			}

			if (callback && typeof callback === "function") {
				callback(this.status);
			}

		}
	};

	request.open("GET", url, false);
	request.send(null);

}

chrome.runtime.onMessage.addListener(function (message, sender, callback) {

	if (message.functiontoInvoke === "toggleKoContextHover") {

		var contextHoverPanel = document.getElementById('ko-context-hover');

		// Toggle Off
		if (contextHoverPanel) {
			contextHoverPanel.remove();
			return;
		}

		// Toggle On
		contextHoverPanel = document.createElement('div');
		contextHoverPanel.id = 'ko-context-hover';

		(document.body || document.documentElement).appendChild(contextHoverPanel);

		loadHtml(chrome.extension.getURL("markup/panel.html"), contextHoverPanel,
			function (status) {

                if (status === 200) {

                    // Load custom binding handlers and the main script
                    runScriptInPageScope('reference-binding-handlers/ko.bindingHandlers.kchLet.js');
                    runScriptInPageScope('reference-binding-handlers/ko.bindingHandlers.kchHoverClass.js');
                    runScriptInPageScope('scripts/ko-context-hover.js');

                } else {
                    console.log('Failed to load markup for the \'knockout-context-hover\' browser extension.')
                }

			});

	}

});