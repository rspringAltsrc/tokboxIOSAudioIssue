namespace moonshot {
    export abstract class OverrideGlobalErrors {

        public static override = (window: Window) => {
            // Get a reference to the original error handler, if it exists, so we
            // don't overwrite any error-handling functionality that might be added
            // by a 3rd-party script.
            var originalErrorHandler = window.onerror;
            // If there is no existing global error handler, let's define a mock one
            // so that our custom error handler code can be handled uniformly.
            if (!originalErrorHandler) {
                originalErrorHandler = () => true;
            }
            // Define our custom error handler that will pipe errors into the core
            // $exceptionHandler service (where they may be further processed).
            // --
            // NOTE: Only message, fileName, and lineNumber are standardized.
            // columnNumber and error are not standardized values and will not be
            // present in all browsers. That said, they appear to work in all of the
            // browsers that "matter".
            window.onerror = function(message: string, fileName: string, lineNumber: number, columnNumber: number, error: ExtendedError) {
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
                } catch (applyError) {
                    OverrideGlobalErrors.exceptionHandler(applyError);
                }
                return null;
            };
        }
        static exceptionHandler(error: ExtendedError) {
            const encodedError = $('<div/>').text(error.message).html();
            ErrorConsole.writeToConsole(encodedError);
        }
    }
    export class ExtendedError extends Error {
        __proto__: Error;
        fileName: string;
        lineNumber: number;
        columnNumber: number;

        constructor(message?: string | Event) {
            //const trueProto: Error = new.target.prototype;
            super(message as string);

            // Alternatively use Object.setPrototypeOf if you have an ES6 environment.
            //this.__proto__ = trueProto;
        }
    }

    export abstract class ErrorConsole {
        static ensureConsole = () => {
            if ($('#error-console').length < 1) {
                $('body').append('<pre id="error-console">');
            }
        }
        static writeToConsole = (message: string) => {
            if (!ErrorConsole.isDevToolsOpen()) {
                ErrorConsole.ensureConsole();
                const existingContent = $('#error-console').html();
                const combinedContent = existingContent + '\n' + $('<div/>').text(message).html();
                $('#error-console').html(combinedContent);

            } else {
                console.error(message);
            }
        }

        static isDevToolsOpen = (): boolean => {
            let devtools: IDevtools = {
                opened: false
            };

            devtools.toString = function () {
                this.opened = true;
                return 'devtools';
            }
            console.log('Testing devtools is open', devtools);
            return devtools.opened;
        }
    }
    export interface IDevtools {
        opened: boolean
    }
}

moonshot.OverrideGlobalErrors.override(this);