
interface JQuery {
    appendChild(content: any): JQuery
}

interface TokSession {
    sessionId: string;
    moderatorToken: string;
    fieldUserToken: string;
    apiKey: number;
}

namespace tok {
    export enum OTConnectionStatus {
        Disconnected,
        Connected,
        Reconnecting
    }
}

namespace tok {

    export class SessionManager {

        private Session: OTSession;
        private Subscriber: OTSubscriber;
        private Publisher: OTPublisher;
        private OldSessionId: string;
        private CurrentSessionId: string;
        public ApiKey = 0;
        private moderatorToken: string;
        private fieldUserToken: string;
        public readonly defaultVolume = 50;
        public browerLink = '';
        public iOSLink = '';
        public androidLink = '';

        constructor(
            public OT: OT,
            public UrlManager: UrlManager
        ) {
        }

        public StartSession = () => {
            if (this.Session) {
                this.StopSession();
                //$("#videos").append("<div id='publisher'></div>");
            }

            $.get(this.UrlManager.GetSession(), (res: TokSession) => {
                //var res = JSON.parse(ret);
                this.ApiKey = res.apiKey;
                this.CurrentSessionId = res.sessionId;
                this.moderatorToken = res.moderatorToken;
                this.fieldUserToken = res.fieldUserToken;


                this.setTokLinks();

                $("#connection-info").show();
                $('#btnSendLinkEmail').prop('disabled', false);

                this.InitializeTokSession();

                
                $('#sessionLinks').hide();

                $('#videoControls').show();
                $('#chatArea').show();
                this.resetSubcriberDiv();
            });
        };

        public VideoSessionStarted = (claimId: number, sessionId: string): JQueryPromise<void> => {
            return $.post(`${this.UrlManager.VideoSessionStarted()}/${claimId}/${sessionId}`);
        }
        public VideoSessionEnded = (claimId: number, sessionId: string): JQueryPromise<void> => {
            return $.ajax({
                url: `${this.UrlManager.VideoSessionEnded()}/${claimId}/${sessionId}`,
                        method: 'put'
                    }
                );
        }

        public copyInputToClipBoard = (e: JQueryEventObject) => {
            $('#sessionLinks').find('button').removeClass('btn-success');
            const inputId = $(e.target).attr('id').replace('copy', '#tok');
            $(inputId).select();

            if (this.copyToClipBoard()) {
                $(e.target).addClass('btn-success'); 
            }
        }

        public copyToClipBoard = (): boolean => {
            return document.execCommand('copy');
        }

        public bindChatUI = () => {
            $('#chatSend').on('click', this.Send);
            $('#txtChat').on('keydown', this.chatKeydown);
            $('#chatSend, #txtChat').removeAttr('disabled').removeClass('disabled');
            this.Session.on('signal:chat', this.chatListener);
        }

        public unbindChatUI = () => {
            $('#chatSend').off('click', this.Send);
            $('#txtChat').off('keydown', this.chatKeydown);
            $('#chatSend, #txtChat').attr('disabled', 'disabled').addClass('disabled');
            this.Session.off('signal:chat', this.chatListener);
        }

        public unbindUI = () => {
            $(window).off('resize', this.bindResizingWindow);
            $('#copyiOSLink').off('click', this.copyInputToClipBoard);
            $('#copyAndroidLink').off('click', this.copyInputToClipBoard);
            $('#copyBrowserLink').off('click', this.copyInputToClipBoard);
            this.Session.off('streamCreated', this.streamCreated);
            this.Session.off('sessionReconnecting', this.sessionReconnecting);
            this.Session.off('sessionReconnected', this.sessionReconnected);
            this.Session.off('connectionCreated', this.connectionCreated);
            this.Session.off('connectionDestroyed', this.connectionDestroyed);
            this.Session.off('sessionDisconnected', this.sessionDisconnected);
            this.Session.off("streamDestroyed", this.streamDestroyed);
            this.Session.off('streamPropertyChanged', this.streamPropChanged);
        }

        public bindUI = () => {
            $(window).resize(_.debounce(this.bindResizingWindow, 500));
            $('#copyiOSLink').on('click', this.copyInputToClipBoard);
            $('#copyAndroidLink').on('click', this.copyInputToClipBoard);
            $('#copyBrowserLink').on('click', this.copyInputToClipBoard);
            this.Session.on('streamCreated', this.streamCreated);
            this.Session.on('sessionReconnecting', this.sessionReconnecting);
            this.Session.on('sessionReconnected', this.sessionReconnected);
            this.Session.on('connectionCreated', this.connectionCreated);
            this.Session.on('connectionDestroyed', this.connectionDestroyed);
            this.Session.on('sessionDisconnected', this.sessionDisconnected);
            this.Session.on("streamDestroyed", this.streamDestroyed);
            this.Session.on('streamPropertyChanged', this.streamPropChanged);
        }

