var KoContextVm = function() {

    var self = this;
    var targetElement;
    var koContextHoverHalted = false;
    var koContextHoverFollowCursorOn = true;

    var koContextHoverElement = $("#ko-context-hover").get(0);
    var koContextHoverListElement = $("#ko-context-hover-list").get(0);

    if (!koContextHoverElement || !koContextHoverListElement) {
        return undefined;
    }

    var parseKnockoutValue = function (item, depth) {

        var ret = undefined;
        depth = depth || 1;

        if (item) {

            if (ko.isObservable) {
                ret = ko.unwrap(item);
            }

            if (ret === null) {
                return "null";
            }

            if (ret === undefined) {
                return "undefined";
            }

            if (typeof ret === 'string' || ret instanceof String) {
                ret = '"' + ret + '"';
            }

            if ($.isArray(ret)) {
                ret = "Array [" + ret.length + "]";
            }

            if (typeof ret === 'object') {

                //ret = "{ " + Object.entries(ret).join(", ") + " }";
                ret = Object.entries(ret).map(function (entry) {
                    if (!depth || depth < 2) {
                        return " " + entry[0] + ': ' + parseKnockoutValue(entry[1], depth++);
                    } else {
                        return " " + entry[0] + ': ' + (typeof entry[1]);
                    }
                }).toString();

                //ret = "{ " + ret + " }";
                ret = "{ " + (ret.length > 100 ? ret.substr(0, 100) + " ..." : ret) + " }";
            }

            if ($.isFunction(ret)) {
                ret = "function";
            }


        }

        return ret;

    };

    var handleKeyUp = function (e) {

        if (!$("#ko-context-hover").length) {

            $(this).off('keyup', handleKeyUp);

            if (targetElement) {
                targetElement.classList.remove("ko-context-hover-target-element");
            }

            return;
        }

        if (e.originalEvent.keyCode === 16) {
            koContextHoverFollowCursorOn = !koContextHoverFollowCursorOn;
        }

        if (e.originalEvent.keyCode === 17) {
            koContextHoverHalted = !koContextHoverHalted;
        }

    };

    var handleMouseMove = function (e) {

        if (!$("#ko-context-hover").length) {

            $(this).off('mousemove', handleMouseMove);

            if (targetElement) {
                targetElement.classList.remove("ko-context-hover-target-element");
            }

            return;
        }

        var tempX = e.clientX;
        var tempY = e.clientY;

        if (koContextHoverFollowCursorOn === true) {
            koContextHoverElement.style.left = tempX + 5 + "px";
            koContextHoverElement.style.top = tempY + 15 + "px";
        }

        if (koContextHoverHalted) {
            return;
        }

        var newTargetElement = document.elementFromPoint(tempX, tempY);

        if (newTargetElement && targetElement !== newTargetElement) {

            if (targetElement) {
                targetElement.classList.remove("ko-context-hover-target-element");
            }

            newTargetElement.classList.add("ko-context-hover-target-element");

            targetElement = newTargetElement;

            if (targetElement !== undefined && targetElement !== null) {

                var newContext = ko.dataFor(targetElement);

                if (newContext === undefined || newContext === null) {
                    self.targetElementKoData({});
                } else {
                    self.targetElementKoData(newContext);
                }

            } else {
                self.targetElementKoData({});
            }

        }
    };

    $(document).on("keyup", handleKeyUp);
    $(document).on("mousemove", handleMouseMove);

    self.targetElementKoData = ko.observable({});

    self.parseKnockoutValue = parseKnockoutValue;

    self.consoleLogElementContext = function (hoverContext, data) {

        console.log(ko.unwrap(ko.unwrap(hoverContext)[data]));

    };

    self.toggleNode = function (hoverContext, property, childrenNodes) {
        if (childrenNodes()) {
            childrenNodes(undefined);
        } else {
            childrenNodes(ko.unwrap(ko.unwrap(hoverContext)[property]));
        }
    };

    self.checkDataInvokable = function(data) {

        var uData = ko.unwrap(data);

        return uData !== undefined && uData !== null && Array.isArray(uData) || typeof uData === "object";

    };

    self.checkDataIsFunction = function(data) {

        var uData = ko.unwrap(data);

        return uData !== undefined && uData !== null && typeof uData === "function";

    };

    self.executeFunction = function (data) {

        var uData = ko.unwrap(data);

        if(uData && typeof uData === "function") {
            console.log(uData());  
        }

    };

    return self;

};

var koContextVm = new KoContextVm();

(function ($, ko) {
    
    var koContextHoverElement = $("#ko-context-hover").get(0);
    var koContextHoverListElement = $("#ko-context-hover-list").get(0);
    
    if (!koContextHoverElement || !koContextHoverListElement) {
        return;
    }

    ko.applyBindings(koContextVm, koContextHoverElement);

})(window.$, window.ko);