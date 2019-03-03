if (window.ko && !ko.bindingHandlers['visibility']) {
	ko.bindingHandlers.visibility = {
		update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {

			if (element && valueAccessor) {

				if (valueAccessor()) {
					element.style.visibility = "visible";
				} else {
					element.style.visibility = "hidden";
				}

			}

		}
	};
}