namespace tok {
    export class TokFieldAgent {


        private apiKey = 0;
        private sessionId: string;
        private session: OTSession;
        private urlManager: UrlManager;
        private token: string;
        private OT: OT;
        public publisher: OTPublisher;

        constructor() {
            this.init();
        }

        init = () => {
            this.OT = (window as any).OT;
            const tokServerHostname = $('#tokServerHostname').val();
            this.urlManager = new UrlManager(tokServerHostname);
            $.get(this.urlManager.GetApiKey()).then((apiKey: number) => {
                this.apiKey = apiKey;
                this.sessionId = this.getParameterByName('sess');
                this.token = this.getParameterByName('tok');
                this.initializeSession();
            });
        }

        stopSession = () => {
            if (this.session) {
                this.session.disconnect();
            }

            $('#publisher').removeAttr('style');
            this.toggleChat(true);

            setTimeout(() => {
                    if (confirm('Session ended, would you like to close this window?')) {
                        window.close();
                    };
                },
                1500);
        };

        togglePublishing = () => {
            const paused = this.publisher.stream.hasVideo;
            this.publisher.publishAudio(!paused);
            this.publisher.publishVideo(!paused);

            const btnClass = paused ? 'btn-warning' : 'btn-default';

            $('#PublishingButton').removeClass('btn-default, btn-warning').addClass(btnClass);
            $('#PublishingButton').find('.button-text').text(paused ? 'UnPause' : 'Pause');
        }

        toggleChat = (show?: boolean) => {
            if (!$('#chatArea').is(':visible') || show) {
                $('#chatArea').show();
            } else {
                $('#chatArea').hide();
            }
        }

        toggleAudio = () => {
            const iconClass = this.publisher.stream.hasAudio ? 'fa-microphone-alt' : 'fa-microphone-alt-slash';

            $('#AudioButton').find('i').removeClass('fa-microphone-alt, fa-microphone-alt-slash').addClass(iconClass);
            $('#AudioButton').find('.button-text').text(this.publisher.stream.hasAudio ? 'Unmute' : 'Mute');
            this.publisher.publishAudio(!this.publisher.stream.hasAudio);
        }

        initializeSession = () => {
            this.session = this.OT.initSession(this.apiKey.toString(), this.sessionId);
            this.session.on('changedProperty', this.streamPropChanged);
            this.publisher = this.OT.initPublisher('publisher',
                {
                    facingMode: 'environment',
                    showControls: 'false',
                    fitMode: 'contain',
                    insertMode: 'replace',
                    width: '100%',
                    height: '100%'
                }, (error: any) => {
                    //moonshot.ErrorConsole.writeToConsole(`has Audio: ${this.publisher.stream.hasAudio.valueOf().toString()}`);
                    this.handleError(error);
                });
  

            // Subscribe to a newly created stream
            this.session.on('streamCreated',
                (event: any) => {
                    this.session.subscribe(event.stream,
                        'subscriber',
                        {
                            insertMode: 'append',
                            width: '100%',
                            height: '100%'
                        },
                        (error: OTError) => {
                            this.handleError(error);
                        });
                });

            this.session.on('streamDestroyed',
                () => {
                    this.stopSession();
                });

            // Connect to the session
            this.session.connect(this.token,
                (error: OTError) => {
                    // If the connection is successful, initialize a publisher and publish to the session
                    if (!error) {
                        this.session.publish(this.publisher, this.handleError);

                        $('#publisher').css('left', 0);
                        $('#Logo').hide();
                    } else {
                        console.log('There was an error connecting to the session: ', error.code, error.message);
                    }
                });

            this.session.on('signal:chat', this.chatListener);
            //(event: OTSignalEvent) => {
            //    var msg = $('<p class="chat-wrapper">');
            //    msg.html(event.data)
            //        .addClass(event.from.connectionId === this.session.connection.connectionId ? 'mine' : 'theirs');
            //    $('#msgHistory').append(msg);
            //    msg.get(0).scrollIntoView();
            //});

            $('#txtClientChat').on('keydown',
                (e) => {
                    if (e.keyCode === 13) {
                        this.send();
                    }
                });
        }
        private streamPropChanged = (e: StreamPropertyChangedEvent) => {
            moonshot.ErrorConsole.writeToConsole('change event fired');

            if (e.changedProperty === 'hasAudio' && e.stream.streamId === this.publisher.stream.streamId) {
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
        private chatListener = (event: OTSignalEvent) => {
            this.toggleChat(true);
            let timeSent = moment().format('LTS');
            var $msgContainer = $('<div class="chat-wrapper" ></div>')
                .addClass(event.from.connectionId === this.session.connection.connectionId ? 'mine' : 'theirs')
                .append('<i class="glyphicon glyphicon-user"></i>')
                .append($('<p class="message">')
                    .append($('<span class="message-text">').text(event.data)))
                .append($('<span class="time-sent"></span>').text(timeSent));

            $('#msgHistory').append($msgContainer);

            $msgContainer.get(0).scrollIntoView();
        };

        swapCamera = () => {
            $('body').append('<div>camera swap</div>');
            this.publisher.cycleVideo()
                .then(() => {
                        $('body').append('<div>swap success</div>');
                    },
                    (response: any) => {
                        $('body').append('<div>error ' + response + '</div>');
                    })
                .fail((error: any) => {
                    $('body').append('<div>error ' + error + '</div>');
                });
        }

        getDevices = () => {
            this.OT.getDevices((error: any, devices: any) => {
                for (let d of devices) {
                    for (let p of d) {
                        moonshot.ErrorConsole.writeToConsole(p);
                    }
                    
                }
            });
        }

        send = () => {
            this.session.signal({
                    type: 'chat',
                    data: $('#txtClientChat').val()
                },
                (error: any) => {
                    if (!error) {
                        $('#txtClientChat').val('');
                    }
                }
            );
        };

        getParameterByName = (name: string, url?: string) => {
            if (!url) {
                url = window.location.href;
            }
            name = name.replace(/[\[\]]/g, '\\$&');
            var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, ' '));
        }

        // Handling all of our errors here by alerting them
        handleError = (error: any) => {
            if (error) {
                moonshot.ErrorConsole.writeToConsole(error.message);
            }
        }
    }

    (window as any).tokFieldAgent = new TokFieldAgent();

}
