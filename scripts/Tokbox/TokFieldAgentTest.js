var tok;
(function (tok) {
    var TokFieldAgentTest = /** @class */ (function () {
        function TokFieldAgentTest() {
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
            this.stopSession = function () {
                if (_this.session) {
                    _this.session.disconnect();
                }
                $("#publisher").removeAttr("style");
                _this.toggleChat(true);
                setTimeout(function () {
                    if (confirm("Session ended, would you like to close this window?")) {
                        window.close();
                    }
                    ;
                }, 1500);
            };
            this.togglePublishing = function () {
                var paused = _this.publisher.stream.hasVideo;
                _this.publisher.publishAudio(!paused);
                _this.publisher.publishVideo(!paused);
                var btnClass = paused ? "btn-warning" : "btn-default";
                $("#PublishingButton").removeClass("btn-default, btn-warning").addClass(btnClass);
                $("#PublishingButton").find(".button-text").text(paused ? "UnPause" : "Pause");
            };
            this.toggleChat = function (show) {
                if (!$("#chatArea").is(":visible") || show) {
                    $("#chatArea").show();
                }
                else {
                    $("#chatArea").hide();
                }
            };
            this.toggleAudio = function () {
                var iconClass = _this.publisher.stream.hasAudio ? "fa-microphone-alt" : "fa-microphone-alt-slash";
                $("#AudioButton").find("i").removeClass("fa-microphone-alt, fa-microphone-alt-slash").addClass(iconClass);
                $("#AudioButton").find(".button-text").text(_this.publisher.stream.hasAudio ? "Unmute" : "Mute");
                _this.publisher.publishAudio(!_this.publisher.stream.hasAudio);
            };
            this.initializeSession = function () {
                _this.session = _this.OT.initSession(_this.apiKey.toString(), _this.sessionId);
                _this.session.on("changedProperty", _this.streamPropChanged);
                _this.publisher = _this.OT.initPublisher("publisher", {
                    facingMode: "environment",
                    showControls: "false",
                    fitMode: "contain",
                    insertMode: "replace",
                    width: "100%",
                    height: "100%"
                }, function (error) {
                    //moonshot.ErrorConsole.writeToConsole(`has Audio: ${this.publisher.stream.hasAudio.valueOf().toString()}`);
                    _this.handleError(error);
                });
                // Subscribe to a newly created stream
                _this.session.on("streamCreated", function (event) {
                    _this.session.subscribe(event.stream, "subscriber", {
                        insertMode: "append",
                        width: "100%",
                        height: "100%"
                    }, function (error) {
                        _this.handleError(error);
                    });
                });
                _this.session.on("streamDestroyed", function () {
                    _this.stopSession();
                });
                // Connect to the session
                _this.session.connect(_this.token, function (error) {
                    // If the connection is successful, initialize a publisher and publish to the session
                    if (!error) {
                        _this.session.publish(_this.publisher, _this.handleError);
                        $("#publisher").css("left", 0);
                        $("#Logo").hide();
                    }
                    else {
                        console.log("There was an error connecting to the session: ", error.code, error.message);
                    }
                });
                _this.session.on("signal:chat", _this.chatListener);
                //(event: OTSignalEvent) => {
                //    var msg = $('<p class="chat-wrapper">');
                //    msg.html(event.data)
                //        .addClass(event.from.connectionId === this.session.connection.connectionId ? 'mine' : 'theirs');
                //    $('#msgHistory').append(msg);
                //    msg.get(0).scrollIntoView();
                //});
                $("#txtClientChat").on("keydown", function (e) {
                    if (e.keyCode === 13) {
                        _this.send();
                    }
                });
            };
            this.streamPropChanged = function (e) {
                moonshot.ErrorConsole.writeToConsole("change event fired");
                if (e.changedProperty === "hasAudio" && e.stream.streamId === _this.publisher.stream.streamId) {
                    var hasAudio = e.newValue;
                    if (hasAudio) {
                        $("#muteButton").find("i")
                            .removeClass("fa-microphone-slash")
                            .addClass("fa-microphone");
                    }
                    else {
                        $("#muteButton").find("i")
                            .removeClass("fa-microphone")
                            .addClass("fa-microphone-slash");
                    }
                }
            };
            this.chatListener = function (event) {
                _this.toggleChat(true);
                var timeSent = moment().format("LTS");
                var $msgContainer = $('<div class="chat-wrapper" ></div>')
                    .addClass(event.from.connectionId === _this.session.connection.connectionId ? "mine" : "theirs")
                    .append('<i class="glyphicon glyphicon-user"></i>')
                    .append($('<p class="message">')
                    .append($('<span class="message-text">').text(event.data)))
                    .append($('<span class="time-sent"></span>').text(timeSent));
                $("#msgHistory").append($msgContainer);
                $msgContainer.get(0).scrollIntoView();
            };
            this.swapCamera = function () {
                $("body").append("<div>camera swap</div>");
                _this.publisher.cycleVideo()
                    .then(function () {
                    $("body").append("<div>swap success</div>");
                }, function (response) {
                    $("body").append("<div>error " + response + "</div>");
                })
                    .fail(function (error) {
                    $("body").append("<div>error " + error + "</div>");
                });
            };
            this.getDevices = function () {
                _this.OT.getDevices(function (error, devices) {
                    for (var _i = 0, devices_1 = devices; _i < devices_1.length; _i++) {
                        var d = devices_1[_i];
                        for (var _a = 0, d_1 = d; _a < d_1.length; _a++) {
                            var p = d_1[_a];
                            moonshot.ErrorConsole.writeToConsole(p);
                        }
                    }
                });
            };
            this.send = function () {
                _this.session.signal({
                    type: "chat",
                    data: $("#txtClientChat").val()
                }, function (error) {
                    if (!error) {
                        $("#txtClientChat").val("");
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
        return TokFieldAgentTest;
    }());
    tok.TokFieldAgentTest = TokFieldAgentTest;
    window.tokFieldAgent = new TokFieldAgentTest();
})(tok || (tok = {}));
//# sourceMappingURL=TokFieldAgentTest.js.map