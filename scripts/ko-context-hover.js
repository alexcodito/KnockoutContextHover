let KoContextVm = function (ko) {

    if (!ko) {
        console.log('KnockoutContextHover: ko is not defined.');
        return undefined;
    }

    const self = this;
    let targetElement;
    let koContextHoverElement = document.getElementById('ko-context-hover');
    let koContextHoverListElement = document.getElementById('ko-context-hover-list');

    if (!koContextHoverElement || !koContextHoverListElement) {
        return undefined;
    }

    function truncate(str, max) {
        return str.length > max ? str.substr(0, max - 4) + ' ...' : str;
    };

    function reapplyNodeBindings(element) {

        if (element) {

            let context = ko.contextFor(element);
            if (context) {
                ko.cleanNode(element);
                ko.applyBindings(context, element);
            }

        }

    };

    function parseKnockoutValue(item, depth) {

        let ret = undefined;
        depth = depth || 1;

        if (item) {

            ret = ko.unwrap(item);

            if (ret === null) {
                return 'null';
            }

            if (ret === undefined) {
                return 'undefined';
            }

            if (typeof ret === 'string' || ret instanceof String) {
                ret = '"' + truncate(ret, 200) + '"';
            }

            if (Array.isArray(ret)) {
                ret = 'Array [' + ret.length + ']';
            }

            if (typeof ret === 'object') {

                //ret = '{ ' + Object.entries(ret).join(', ') + ' }';
                ret = Object.entries(ret).map(function (entry) {
                    if (depth < 2) {
                        return ' ' + entry[0] + ': ' + parseKnockoutValue(entry[1], depth++);
                    } else {
                        return ' ' + entry[0] + ': ' + (typeof entry[1] === 'string' ? truncate(entry[1], 200) : typeof entry[1]);
                    }
                }).toString();

                //ret = '{ ' + ret + ' }';
                ret = '{ ' + truncate(ret, 200) + ' }';
            }

            if (typeof ret === 'function') {
                ret = 'function';
            }


        }

        return ret;

    };

    function refreshTargetElementKoData() {

        if (targetElement) {

            let classList = [];
            let newContext = self.settings.rootScope().action(targetElement);

            if (newContext === undefined || newContext === null) {
                self.targetElementKoData({});
            } else {
                self.targetElementKoData(newContext);
            }

            if (targetElement.classList && targetElement.classList.forEach) {
                targetElement.classList.forEach(x => { if (!x.startsWith('ko-context-hover')) { classList.push('.' + x) } });
            }

            self.targetElementAttributes({

                tagName: targetElement.tagName,
                hasNextTarget: targetElement.nextSibling !== null || (targetElement.parentNode !== null && targetElement.parentNode.nextSibling !== null),
                childElementCount: targetElement.childElementCount || 0,
                name: targetElement.name ? truncate(targetElement.name, 30) : undefined,
                id: targetElement.id ? truncate(targetElement.id, 30) : undefined,
                classList: classList ? truncate(classList.join(' '), 50) : undefined

            });

        } else {
            self.targetElementKoData({});
            self.targetElementAttributes(undefined);
        }

    };

    function handleKeyDown(e) {

        if (!document.getElementById('ko-context-hover')) {

            document.removeEventListener('keydown', handleKeyDown);

            if (targetElement && targetElement.classList) {
                targetElement.classList.remove('ko-context-hover-target-element');
            }

            return;
        }

        if (e.shiftKey && e.keyCode === 49) {
            self.settings.koContextHoverHalted(!self.settings.koContextHoverHalted());
        }

        if (e.shiftKey && e.keyCode === 50) {
            self.settings.koContextHoverFollowCursorHalted(!self.settings.koContextHoverFollowCursorHalted());
        }

    };

    function selectTargetElement(newTargetElement) {

        if (newTargetElement && targetElement !== newTargetElement) {

            if (targetElement && targetElement.classList) {
                targetElement.classList.remove('ko-context-hover-target-element');
            }

            if (newTargetElement && newTargetElement.classList) {
                newTargetElement.classList.add('ko-context-hover-target-element');
            }

            targetElement = newTargetElement;

            refreshTargetElementKoData();
        }


    }

    function handleMouseMove(e) {

        let koContextHover = document.getElementById('ko-context-hover');

        if (!koContextHover) {

            document.removeEventListener('mousemove', handleMouseMove);

            if (targetElement && targetElement.classList) {
                targetElement.classList.remove('ko-context-hover-target-element');
            }

            return;
        }

        // Ensure that the mouse isn't hovering the KO Context Hover panel itself to avoid recursion.
        function checkTargetSelf (target) {

            if (target === koContextHover) {
                return true;
            } else if (target.parentElement) {
                return checkTargetSelf(target.parentElement);
            }

            return false;

        };

        if (checkTargetSelf(e.target)) {
            return;
        }

        const clientX = e.clientX;
        const clientY = e.clientY;

        if (!self.settings.koContextHoverFollowCursorHalted()) {

            if (clientX > window.document.body.clientWidth / 2) {
                // Invert the direction of the panel's location offset when the mouse pointer is on the right part of the screen
                koContextHoverElement.style.left = clientX - koContextHoverElement.clientWidth - 5 + 'px';
            } else {
                koContextHoverElement.style.left = clientX + 5 + 'px';
            }

            if (clientY > window.document.body.clientHeight / 2) {
                // Invert the direction of the panel's location offset when the mouse pointer is on the bottom part of the screen
                koContextHoverElement.style.top = clientY + document.documentElement.scrollTop - koContextHoverElement.clientHeight - 15 + 'px';
            } else {
                koContextHoverElement.style.top = clientY + document.documentElement.scrollTop + 15 + 'px';
            }
        }

        if (self.settings.koContextHoverHalted()) {
            return;
        }

        let newTargetElement = document.elementFromPoint(clientX, clientY);

        selectTargetElement(newTargetElement);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousemove', handleMouseMove);

    self.targetElementAttributes = ko.observable();
    self.targetElementKoData = ko.observable({});
    self.parseKnockoutValue = parseKnockoutValue;
    self.refreshTargetElementKoData = refreshTargetElementKoData;

    self.viewMode = {

        context: ko.observable(true),
        settings: ko.observable(false),
        set: function (targetViewMode) {

            for (viewMode in self.viewMode) {
                if (ko.isWriteableObservable(self.viewMode[viewMode])) {
                    self.viewMode[viewMode](false);
                }
            }

            targetViewMode(true);
        }

    };

    self.ref = {

        scopes: [
            { name: 'Data', action: ko.dataFor },
            { name: 'Context', action: ko.contextFor }
        ],

        yesNo: [
            { name: 'Yes', value: true },
            { name: 'No', value: false },
        ]

    };

    self.settings = {

        rootScope: ko.observable(self.ref.scopes[0]),
        logUnwrap: ko.observable(true),
        koContextHoverHalted: ko.observable(false),
        koContextHoverFollowCursorHalted: ko.observable(false),

        set: function (setting, value, callback) {

            if (ko.isWriteableObservable(setting)) {
                setting(value);
            }

            return typeof callback === 'function' && callback();

        }

    };

    self.consoleLogElementContext = function (hoverContext, data) {

        if (hoverContext) {
            if (self.settings.logUnwrap()) {
                console.log(ko.unwrap(ko.unwrap(hoverContext)[data]));
            } else {
                if (ko.isObservable(hoverContext) && hoverContext()) {
                    console.log(hoverContext()[data]);
                } else {
                    console.log(hoverContext[data]);
                }
            }
        }

    };

    self.toggleNode = function (hoverContext, property, childrenNodes) {

        if (childrenNodes()) {
            childrenNodes(undefined);
        } else {
            childrenNodes(ko.unwrap(ko.unwrap(hoverContext)[property]));
        }

    };

    self.reapplyTargetElementBindings = function () {

        if (targetElement !== null) {
            reapplyNodeBindings(targetElement);
            refreshTargetElementKoData();
        }

    };

    self.targetPreviousElement = function () {

        if (targetElement !== null) {

            let newTargetElement;

            if (targetElement.previousSibling !== null) {
                newTargetElement = targetElement.previousSibling;
            }
            else if (targetElement.parentNode !== null) {
                newTargetElement = targetElement.parentNode;
            }

            if (newTargetElement !== null) {
                selectTargetElement(newTargetElement);
            }

        }

    };

    self.targetNextElement = function (traverseChild) {

        if (targetElement !== null) {

            let newTargetElement = targetElement;

            if (traverseChild === true && targetElement.firstChild !== null) {
                // Scope to first child node
                newTargetElement = targetElement.firstChild;
            } else if (traverseChild === false) {
                // Scan the tree upwards to scope to an adjacent sibling
                while (newTargetElement || (newTargetElement && newTargetElement.parentNode !== null)) {
                    if (newTargetElement.nextSibling !== null) {
                        // Scope to next node
                        newTargetElement = newTargetElement.nextSibling;
                        break;
                    }
                    newTargetElement = newTargetElement.parentNode;
                }
            }

            // Todo: Consider restricting this to just Node.ELEMENT_NODE node types
            if (newTargetElement !== null) {
                selectTargetElement(newTargetElement);
            }

        }

    };

    // Turn a regular property into an observable.
    self.coerceObservable = function (data, prop) {
        if (!ko.isObservable(data[prop])) {

            if (Array.isArray(data[prop])) {
                data[prop] = ko.observableArray(data[prop]);
            } else {
                data[prop] = ko.observable(data[prop]);
            }

            if (targetElement && targetElement.attributes && targetElement.attributes['data-bind']) {

                // Todo: Handle existing ko.unwrap() and explicit unwrapping.
                targetElement.attributes['data-bind'].value = targetElement.attributes['data-bind'].value.replace(prop, prop + '()');

                self.reapplyTargetElementBindings();
            }

        }

    };

    self.enforceNumericInput = function (data) {

        if (ko.isWriteableObservable(data)) {
            data(parseInt(data(), 10));
        } else {
            data = parseInt(data, 10);
        }

    };

    self.checkDataIsInvokable = function (data) {

        let uData = ko.unwrap(data);

        return uData !== undefined
            && uData !== null
            && ((typeof uData === 'object' && !Array.isArray(uData)) || (Array.isArray(uData) && uData.length > 0))
            && uData !== {}
            && uData !== '';

    };

    self.checkDataIsDefined = function (data) {

        let uData = ko.unwrap(data);

        return uData !== undefined && uData !== null;

    };

    self.checkDataIsFunction = function (data) {

        let uData = ko.unwrap(data);

        return typeof uData === 'function';

    };

    self.checkDataIsText = function (data) {

        let uData = ko.unwrap(data);

        return typeof uData === 'string';

    };

    self.checkDataIsNumber = function (data) {

        let uData = ko.unwrap(data);

        return typeof uData === 'number';

    };

    self.checkDataIsBoolean = function (data) {

        let uData = ko.unwrap(data);

        return typeof uData === 'boolean';

    };

    self.executeFunction = function (data) {

        let uData = ko.unwrap(data);

        if (typeof uData === 'function') {
            console.log(uData());
        }

    };

    return self;

};

(function (ko) {

    if (!ko) {
        return;
    }

    // Polyfill for ko.unwrap
    if (ko.utils && typeof ko.unwrap !== 'function') {
        ko.unwrap = ko.utils.unwrapObservable;
    }

    koContextHoverElement = document.getElementById('ko-context-hover');
    koContextHoverListElement = document.getElementById('ko-context-hover-list');

    if (!koContextHoverElement || !koContextHoverListElement) {
        return;
    }

    ko.applyBindings(new KoContextVm(ko), koContextHoverElement);

})(window.ko || this.ko);