if (ko && !ko.bindingHandlers['hoverClass']) {
    ko.bindingHandlers.hoverClass = {
        update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {

            element.addEventListener('mouseover', function (e) {
				if (element && e.target === element) {
                    element.classList.add("class", valueAccessor());
					e.stopPropagation();
                }
            });

			element.addEventListener('mouseout', function (e) {
				
				if (element && element.children && e.target) {

					var match = ko.utils.arrayFirst(element.children, function(element) {
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