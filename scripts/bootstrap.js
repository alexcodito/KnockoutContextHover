/**
 * Searches and returns knockout instance
 * 
 * @returns {object|undefined} knockout instance if found
 */
const bootstrapKnockoutApi = () => {
    /**
     * Print to console a disclaimer that
     * no knockout instance was found on a page
     */
    function knockoutNotFoundDisclaimer() {
        // knockout not found in any way
        const label = "KnockoutContextHover: KnockoutJS not found"
        console.group(label)
        console.info(
            "Knockoutjs was not found at global context (window.ko) nor through require.js (require.defined('ko')/require.defined('knockout')).",
            "If you are using ECMA module imports, make sure knockout is available at global context with:"
        )
        console.log(`
            import ko from "knockout
            ...
            window.ko = ko;
        `)
        console.groupEnd(label)
    }

    let ko = window.ko
    if (ko) return ko

    // requirejs snippet from
    // https://github.com/timstuyckens/chromeextensions-knockoutjs/blob/master/pages/js/devtools.js
    // try fetching ko with requirejs
    if (typeof window.require === 'function') {
        var isDefinedAvailable = typeof window.require.defined === 'function';
        try {
            if ((isDefinedAvailable && require.defined('ko')) || !isDefinedAvailable) {
                ko = require('ko');
            }
        } catch (e) { /*ignore */ }
        if (!ko) {
            try {
                if ((isDefinedAvailable && require.defined('knockout')) || !isDefinedAvailable) {
                    ko = require('knockout');
                }
            } catch (e) { /*ignore */ }
        }
    }
    if (ko) return ko

    knockoutNotFoundDisclaimer()
}

/**
 * load onse then return loaded instance or undefined (const ko),
 * which is referred to in every dependant function
 */
export const ko = bootstrapKnockoutApi()