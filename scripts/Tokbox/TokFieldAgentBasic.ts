namespace tok {
    export class TokFieldAgentBasic {


        private apiKey = 0;
        private sessionId: string;
        private session: OTSession;
        private urlManager: UrlManager;
        private token: string;
        private OT: OT;
        publisher: OTPublisher;

        constructor() {
            this.init();
        }

        init = () => {
            this.OT = (window as any).OT;
            const tokServerHostname = $("#tokServerHostname").val();
            this.urlManager = new UrlManager(tokServerHostname);
            this.apiKey = 46136892;
            this.sessionId = this.getParameterByName("sess");
            this.token = this.getParameterByName("tok");
            this.initializeSession();
        };
        
        initializeSession = () => {
            this.session = this.OT.initSession(this.apiKey.toString(), this.sessionId);
            // Subscribe to a newly created stream
            this.session.on('streamCreated', (event: any) => {
                var subscriberOptions = {
                    insertMode: 'append',
                    width: '100%',
                    height: '100%'
                };
                this.session.subscribe(event.stream, 'subscriber', subscriberOptions, this.handleError);
            });

            this.session.on('sessionDisconnected', (event: any) => {
                console.log('You were disconnected from the session.', event.reason);
            });


            let publisherOptions = {
                insertMode: 'append',
                width: '100%',
                height: '100%'
            };
            this.publisher = this.OT.initPublisher('publisher', publisherOptions, this.handleError);

            // Connect to the session
            this.session.connect(this.token, (error: any) => {
                if (error) {
                    this.handleError(error);
                } else {
                    // If the connection is successful, initialize a publisher and publish to the session
                    this.session.publish(this.publisher, this.handleError);
                }
            });


        };
        

        getParameterByName = (name: string, url?: string) => {
            if (!url) {
                url = window.location.href;
            }
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return "";
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        };

        // Handling all of our errors here by alerting them
        handleError = (error: any) => {
            if (error) {
                moonshot.ErrorConsole.writeToConsole(error.message);
            }
        };
    }

    (window as any).tokFieldAgent = new TokFieldAgentBasic();
}