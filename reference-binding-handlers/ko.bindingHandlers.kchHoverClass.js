(function (ko) {

	var kchHoverClassBootstrap = function (ko) {

		if (!ko.bindingHandlers.kchHoverClass) {
			// Custom binding handler - Add specified class on hover
			ko.bindingHandlers.kchHoverClass = {
				update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {

					element.addEventListener('mouseover', function (e) {
						if (element && e.target === element) {
							element.classList.add("class", valueAccessor());
							e.stopPropagation();
						}
					});

					element.addEventListener('mouseout', function (e) {

						if (element && element.children && e.target) {

							var match = ko.utils.arrayFirst(element.children, function (element) {
								return element === e.relatedTarget;
							});

							if (!match) {
								element.classList.remove("class", valueAccessor());
							}
						}
					});

				}
			};
		}

	}

	if (ko) {
		kchHoverClassBootstrap(ko)
	} else if (typeof requirejs !== "undefined") {
		// Attempt to load Knockout as a RequireJS module
		requirejs(["knockout"], function (knockoutjs) {
			kchHoverClassBootstrap(knockoutjs);
		});
	}

})(window.ko || this.ko);