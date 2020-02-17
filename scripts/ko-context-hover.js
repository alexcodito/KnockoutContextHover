var KoContextVm = function (ko) {

	if (!ko) {
		console.log("KnockoutContextHover: ko is not defined.");
		return undefined;
	}

    var self = this;
    var targetElement;
	var koContextHoverElement = document.getElementById('ko-context-hover');
	var koContextHoverListElement = document.getElementById('ko-context-hover-list');

	if (!koContextHoverElement || !koContextHoverListElement) {
		return undefined;
	}

    var truncate = function (str, max) {
        return str.length > max ? str.substr(0, max - 4) + " ..." : str;
    };

	var reapplyNodeBindings = function (element) {

		if (element) {

			var context = ko.contextFor(element);
			if (context) {
				ko.cleanNode(element);
				ko.applyBindings(context, element);
			}

		}

	};

	var parseKnockoutValue = function (item, depth) {

		var ret = undefined;
		depth = depth || 1;

		if (item) {

			ret = ko.unwrap(item);

			if (ret === null) {
				return "null";
			}

			if (ret === undefined) {
				return "undefined";
			}

			if (typeof ret === 'string' || ret instanceof String) {
				ret = '"' + truncate(ret, 200) + '"';
			}

			if (Array.isArray(ret)) {
				ret = "Array [" + ret.length + "]";
			}

			if (typeof ret === 'object') {

				//ret = "{ " + Object.entries(ret).join(", ") + " }";
				ret = Object.entries(ret).map(function (entry) {
					if (depth < 2) {
						return " " + entry[0] + ': ' + parseKnockoutValue(entry[1], depth++);
					} else {
						return " " + entry[0] + ': ' + (typeof entry[1] === 'string' ? truncate(entry[1], 200) : typeof entry[1]);
					}
				}).toString();

				//ret = "{ " + ret + " }";
				ret = "{ " + truncate(ret, 200) + " }";
			}

			if (typeof ret === "function") {
				ret = "function";
			}


		}

		return ret;

	};

	var refreshTargetElementKoData = function () {

        if (targetElement) {

            var classList = [];
            var newContext = self.settings.rootScope().action(targetElement);

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

	var handleKeyDown = function (e) {

		if (!document.getElementById("ko-context-hover")) {

			document.removeEventListener('keydown', handleKeyDown);

            if (targetElement && targetElement.classList) {
                targetElement.classList.remove("ko-context-hover-target-element");
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

    var selectTargetElement = function (newTargetElement) {

        if (newTargetElement && targetElement !== newTargetElement) {

            if (targetElement && targetElement.classList) {
                targetElement.classList.remove("ko-context-hover-target-element");
            }
            
            if (newTargetElement && newTargetElement.classList) {
                newTargetElement.classList.add("ko-context-hover-target-element");
            }

            targetElement = newTargetElement;

            refreshTargetElementKoData();
        }


    }

	var handleMouseMove = function (e) {

		var koContextHover = document.getElementById("ko-context-hover");

		if (!koContextHover) {

			document.removeEventListener('mousemove', handleMouseMove);

            if (targetElement && targetElement.classList) {
                targetElement.classList.remove("ko-context-hover-target-element");
			}

			return;
		}

		// Ensure that the mouse isn't hovering the KO Context Hover panel itself to avoid recursion.
		var checkTargetSelf = function (target) {

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

		var tempX = e.clientX;
		var tempY = e.clientY;

		if (!self.settings.koContextHoverFollowCursorHalted()) {
			
			if (tempX > window.document.body.clientWidth / 2) {
				// Invert the direction of the panel's location offset when the mouse pointer is on the right part of the screen
				koContextHoverElement.style.left = tempX - koContextHoverElement.clientWidth - 5 + "px";
			} else {
				koContextHoverElement.style.left = tempX + 5 + "px";
			}

			if (tempY > window.document.body.clientHeight / 2) {
				// Invert the direction of the panel's location offset when the mouse pointer is on the bottom part of the screen
				koContextHoverElement.style.top = tempY + document.documentElement.scrollTop - koContextHoverElement.clientHeight - 15 + "px";
			} else {
				koContextHoverElement.style.top = tempY + document.documentElement.scrollTop + 15 + "px";
			}
		}

		if (self.settings.koContextHoverHalted()) {
			return;
		}

		var newTargetElement = document.elementFromPoint(tempX, tempY);

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

            var newTargetElement;

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

            var newTargetElement;

            if (traverseChild === true && targetElement.firstChild !== null) {
                // Scope to first child node
                newTargetElement = targetElement.firstChild;
            } else if (traverseChild === false) {                
                if (targetElement.nextSibling !== null) {
                    // Scope to next node
                    newTargetElement = targetElement.nextSibling;
                } else {
                    // Attempt to scope to the parent and then the next node
                    newTargetElement = targetElement.parentNode;
                    if (newTargetElement && newTargetElement.nextSibling) {
                        newTargetElement = targetElement.nextSibling;
                    }
                }
            }

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

		var uData = ko.unwrap(data);

		return uData !== undefined
			&& uData !== null
			&& ((typeof uData === "object" && !Array.isArray(uData)) || (Array.isArray(uData) && uData.length > 0))
			&& uData !== {}
			&& uData !== "";

	};

	self.checkDataIsDefined = function (data) {

		var uData = ko.unwrap(data);

		return uData !== undefined && uData !== null;

	};

	self.checkDataIsFunction = function (data) {

		var uData = ko.unwrap(data);

		return typeof uData === "function";

	};

	self.checkDataIsText = function (data) {

		var uData = ko.unwrap(data);

		return typeof uData === "string";

	};

	self.checkDataIsNumber = function (data) {

		var uData = ko.unwrap(data);

		return typeof uData === "number";

	};

	self.checkDataIsBoolean = function (data) {

		var uData = ko.unwrap(data);

		return typeof uData === "boolean";

	};

	self.executeFunction = function (data) {

		var uData = ko.unwrap(data);

		if (typeof uData === "function") {
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

    if (window.ko && !ko.bindingHandlers.kchLog) {
        ko.bindingHandlers.kchLog = {
            init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var logName = element.name || element.id;
                console.log((logName || 'Log') + ':', ko.unwrap(valueAccessor()));
            }
        };

        ko.virtualElements.allowedBindings.kchLog = true;
    }

	var koContextVm = new KoContextVm(ko);
	var koContextHoverElement = document.getElementById("ko-context-hover");
	var koContextHoverListElement = document.getElementById("ko-context-hover-list");

	if (!koContextHoverElement || !koContextHoverListElement) {
		return;
	}

	ko.applyBindings(koContextVm, koContextHoverElement);

})(window.ko || this.ko || ko);