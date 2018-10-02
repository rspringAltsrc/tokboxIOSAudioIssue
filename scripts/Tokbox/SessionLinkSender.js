var tok;
(function (tok) {
    var SessionLinkSender = /** @class */ (function () {
        function SessionLinkSender(phoneNumber, sessionManager) {
            this.phoneNumber = phoneNumber;
            this.sessionManager = sessionManager;
        }
        SessionLinkSender.prototype.sendEmail = function (sendToDeviceType) {
            var emailAddr = $('#txtSendLinkEmail').val();
            var sessionLink = '';
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
                    success: function () {
                        alert('success');
                    },
                    error: function (xhr, err) {
                        alert(err);
                    }
                });
            }
            else {
                alert('A session does not appear to be started. Please start a session before sending an email');
            }
        };
        ;
        SessionLinkSender.prototype.sendSms = function (sendToDeviceType) {
            var phnNumber = this.phoneNumber.getRawValue();
            var sessionLink = '';
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
                    success: function () {
                        alert('success');
                    },
                    error: function (xhr, err) {
                        alert(err);
                    }
                });
            }
            else {
                alert('A session does not appear to be started. Please start a session before sending a text message');
            }
        };
        ;
        return SessionLinkSender;
    }());
    tok.SessionLinkSender = SessionLinkSender;
})(tok || (tok = {}));
//# sourceMappingURL=SessionLinkSender.js.map