declare var Base64Manager: any;
declare var Cleave: any;

namespace tok {
	export class TokManager {

		private PhoneNumber: any;
        private frmInitialized = true;
        private volumeSlider: JQuery;
        private lastVolumeValue: number = 0;
		constructor(
			private ArchiveManager: ArchiveManager,
			private SessionManager: SessionManager
		) {
            this.PhoneNumber = new Cleave('#txtSendSmsNumber', { phone: true, phoneRegionCode: 'US' });

		}

        public Init = () => {
            //Call initSession without api or session ID to initiate installation of plugin.
	        this.SessionManager.OT.initSession(null, null); 

			    setTimeout(() => {
                    $('#sessionControlButton').focus();
                    $('#sessionControlButton').tooltip('show');
			        this.enableSendMethods(false);
			        this.frmInitialized = false;
                }, 500);

			    this.ArchiveManager.GetArchivesForClaim().then(() => {
			    });

                //Create jQuery plugin instances
                this.volumeSlider = $('#volumeSlider');
                this.volumeSlider.slider({
                    value: this.SessionManager.defaultVolume,
                    formatter: (value: number) => `Current value: ${value}`
                });
                
                //Event bindings
                $('#closeButton').on('click', this.closeWindow);

			    $('#txtSendSmsNumber').on('focus', this.smsFocus);

                $('#txtSendLinkEmail').on('focus', this.emailFocus);

			    $('.btn-group.contact').find('input[type=radio]').on('change', this.selectContact);

                $('.btn-group.contact').find('label, button').on('click', this.closeToolTip);

                $('#btnSendAndroid, #btnSendiOS, #btnSendBrowser').on('click', this.sendLink);

                $('#sessionControlButton').on('click', this.sessionControlButtonClick);

				$("#recordButton").on('click', this.recordSession);

                $('#btnShowUrls').on('click', this.toggleSessionLinkDisplay);

				$("#stopRecordingButton").on('click', this.stopRecordingSession);

                $('#volumeSlider').on('slide', this.adjustVolume);

                $('#volumeSlider').on('change', this.adjustVolume);

                $('#volumeOff').on('click', this.toggleVolume);

			    $('#muteButton').on('click', this.toggleMic);

                window.addEventListener('beforeunload', (e: any) => {
                    if (!this.SessionManager.GetSessionId()) {
                        return;
                    }
			        var confirmationMessage = 'There is still a session in process, are you sure you want to leave?';

			        e.returnValue = confirmationMessage; // Gecko, Trident, Chrome 34+
			        return confirmationMessage; // Gecko, WebKit, Chrome <34 })
			    });
        };

        private selectContact = () => {
            const subscriber = this.SessionManager.GetSubscriber();

            if (!(subscriber && subscriber.stream && subscriber.stream.hasVideo)) {
                $('#waitingText').show();
            }

	    }

	    private enableSendMethods = (enable: boolean) => {
            if (enable) {
                $('#link-send-types, #send-details').find('button, label').removeClass('disabled');
                $('#send-details').find('input').removeAttr('disabled');
            } else {
                $('#link-send-types, #send-details').find('button, label').addClass('disabled');
                $('#send-details').find('input').attr('disabled', 'disabled');
            }
        }
	    public setSessionControlButton = (state: string) => {
            switch(state) {
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

        }

        private closeToolTip = () => {
            $('#link-send-types').tooltip('hide');
        }

	    private toggleSessionLinkDisplay = () => {
	        $('#sessionLinks').toggle();
        }

        private sessionControlButtonClick = (e: JQueryEventObject) => {
            if ($(e.target).hasClass('btn-primary')) {
                this.startSession();
                if (!$('.btn-group.contact').find('input[type=radio]:checked').val()) {
                    $('#link-send-types').tooltip('show');
                }
            } else {
                this.stopSession();
            }

        }
        private closeWindow = () => {
            window.close();
        }

        private resetRadioGroup = (): JQuery => {
	        const radioGroup = $('.btn-group.contact');
	        radioGroup.find('.btn').removeClass('active');
            radioGroup.find('input[type=radio]').removeProp('checked');
            return radioGroup;
        }

        private adjustVolume = (event: any) => {
            var subscriber = this.SessionManager.GetSubscriber();

            let value = event.type === 'slide'
                ? event.value
                : event.value.newValue;

            this.lastVolumeValue = value;
            
            subscriber.setAudioVolume(value);
        }

	    private toggleMic = () => {
            let publisher = this.SessionManager.GetPublisher();
            if (publisher.stream.hasAudio) {
                console.debug('muting microphone');
                publisher.publishAudio(false);
            } else {
                console.debug('unmuting microphone');
                publisher.publishAudio(true);
	        }
        }

        private toggleVolume = () => {
            let subscriber = this.SessionManager.GetSubscriber();
            //let stream = subscriber.stream;
            let volume = subscriber.getAudioVolume();
            if (volume > 0) {
                this.volumeSlider.slider("setValue", 0);
                subscriber.subscribeToAudio(false);
            } else {
                subscriber.subscribeToAudio(true);
                this.volumeSlider.slider("setValue", this.lastVolumeValue);
            }
        }

        private smsFocus = () => {
            const radioGroup = this.resetRadioGroup();

            //IE is defaulting focus to sms field for some unknown reason.  Simply tripping it up here.
            if (this.frmInitialized) {
                return;
            }
            radioGroup.find('input[type=radio][value="sms"]').trigger('click');

            //radioGroup.find('input[type=radio][value="sms"]').prop("checked", true).parent('.btn').addClass('active');
        };

        private emailFocus = () => {
	        const radioGroup = this.resetRadioGroup();
            radioGroup.find('input[type=radio][value="email"]').trigger('click');
	        //radioGroup.find('input[type=radio][value="email"]').prop("checked", true).parent('.btn').addClass('active');
        };

        private sendLink = (e: JQueryEventObject) => {
            const sendLink = new SessionLinkSender(this.PhoneNumber, this.SessionManager);

            var sendToDeviceType = $(e.target).attr('id').replace('btnSend', '');

            var method = $('.contact input[type=radio]:checked').val();

            if (method === "email") {
                sendLink.sendEmail(sendToDeviceType);
            } else if (method === "sms") {
                sendLink.sendSms(sendToDeviceType);
            } else {
                alert('You must select a send method');
            }
        }

        private startSession = () => {
            this.SessionManager.StartSession();
            $('#sessionControlButton').tooltip('hide');
            this.setSessionControlButton('start');
            this.enableSendMethods(true);
            $('#chatAread').show();
        }

        private stopSession = () => {

            if (this.ArchiveManager.IsRecording()) {
                this.stopRecordingSession();
            }
            this.SessionManager.StopSession();
            $('#link-send-types').tooltip('hide');
            $('#waitingText').hide();
            this.setSessionControlButton('stop');
            this.enableSendMethods(false);
        }

        private recordSession = () => {
            this.ArchiveManager.StartRecording();
        }

        private stopRecordingSession = () => {
            this.ArchiveManager.StopRecording().then(() => {
                console.log('Go get archives');
                this.ArchiveManager.GetArchivesForClaim().then(() => {
                    console.log('Got archives after stopped recording.')
                });
            });
        }
	}
}



