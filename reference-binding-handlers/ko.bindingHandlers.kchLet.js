(function (ko) {

    var kchLetBootstrap = function (ko) {

        if (!ko.bindingHandlers.kchLet) {
            // Custom binding handler - Extend context with custom properties
            ko.bindingHandlers.kchLet = {
                init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {

                    // Make a modified binding context with additional properties
                    var innerContext = bindingContext['extend'](valueAccessor());
                    // Apply new context to descendant elements
                    ko.applyBindingsToDescendants(innerContext, element);
                    return { 'controlsDescendantBindings': true };

                }
            };

            ko.virtualElements.allowedBindings.kchLet = true;
        }

    };

    if (ko) {
        kchLetBootstrap(ko)
    } else if (typeof requirejs !== "undefined") {
        // Attempt to load Knockout as a RequireJS module
        requirejs(["knockout"], function (knockoutjs) {
            kchLetBootstrap(knockoutjs);
        });
    }

})(window.ko || this.ko);