        public InitializeTokSession = () => {

            //if (!this.OT.checkSystemRequirements()) {
            //    alert('System Not Supported');
            //    return;
            //}
            this.Session = this.OT.initSession(this.ApiKey.toString(), this.CurrentSessionId);
            //this.enableButtons(false);
            this.bindUI();
            // Connect to the session
            this.Session.connect(this.moderatorToken, this.connectSession);
        };

        private connectSession = (error: any) => {
            // If the connection is successful, initialize a publisher and publish to the session
            if (!error) {
                var pubOptions = {
                    publishAudio: true,
                    videoSource: <any>null,
                    publishVideo: false,
                    style: {
                        buttonDisplayMode: 'off'
                    }
                };

                this.Publisher = this.OT.initPublisher('publisher', pubOptions, this.GenericErrorHandler);

                this.Session.publish(this.Publisher, this.GenericErrorHandler);
            } else {
                alert('There was an error connecting to the session: ' + error.code + ' - ' + error.message);
            }
        }

        private streamPropChanged = (e: StreamPropertyChangedEvent) => {

            if (e.changedProperty === 'hasAudio' && e.stream.streamId === this.Publisher.stream.streamId) {
                let hasAudio = e.newValue;
                if (hasAudio) {
                    $('#muteButton').find('i')
                        .removeClass('fa-microphone-slash')
                        .addClass('fa-microphone');
                } else {
                    $('#muteButton').find('i')
                        .removeClass('fa-microphone')
                        .addClass('fa-microphone-slash');
                }
            }

        };

        public Send = () => {
            this.Session.signal({ type: 'chat', data: $('#txtChat').val() }, (error: OTError) => {
                if (!error) {
                    $("#txtChat").val('');
                }
            });
        };

        public StopSession = () => {
            if (this.Session) {

                if (this.Session.capabilities.forceUnpublish == 1) {
                    this.Session.forceUnpublish(this.Publisher.stream, this.GenericErrorHandler);
                }
                //if (this.Session.capabilities.forceDisconnect == 1) {
                //    this.Session.forceDisconnect(this.Session.connection, this.GenericErrorHandler);

                //}
                //window.setTimeout(() => {
                //    this.Session.disconnect()
                //}, 500);

                this.OldSessionId = this.CurrentSessionId;
                this.CurrentSessionId = null;
                this.unbindUI();
                this.unbindChatUI();
                this.Session = null;

                this.setTokLinks();

                this.VideoSessionEnded($('#hidClaimId').val(), this.OldSessionId);

                $("#connection-info").hide();


                $('#btnSendLinkEmail').prop('disabled', true);
                $('#sessionLinks').hide();
                $('#videoControls').hide();
                this.resetSubcriberDiv();
            }
        };

        public setTokLinks = () => {
            if (this.CurrentSessionId) {
                this.browerLink = `${window.location.protocol}//${window.location.host}/VideoConnect.aspx?sess=${this.CurrentSessionId}&tok=${this.fieldUserToken}`;
                this.iOSLink = `videoverify://?sess=${this.CurrentSessionId}&token=${this.fieldUserToken}`;
                this.androidLink = `${window.location.protocol}//claimsoffice.com/videoverify?sess=${this.CurrentSessionId}&tok=${this.fieldUserToken}`;
            }
            $("#tokiOSLink").val(this.iOSLink);
            $("#tokAndroidLink").val(this.androidLink);
            $("#tokBrowserLink").val(this.browerLink);
        }

        public GetSessionId = () => {
            return this.CurrentSessionId;
        };

        public GetOldSessionId = () => {
            return this.OldSessionId;
        };

        public GetSubscriber = () => {
            return this.Subscriber;
        };

        public GetPublisher = () => {
            return this.Publisher;
        }

