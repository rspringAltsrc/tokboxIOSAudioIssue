var tok;
(function (tok) {
    var TokManager = /** @class */ (function () {
        function TokManager(ArchiveManager, SessionManager) {
            var _this = this;
            this.ArchiveManager = ArchiveManager;
            this.SessionManager = SessionManager;
            this.frmInitialized = true;
            this.lastVolumeValue = 0;
            this.Init = function () {
                //Call initSession without api or session ID to initiate installation of plugin.
                _this.SessionManager.OT.initSession(null, null);
                setTimeout(function () {
                    $('#sessionControlButton').focus();
                    $('#sessionControlButton').tooltip('show');
                    _this.enableSendMethods(false);
                    _this.frmInitialized = false;
                }, 500);
                _this.ArchiveManager.GetArchivesForClaim().then(function () {
                });
                //Create jQuery plugin instances
                _this.volumeSlider = $('#volumeSlider');
                _this.volumeSlider.slider({
                    value: _this.SessionManager.defaultVolume,
                    formatter: function (value) { return "Current value: " + value; }
                });
                //Event bindings
                $('#closeButton').on('click', _this.closeWindow);
                $('#txtSendSmsNumber').on('focus', _this.smsFocus);
                $('#txtSendLinkEmail').on('focus', _this.emailFocus);
                $('.btn-group.contact').find('input[type=radio]').on('change', _this.selectContact);
                $('.btn-group.contact').find('label, button').on('click', _this.closeToolTip);
                $('#btnSendAndroid, #btnSendiOS, #btnSendBrowser').on('click', _this.sendLink);
                $('#sessionControlButton').on('click', _this.sessionControlButtonClick);
                $("#recordButton").on('click', _this.recordSession);
                $('#btnShowUrls').on('click', _this.toggleSessionLinkDisplay);
                $("#stopRecordingButton").on('click', _this.stopRecordingSession);
                $('#volumeSlider').on('slide', _this.adjustVolume);
                $('#volumeSlider').on('change', _this.adjustVolume);
                $('#volumeOff').on('click', _this.toggleVolume);
                $('#muteButton').on('click', _this.toggleMic);
                window.addEventListener('beforeunload', function (e) {
                    if (!_this.SessionManager.GetSessionId()) {
                        return;
                    }
                    var confirmationMessage = 'There is still a session in process, are you sure you want to leave?';
                    e.returnValue = confirmationMessage; // Gecko, Trident, Chrome 34+
                    return confirmationMessage; // Gecko, WebKit, Chrome <34 })
                });
            };
            this.selectContact = function () {
                var subscriber = _this.SessionManager.GetSubscriber();
                if (!(subscriber && subscriber.stream && subscriber.stream.hasVideo)) {
                    $('#waitingText').show();
                }
            };
            this.enableSendMethods = function (enable) {
                if (enable) {
                    $('#link-send-types, #send-details').find('button, label').removeClass('disabled');
                    $('#send-details').find('input').removeAttr('disabled');
                }
                else {
                    $('#link-send-types, #send-details').find('button, label').addClass('disabled');
                    $('#send-details').find('input').attr('disabled', 'disabled');
                }
            };
            this.setSessionControlButton = function (state) {
                switch (state) {
                    case 'start':
                        $('#sessionControlButton').text('Stop Session')
                            .removeClass('btn-primary')
                            .addClass('btn-danger');
                        break;
                    default:
                        $('#sessionControlButton').text('Start Session')
                            .removeClass('btn-danger')
                            .addClass('btn-primary');
                        break;
                }
            };
            this.closeToolTip = function () {
                $('#link-send-types').tooltip('hide');
            };
            this.toggleSessionLinkDisplay = function () {
                $('#sessionLinks').toggle();
            };
            this.sessionControlButtonClick = function (e) {
                if ($(e.target).hasClass('btn-primary')) {
                    _this.startSession();
                    if (!$('.btn-group.contact').find('input[type=radio]:checked').val()) {
                        $('#link-send-types').tooltip('show');
                    }
                }
                else {
                    _this.stopSession();
                }
            };
            this.closeWindow = function () {
                window.close();
            };
            this.resetRadioGroup = function () {
                var radioGroup = $('.btn-group.contact');
                radioGroup.find('.btn').removeClass('active');
                radioGroup.find('input[type=radio]').removeProp('checked');
                return radioGroup;
            };
            this.adjustVolume = function (event) {
                var subscriber = _this.SessionManager.GetSubscriber();
                var value = event.type === 'slide'
                    ? event.value
                    : event.value.newValue;
                _this.lastVolumeValue = value;
                subscriber.setAudioVolume(value);
            };
            this.toggleMic = function () {
                var publisher = _this.SessionManager.GetPublisher();
                if (publisher.stream.hasAudio) {
                    console.debug('muting microphone');
                    publisher.publishAudio(false);
                }
                else {
                    console.debug('unmuting microphone');
                    publisher.publishAudio(true);
                }
            };
            this.toggleVolume = function () {
                var subscriber = _this.SessionManager.GetSubscriber();
                //let stream = subscriber.stream;
                var volume = subscriber.getAudioVolume();
                if (volume > 0) {
                    _this.volumeSlider.slider("setValue", 0);
                    subscriber.subscribeToAudio(false);
                }
                else {
                    subscriber.subscribeToAudio(true);
                    _this.volumeSlider.slider("setValue", _this.lastVolumeValue);
                }
            };
            this.smsFocus = function () {
                var radioGroup = _this.resetRadioGroup();
                //IE is defaulting focus to sms field for some unknown reason.  Simply tripping it up here.
                if (_this.frmInitialized) {
                    return;
                }
                radioGroup.find('input[type=radio][value="sms"]').trigger('click');
                //radioGroup.find('input[type=radio][value="sms"]').prop("checked", true).parent('.btn').addClass('active');
            };
            this.emailFocus = function () {
                var radioGroup = _this.resetRadioGroup();
                radioGroup.find('input[type=radio][value="email"]').trigger('click');
                //radioGroup.find('input[type=radio][value="email"]').prop("checked", true).parent('.btn').addClass('active');
            };
            this.sendLink = function (e) {
                var sendLink = new tok.SessionLinkSender(_this.PhoneNumber, _this.SessionManager);
                var sendToDeviceType = $(e.target).attr('id').replace('btnSend', '');
                var method = $('.contact input[type=radio]:checked').val();
                if (method === "email") {
                    sendLink.sendEmail(sendToDeviceType);
                }
                else if (method === "sms") {
                    sendLink.sendSms(sendToDeviceType);
                }
                else {
                    alert('You must select a send method');
                }
            };
            this.startSession = function () {
                _this.SessionManager.StartSession();
                $('#sessionControlButton').tooltip('hide');
                _this.setSessionControlButton('start');
                _this.enableSendMethods(true);
                $('#chatAread').show();
            };
            this.stopSession = function () {
                if (_this.ArchiveManager.IsRecording()) {
                    _this.stopRecordingSession();
                }
                _this.SessionManager.StopSession();
                $('#link-send-types').tooltip('hide');
                $('#waitingText').hide();
                _this.setSessionControlButton('stop');
                _this.enableSendMethods(false);
            };
            this.recordSession = function () {
                _this.ArchiveManager.StartRecording();
            };
            this.stopRecordingSession = function () {
                _this.ArchiveManager.StopRecording().then(function () {
                    console.log('Go get archives');
                    _this.ArchiveManager.GetArchivesForClaim().then(function () {
                        console.log('Got archives after stopped recording.');
                    });
                });
            };
            this.PhoneNumber = new Cleave('#txtSendSmsNumber', { phone: true, phoneRegionCode: 'US' });
        }
        return TokManager;
    }());
    tok.TokManager = TokManager;
})(tok || (tok = {}));
//# sourceMappingURL=TokManager.js.map