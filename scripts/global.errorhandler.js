var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var moonshot;
(function (moonshot) {
    var OverrideGlobalErrors = /** @class */ (function () {
        function OverrideGlobalErrors() {
        }
        OverrideGlobalErrors.exceptionHandler = function (error) {
            var encodedError = $('<div/>').text(error.message).html();
            ErrorConsole.writeToConsole(encodedError);
        };
        OverrideGlobalErrors.override = function (window) {
            // Get a reference to the original error handler, if it exists, so we
            // don't overwrite any error-handling functionality that might be added
            // by a 3rd-party script.
            var originalErrorHandler = window.onerror;
            // If there is no existing global error handler, let's define a mock one
            // so that our custom error handler code can be handled uniformly.
            if (!originalErrorHandler) {
                originalErrorHandler = function () { return true; };
            }
            // Define our custom error handler that will pipe errors into the core
            // $exceptionHandler service (where they may be further processed).
            // --
            // NOTE: Only message, fileName, and lineNumber are standardized.
            // columnNumber and error are not standardized values and will not be
            // present in all browsers. That said, they appear to work in all of the
            // browsers that "matter".
            window.onerror = function (message, fileName, lineNumber, columnNumber, error) {
                // If this browser does not pass-in the original error object, let's
                // create a new error object based on what we know.
                if (!error) {
                    error = new ExtendedError(message);
                    // NOTE: These values are not standard, according to MDN.
                    error.fileName = fileName;
                    error.lineNumber = lineNumber;
                    error.columnNumber = columnNumber || 0;
                }
                // Pass the error off to our core error handler.
                OverrideGlobalErrors.exceptionHandler(error);
                // Pass of the error to the original error handler.
                try {
                    return originalErrorHandler.apply(window, arguments);
                }
                catch (applyError) {
                    OverrideGlobalErrors.exceptionHandler(applyError);
                }
                return null;
            };
        };
        return OverrideGlobalErrors;
    }());
    moonshot.OverrideGlobalErrors = OverrideGlobalErrors;
    var ExtendedError = /** @class */ (function (_super) {
        __extends(ExtendedError, _super);
        function ExtendedError(message) {
            //const trueProto: Error = new.target.prototype;
            return _super.call(this, message) || this;
            // Alternatively use Object.setPrototypeOf if you have an ES6 environment.
            //this.__proto__ = trueProto;
        }
        return ExtendedError;
    }(Error));
    moonshot.ExtendedError = ExtendedError;
    var ErrorConsole = /** @class */ (function () {
        function ErrorConsole() {
        }
        ErrorConsole.ensureConsole = function () {
            if ($('#error-console').length < 1) {
                $('body').append('<pre id="error-console">');
            }
        };
        ErrorConsole.writeToConsole = function (message) {
            if (!ErrorConsole.isDevToolsOpen()) {
                ErrorConsole.ensureConsole();
                var existingContent = $('#error-console').html();
                var combinedContent = existingContent + '\n' + $('<div/>').text(message).html();
                $('#error-console').html(combinedContent);
            }
            else {
                console.error(message);
            }
        };
        ErrorConsole.isDevToolsOpen = function () {
            var devtools = {
                opened: false
            };
            devtools.toString = function () {
                this.opened = true;
                return 'devtools';
            };
            console.log('Testing devtools is open', devtools);
            return devtools.opened;
        };
        return ErrorConsole;
    }());
    moonshot.ErrorConsole = ErrorConsole;
})(moonshot || (moonshot = {}));
moonshot.OverrideGlobalErrors.override(this);
//# sourceMappingURL=global.errorhandler.js.map