        private setConnectionStatus = (connectionState: OTConnectionStatus, event: any) => {
            switch (connectionState) {
                case OTConnectionStatus.Connected:
                    $('#connection-info .loading-dots').hide();
                    if (this.isConnectionSelf(event)) {
                        $('#connectionStatus').html('<strong class="text-warning">Awaiting field agent</strong>');
                    } else {
                        this.VideoSessionStarted($('#hidClaimId').val(), this.CurrentSessionId);
                        $('#connectionStatus').html('<strong class="text-success">Connected</strong>');
                        $('#waitingText').hide();
                        if (event.type == 'connectionCreated') {
                            this.enableButtons(true);
                        }
                    }
                    break;
                case OTConnectionStatus.Reconnecting:
                    if (!this.isConnectionSelf(event)) {
                        this.enableButtons(false);
                    }
                    $('#connection-info .loading-dots').show();
                    $('#connectionStatus').html('<strong class="text-warning">Reconnecting...</strong>');
                    break;
                case OTConnectionStatus.Disconnected:
                default:
                    this.enableButtons(false);
                    $('#subscriber').parents().removeClass('full-height');
                    $('#connection-info .loading-dots').hide();
                    $('#connectionStatus').html('<strong class="text-danger">Disconnected</strong> <em>(' + event.reason + ')</em>');
                    break;
            }
        };

        private enableButtons = (enable: boolean) => {
            if (enable) {
                this.bindChatUI();
                $('#snapshotButton, #recordButton, #muteButton, #volumeOff').removeClass('disabled').removeAttr('disabled');
            } else {
                this.unbindChatUI();
                $('#snapshotButton, #recordButton, #muteButton, #volumeOff').addClass('disabled').attr('disabled', 'disabled');
            }
        }

        private isConnectionSelf(event: any) {
            const connectionId = event.connection
                ? event.connection.connectionId
                : event.stream
                    ? event.stream.connection.connectionId
                    : event.connectionId;

            return this.Session.connection.id === connectionId;
        }

        private bindResizingWindow = () => {
            var $target = $('#videos');
            $target.height($('body').height() - $target.offset().top);
        }

        private streamCreated = (event: any) => {
            this.setConnectionStatus(OTConnectionStatus.Connected, event);
            this.Subscriber = this.Session.subscribe(event.stream, 'subscriber', {
                fitMode: "contain",
                insertMode: 'replace',
                width: '100%',
                height: '100%',
                audioVolume: this.defaultVolume,
                style: { buttonDisplayMode: 'on' },
            }, this.GenericErrorHandler);

            window.setTimeout(() => { this.bindResizingWindow() }, 500);
        };

        private sessionReconnecting = (event: any) => {
            this.setConnectionStatus(OTConnectionStatus.Reconnecting, event);
        };

        private sessionReconnected = (event: any) => {
            this.setConnectionStatus(OTConnectionStatus.Connected, event);
        }

        private connectionCreated = (event: any) => {
            this.setConnectionStatus(OTConnectionStatus.Connected, event);
        };

        private connectionDestroyed = (event: any) => {
            this.setConnectionStatus(OTConnectionStatus.Disconnected, event);
            this.resetSubcriberDiv();
        }

        private sessionDisconnected = (event: any) => {
            this.setConnectionStatus(OTConnectionStatus.Disconnected, event);
            this.resetSubcriberDiv();
        };

        private resetSubcriberDiv = () => {
            //BUG: OpenTok is removing the publisher div, which is causing issues.  So working around.
            //They say it shouldn't be removing it.  Come back to address this later.
            window.setTimeout(() => {
                if (!$('#videos').find('#publisher').length) {
                    $('#videos').append('<div id="publisher">');
                }
            }, 800);

            window.setTimeout(() => {
                if (!$('#videos').find('#subscriber').length) {
                    $('#videos').append('<div id="subscriber">');
                }
            }, 800);

            $('#videos').height('');
        }

        private streamDestroyed = (event: any) => {
            this.setConnectionStatus(OTConnectionStatus.Disconnected, event);
            this.resetSubcriberDiv();
        };

        private chatListener = (event: OTSignalEvent) => {
            let timeSent = moment().format('LTS');
            var $msgContainer = $('<div class="chat-wrapper" ></div>')
                .addClass(event.from.connectionId === this.Session.connection.connectionId ? 'mine' : 'theirs')
                .append('<i class="glyphicon glyphicon-user"></i>')
                .append($('<p class="message">')
                    .append($('<span class="message-text">').text(event.data)))
                .append($('<span class="time-sent"></span>').text(timeSent));

            $('#msgHistory').append($msgContainer);

            $msgContainer.get(0).scrollIntoView();
        };

        private chatKeydown = (e: JQueryEventObject) => {
            if (e.keyCode === 13) {
                this.Send();
            }
        };

        private GenericErrorHandler = (error: any) => {
            let re = new RegExp('Could not publish in a reasonable amount of time', 'ig');

            if (error) {
                if (error.code === 1500 && re.test(error.message)) {
                    return;
                }
                alert('There was an error with the session: ' + error.code + ' - ' + error.message);
            }
        };
    }
}

