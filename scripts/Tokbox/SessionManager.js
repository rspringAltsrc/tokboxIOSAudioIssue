var tok;
(function (tok) {
    var OTConnectionStatus;
    (function (OTConnectionStatus) {
        OTConnectionStatus[OTConnectionStatus["Disconnected"] = 0] = "Disconnected";
        OTConnectionStatus[OTConnectionStatus["Connected"] = 1] = "Connected";
        OTConnectionStatus[OTConnectionStatus["Reconnecting"] = 2] = "Reconnecting";
    })(OTConnectionStatus = tok.OTConnectionStatus || (tok.OTConnectionStatus = {}));
})(tok || (tok = {}));
(function (tok) {
    var SessionManager = /** @class */ (function () {
        function SessionManager(OT, UrlManager) {
            var _this = this;
            this.OT = OT;
            this.UrlManager = UrlManager;
            this.ApiKey = 0;
            this.defaultVolume = 50;
            this.browerLink = '';
            this.iOSLink = '';
            this.androidLink = '';
            this.StartSession = function () {
                if (_this.Session) {
                    _this.StopSession();
                    //$("#videos").append("<div id='publisher'></div>");
                }
                $.get(_this.UrlManager.GetSession(), function (res) {
                    //var res = JSON.parse(ret);
                    _this.ApiKey = res.apiKey;
                    _this.CurrentSessionId = res.sessionId;
                    _this.moderatorToken = res.moderatorToken;
                    _this.fieldUserToken = res.fieldUserToken;
                    _this.setTokLinks();
                    $("#connection-info").show();
                    $('#btnSendLinkEmail').prop('disabled', false);
                    _this.InitializeTokSession();
                    $('#sessionLinks').hide();
                    $('#videoControls').show();
                    $('#chatArea').show();
                    _this.resetSubcriberDiv();
                });
            };
            this.VideoSessionStarted = function (claimId, sessionId) {
                return $.post(_this.UrlManager.VideoSessionStarted() + "/" + claimId + "/" + sessionId);
            };
            this.VideoSessionEnded = function (claimId, sessionId) {
                return $.ajax({
                    url: _this.UrlManager.VideoSessionEnded() + "/" + claimId + "/" + sessionId,
                    method: 'put'
                });
            };
            this.copyInputToClipBoard = function (e) {
                $('#sessionLinks').find('button').removeClass('btn-success');
                var inputId = $(e.target).attr('id').replace('copy', '#tok');
                $(inputId).select();
                if (_this.copyToClipBoard()) {
                    $(e.target).addClass('btn-success');
                }
            };
            this.copyToClipBoard = function () {
                return document.execCommand('copy');
            };
            this.bindChatUI = function () {
                $('#chatSend').on('click', _this.Send);
                $('#txtChat').on('keydown', _this.chatKeydown);
                $('#chatSend, #txtChat').removeAttr('disabled').removeClass('disabled');
                _this.Session.on('signal:chat', _this.chatListener);
            };
            this.unbindChatUI = function () {
                $('#chatSend').off('click', _this.Send);
                $('#txtChat').off('keydown', _this.chatKeydown);
                $('#chatSend, #txtChat').attr('disabled', 'disabled').addClass('disabled');
                _this.Session.off('signal:chat', _this.chatListener);
            };
            this.unbindUI = function () {
                $(window).off('resize', _this.bindResizingWindow);
                $('#copyiOSLink').off('click', _this.copyInputToClipBoard);
                $('#copyAndroidLink').off('click', _this.copyInputToClipBoard);
                $('#copyBrowserLink').off('click', _this.copyInputToClipBoard);
                _this.Session.off('streamCreated', _this.streamCreated);
                _this.Session.off('sessionReconnecting', _this.sessionReconnecting);
                _this.Session.off('sessionReconnected', _this.sessionReconnected);
                _this.Session.off('connectionCreated', _this.connectionCreated);
                _this.Session.off('connectionDestroyed', _this.connectionDestroyed);
                _this.Session.off('sessionDisconnected', _this.sessionDisconnected);
                _this.Session.off("streamDestroyed", _this.streamDestroyed);
                _this.Session.off('streamPropertyChanged', _this.streamPropChanged);
            };
            this.bindUI = function () {
                $(window).resize(_.debounce(_this.bindResizingWindow, 500));
                $('#copyiOSLink').on('click', _this.copyInputToClipBoard);
                $('#copyAndroidLink').on('click', _this.copyInputToClipBoard);
                $('#copyBrowserLink').on('click', _this.copyInputToClipBoard);
                _this.Session.on('streamCreated', _this.streamCreated);
                _this.Session.on('sessionReconnecting', _this.sessionReconnecting);
                _this.Session.on('sessionReconnected', _this.sessionReconnected);
                _this.Session.on('connectionCreated', _this.connectionCreated);
                _this.Session.on('connectionDestroyed', _this.connectionDestroyed);
                _this.Session.on('sessionDisconnected', _this.sessionDisconnected);
                _this.Session.on("streamDestroyed", _this.streamDestroyed);
                _this.Session.on('streamPropertyChanged', _this.streamPropChanged);
            };
            this.InitializeTokSession = function () {
                //if (!this.OT.checkSystemRequirements()) {
                //    alert('System Not Supported');
                //    return;
                //}
                _this.Session = _this.OT.initSession(_this.ApiKey.toString(), _this.CurrentSessionId);
                //this.enableButtons(false);
                _this.bindUI();
                // Connect to the session
                _this.Session.connect(_this.moderatorToken, _this.connectSession);
            };
            this.connectSession = function (error) {
                // If the connection is successful, initialize a publisher and publish to the session
                if (!error) {
                    var pubOptions = {
                        publishAudio: true,
                        videoSource: null,
                        publishVideo: false,
                        style: {
                            buttonDisplayMode: 'off'
                        }
                    };
                    _this.Publisher = _this.OT.initPublisher('publisher', pubOptions, _this.GenericErrorHandler);
                    _this.Session.publish(_this.Publisher, _this.GenericErrorHandler);
                }
                else {
                    alert('There was an error connecting to the session: ' + error.code + ' - ' + error.message);
                }
            };
            this.streamPropChanged = function (e) {
                if (e.changedProperty === 'hasAudio' && e.stream.streamId === _this.Publisher.stream.streamId) {
                    var hasAudio = e.newValue;
                    if (hasAudio) {
                        $('#muteButton').find('i')
                            .removeClass('fa-microphone-slash')
                            .addClass('fa-microphone');
                    }
                    else {
                        $('#muteButton').find('i')
                            .removeClass('fa-microphone')
                            .addClass('fa-microphone-slash');
                    }
                }
            };
            this.Send = function () {
                _this.Session.signal({ type: 'chat', data: $('#txtChat').val() }, function (error) {
                    if (!error) {
                        $("#txtChat").val('');
                    }
                });
            };
            this.StopSession = function () {
                if (_this.Session) {
                    if (_this.Session.capabilities.forceUnpublish == 1) {
                        _this.Session.forceUnpublish(_this.Publisher.stream, _this.GenericErrorHandler);
                    }
                    //if (this.Session.capabilities.forceDisconnect == 1) {
                    //    this.Session.forceDisconnect(this.Session.connection, this.GenericErrorHandler);
                    //}
                    //window.setTimeout(() => {
                    //    this.Session.disconnect()
                    //}, 500);
                    _this.OldSessionId = _this.CurrentSessionId;
                    _this.CurrentSessionId = null;
                    _this.unbindUI();
                    _this.unbindChatUI();
                    _this.Session = null;
                    _this.setTokLinks();
                    _this.VideoSessionEnded($('#hidClaimId').val(), _this.OldSessionId);
                    $("#connection-info").hide();
                    $('#btnSendLinkEmail').prop('disabled', true);
                    $('#sessionLinks').hide();
                    $('#videoControls').hide();
                    _this.resetSubcriberDiv();
                }
            };
            this.setTokLinks = function () {
                if (_this.CurrentSessionId) {
                    _this.browerLink = window.location.protocol + "//" + window.location.host + "/VideoConnect.aspx?sess=" + _this.CurrentSessionId + "&tok=" + _this.fieldUserToken;
                    _this.iOSLink = "videoverify://?sess=" + _this.CurrentSessionId + "&token=" + _this.fieldUserToken;
                    _this.androidLink = window.location.protocol + "//claimsoffice.com/videoverify?sess=" + _this.CurrentSessionId + "&tok=" + _this.fieldUserToken;
                }
                $("#tokiOSLink").val(_this.iOSLink);
                $("#tokAndroidLink").val(_this.androidLink);
                $("#tokBrowserLink").val(_this.browerLink);
            };
            this.GetSessionId = function () {
                return _this.CurrentSessionId;
            };
            this.GetOldSessionId = function () {
                return _this.OldSessionId;
            };
            this.GetSubscriber = function () {
                return _this.Subscriber;
            };
            this.GetPublisher = function () {
                return _this.Publisher;
            };
            this.setConnectionStatus = function (connectionState, event) {
                switch (connectionState) {
                    case tok.OTConnectionStatus.Connected:
                        $('#connection-info .loading-dots').hide();
                        if (_this.isConnectionSelf(event)) {
                            $('#connectionStatus').html('<strong class="text-warning">Awaiting field agent</strong>');
                        }
                        else {
                            _this.VideoSessionStarted($('#hidClaimId').val(), _this.CurrentSessionId);
                            $('#connectionStatus').html('<strong class="text-success">Connected</strong>');
                            $('#waitingText').hide();
                            if (event.type == 'connectionCreated') {
                                _this.enableButtons(true);
                            }
                        }
                        break;
                    case tok.OTConnectionStatus.Reconnecting:
                        if (!_this.isConnectionSelf(event)) {
                            _this.enableButtons(false);
                        }
                        $('#connection-info .loading-dots').show();
                        $('#connectionStatus').html('<strong class="text-warning">Reconnecting...</strong>');
                        break;
                    case tok.OTConnectionStatus.Disconnected:
                    default:
                        _this.enableButtons(false);
                        $('#subscriber').parents().removeClass('full-height');
                        $('#connection-info .loading-dots').hide();
                        $('#connectionStatus').html('<strong class="text-danger">Disconnected</strong> <em>(' + event.reason + ')</em>');
                        break;
                }
            };
            this.enableButtons = function (enable) {
                if (enable) {
                    _this.bindChatUI();
                    $('#snapshotButton, #recordButton, #muteButton, #volumeOff').removeClass('disabled').removeAttr('disabled');
                }
                else {
                    _this.unbindChatUI();
                    $('#snapshotButton, #recordButton, #muteButton, #volumeOff').addClass('disabled').attr('disabled', 'disabled');
                }
            };
            this.bindResizingWindow = function () {
                var $target = $('#videos');
                $target.height($('body').height() - $target.offset().top);
            };
            this.streamCreated = function (event) {
                _this.setConnectionStatus(tok.OTConnectionStatus.Connected, event);
                _this.Subscriber = _this.Session.subscribe(event.stream, 'subscriber', {
                    fitMode: "contain",
                    insertMode: 'replace',
                    width: '100%',
                    height: '100%',
                    audioVolume: _this.defaultVolume,
                    style: { buttonDisplayMode: 'on' },
                }, _this.GenericErrorHandler);
                window.setTimeout(function () { _this.bindResizingWindow(); }, 500);
            };
            this.sessionReconnecting = function (event) {
                _this.setConnectionStatus(tok.OTConnectionStatus.Reconnecting, event);
            };
            this.sessionReconnected = function (event) {
                _this.setConnectionStatus(tok.OTConnectionStatus.Connected, event);
            };
            this.connectionCreated = function (event) {
                _this.setConnectionStatus(tok.OTConnectionStatus.Connected, event);
            };
            this.connectionDestroyed = function (event) {
                _this.setConnectionStatus(tok.OTConnectionStatus.Disconnected, event);
                _this.resetSubcriberDiv();
            };
            this.sessionDisconnected = function (event) {
                _this.setConnectionStatus(tok.OTConnectionStatus.Disconnected, event);
                _this.resetSubcriberDiv();
            };
            this.resetSubcriberDiv = function () {
                //BUG: OpenTok is removing the publisher div, which is causing issues.  So working around.
                //They say it shouldn't be removing it.  Come back to address this later.
                window.setTimeout(function () {
                    if (!$('#videos').find('#publisher').length) {
                        $('#videos').append('<div id="publisher">');
                    }
                }, 800);
                window.setTimeout(function () {
                    if (!$('#videos').find('#subscriber').length) {
                        $('#videos').append('<div id="subscriber">');
                    }
                }, 800);
                $('#videos').height('');
            };
            this.streamDestroyed = function (event) {
                _this.setConnectionStatus(tok.OTConnectionStatus.Disconnected, event);
                _this.resetSubcriberDiv();
            };
            this.chatListener = function (event) {
                var timeSent = moment().format('LTS');
                var $msgContainer = $('<div class="chat-wrapper" ></div>')
                    .addClass(event.from.connectionId === _this.Session.connection.connectionId ? 'mine' : 'theirs')
                    .append('<i class="glyphicon glyphicon-user"></i>')
                    .append($('<p class="message">')
                    .append($('<span class="message-text">').text(event.data)))
                    .append($('<span class="time-sent"></span>').text(timeSent));
                $('#msgHistory').append($msgContainer);
                $msgContainer.get(0).scrollIntoView();
            };
            this.chatKeydown = function (e) {
                if (e.keyCode === 13) {
                    _this.Send();
                }
            };
            this.GenericErrorHandler = function (error) {
                var re = new RegExp('Could not publish in a reasonable amount of time', 'ig');
                if (error) {
                    if (error.code === 1500 && re.test(error.message)) {
                        return;
                    }
                    alert('There was an error with the session: ' + error.code + ' - ' + error.message);
                }
            };
        }
        SessionManager.prototype.isConnectionSelf = function (event) {
            var connectionId = event.connection
                ? event.connection.connectionId
                : event.stream
                    ? event.stream.connection.connectionId
                    : event.connectionId;
            return this.Session.connection.id === connectionId;
        };
        return SessionManager;
    }());
    tok.SessionManager = SessionManager;
})(tok || (tok = {}));
//# sourceMappingURL=SessionManager.js.map