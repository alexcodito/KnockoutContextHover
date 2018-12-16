ko.bindingHandlers.log = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var logName = allBindings.get('logName') || element.name || element.id;
        var logUnwrap = allBindings.get('logUnwrap') ? true : allBindings.get('logUnwrap');
        var logMore = allBindings.get('logMore');

        console.log('Log' + (logName ? " '" + logName + "'" : "") + ':', logUnwrap ? ko.unwrap(valueAccessor()) : valueAccessor());

        if (logMore && logMore.length > 0) {
            logMore.forEach(function (data) {
                console.log(logUnwrap ? ko.unwrap(data) : data);
            });
        }
    }
};

ko.virtualElements.allowedBindings['log'] = true;