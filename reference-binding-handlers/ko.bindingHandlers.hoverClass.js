if (ko && !ko.bindingHandlers['hoverClass']) {
    ko.bindingHandlers.hoverClass = {
        update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {

            $(element).on("mouseover",
                function(e) {
                    if (e.target === element) {
                        element.classList.add("class", valueAccessor());
                        e.stopPropagation();
                    }
                });

            $(element).on("mouseleave",
                function(e) {
                    element.classList.remove("class", valueAccessor());
                });

        }
    };
}