if (window.ko && !ko.bindingHandlers.kchLet) {
    ko.bindingHandlers.kchLet = {
        'init': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            // Make a modified binding context, with extra properties, and apply it to descendant elements
            var innerContext = bindingContext['extend'](valueAccessor());
            ko.applyBindingsToDescendants(innerContext, element);
            return { 'controlsDescendantBindings': true };
        }
    };
    ko.virtualElements.allowedBindings.kchLet = true;
}