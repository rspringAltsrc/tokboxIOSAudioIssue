namespace tok {
    export class SessionLinkSender {
        constructor(private phoneNumber: any, private sessionManager: SessionManager) {

        }

    sendEmail(sendToDeviceType: string){
        var emailAddr = $('#txtSendLinkEmail').val();
        let sessionLink = '';
        switch (sendToDeviceType) {
            case 'Android':
                sessionLink = this.sessionManager.androidLink;
                break;
            case 'iOS':
                sessionLink = this.sessionManager.iOSLink;
                break;
            case 'Browser':
            default:
                sessionLink = this.sessionManager.browerLink;
        }


        if (emailAddr.length <= 5) {
            alert('A valid email is required');
            return;
        }

        if (sessionLink.length > 0) {
            $.ajax({
                type: 'POST',
                url: 'Video.aspx/SendLinkEmail',
                data: JSON.stringify({
                    email: emailAddr,
                    sessionLink: sessionLink,
                    sendToDeviceType: sendToDeviceType
                }),
                contentType: 'application/json',
                dataType: 'json',
                success: () => {
                    alert('success');
                },
                error: (xhr: any, err: any) => {
                    alert(err);
                }
            });
        } else {
            alert('A session does not appear to be started. Please start a session before sending an email');
        }
    };

    sendSms(sendToDeviceType: string) {
        var phnNumber = this.phoneNumber.getRawValue();
        let sessionLink = '';
        switch (sendToDeviceType) {
            case 'Android':
                sessionLink = this.sessionManager.androidLink;
                break;
            case 'iOS':
                sessionLink = this.sessionManager.iOSLink;
                break;
            case 'Browser':
            default:
                sessionLink = this.sessionManager.browerLink;
        }

        if (phnNumber.length < 10) {
            alert('A valid phone number is required');
            return;
        }

        if (sessionLink.length > 0) {
            $.ajax({
                type: 'POST',
                url: 'Video.aspx/SendLinkSms',
                data: JSON.stringify({
                    phoneNumber: phnNumber,
                    sessionLink: sessionLink
                }),
                contentType: 'application/json',
                dataType: 'json',
                success: () => {
                    alert('success');
                },
                error: (xhr: any, err: any) => {
                    alert(err);
                }
            });
        } else {
            alert('A session does not appear to be started. Please start a session before sending a text message');
        }
    };
    }


}