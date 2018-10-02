var tok;
(function (tok) {
    var TokFieldAgentBasic = /** @class */ (function () {
        function TokFieldAgentBasic() {
            var _this = this;
            this.apiKey = 0;
            this.init = function () {
                _this.OT = window.OT;
                var tokServerHostname = $("#tokServerHostname").val();
                _this.urlManager = new tok.UrlManager(tokServerHostname);
                _this.apiKey = 46136892;
                _this.sessionId = _this.getParameterByName("sess");
                _this.token = _this.getParameterByName("tok");
                _this.initializeSession();
            };
            this.initializeSession = function () {
                _this.session = _this.OT.initSession(_this.apiKey.toString(), _this.sessionId);
                // Subscribe to a newly created stream
                _this.session.on('streamCreated', function (event) {
                    var subscriberOptions = {
                        insertMode: 'append',
                        width: '100%',
                        height: '100%'
                    };
                    _this.session.subscribe(event.stream, 'subscriber', subscriberOptions, _this.handleError);
                });
                _this.session.on('sessionDisconnected', function (event) {
                    console.log('You were disconnected from the session.', event.reason);
                });
                var publisherOptions = {
                    insertMode: 'append',
                    width: '100%',
                    height: '100%'
                };
                _this.publisher = _this.OT.initPublisher('publisher', publisherOptions, _this.handleError);
                // Connect to the session
                _this.session.connect(_this.token, function (error) {
                    if (error) {
                        _this.handleError(error);
                    }
                    else {
                        // If the connection is successful, initialize a publisher and publish to the session
                        _this.session.publish(_this.publisher, _this.handleError);
                    }
                });
            };
            this.getParameterByName = function (name, url) {
                if (!url) {
                    url = window.location.href;
                }
                name = name.replace(/[\[\]]/g, "\\$&");
                var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
                if (!results)
                    return null;
                if (!results[2])
                    return "";
                return decodeURIComponent(results[2].replace(/\+/g, " "));
            };
            // Handling all of our errors here by alerting them
            this.handleError = function (error) {
                if (error) {
                    moonshot.ErrorConsole.writeToConsole(error.message);
                }
            };
            this.init();
        }
        return TokFieldAgentBasic;
    }());
    tok.TokFieldAgentBasic = TokFieldAgentBasic;
    window.tokFieldAgent = new TokFieldAgentBasic();
})(tok || (tok = {}));
//# sourceMappingURL=TokFieldAgentBasic.js.map