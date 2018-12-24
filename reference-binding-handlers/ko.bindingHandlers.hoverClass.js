if (ko && !ko.bindingHandlers['hoverClass']) {
    ko.bindingHandlers.hoverClass = {
        update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {

            element.addEventListener('mouseover', function (e) {
                if (e.target === element) {
                    element.classList.add("class", valueAccessor());
                    e.stopPropagation();
                }
            });

            element.addEventListener('mouseleave', function (e) {
                element.classList.remove("class", valueAccessor());
            });

        }
    };
}