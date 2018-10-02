namespace tok {
    export class TokOfficeAgent {

    constructor() {
        this.init((window as any).OT);
    }
    
    init = (OT: OT) => {
            $(document).ready(() => {
                var tokServerHostname = $('#tokServerHostname').val();
                var url = new UrlManager(tokServerHostname);
                var session = new SessionManager(OT, url);
                var archive = new ArchiveManager(session, url);
                var tokManager = new TokManager(archive, session);
                const screenCaptureManager = new ScreenCaptureManager(tokManager, session);
                tokManager.Init();


                $('#sessionControlButton').tooltip({
                    placement: 'right',
                    trigger: 'manual',
                    html: true,
                    title:
                        'Click to begin video session'
                });
                $('#link-send-types').tooltip({
                    placement: 'right',
                    html: true,
                    trigger: 'manual',
                    delay: { 'show': 900, 'hide': 100 },
                    title:
                        'Choose a method to send the invitation, update the email address or cell phone as necessary and click the Send Link to send the invitation'
                });
            });
        }
    }

    new TokOfficeAgent();
}