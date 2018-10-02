var tok;
(function (tok) {
    var TokOfficeAgent = /** @class */ (function () {
        function TokOfficeAgent() {
            this.init = function (OT) {
                $(document).ready(function () {
                    var tokServerHostname = $('#tokServerHostname').val();
                    var url = new tok.UrlManager(tokServerHostname);
                    var session = new tok.SessionManager(OT, url);
                    var archive = new tok.ArchiveManager(session, url);
                    var tokManager = new tok.TokManager(archive, session);
                    var screenCaptureManager = new tok.ScreenCaptureManager(tokManager, session);
                    tokManager.Init();
                    $('#sessionControlButton').tooltip({
                        placement: 'right',
                        trigger: 'manual',
                        html: true,
                        title: 'Click to begin video session'
                    });
                    $('#link-send-types').tooltip({
                        placement: 'right',
                        html: true,
                        trigger: 'manual',
                        delay: { 'show': 900, 'hide': 100 },
                        title: 'Choose a method to send the invitation, update the email address or cell phone as necessary and click the Send Link to send the invitation'
                    });
                });
            };
            this.init(window.OT);
        }
        return TokOfficeAgent;
    }());
    tok.TokOfficeAgent = TokOfficeAgent;
    new TokOfficeAgent();
})(tok || (tok = {}));
//# sourceMappingURL=TokOfficeAgent.js.map