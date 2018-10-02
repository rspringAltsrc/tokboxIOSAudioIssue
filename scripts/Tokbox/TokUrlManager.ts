namespace tok {

	export class UrlManager {
		constructor(
			public HostUrl: string
		) {
		}

		private BaseUrl = this.HostUrl + 'api/tokbox';

        public GetApiKey = () => {
            return this.BaseUrl + '/GetApiKey';
        }

		public GetSession = () => {
			return this.BaseUrl + '/GetSession';
		};

		public StopSession = () => {
			return this.BaseUrl + '/StopSession';
		};

		public StartArchive = () => {
			return this.BaseUrl + '/StartArchive';
		};

	    public DeleteArchive = () => {
            return this.BaseUrl + '/DeleteArchive';
	    };

		public StopArchive = () => {
			return this.BaseUrl + '/StopArchive';
		};

		public GetArchivesForClaim = () => {
			return this.BaseUrl + '/GetArchivedVideosForClaim';
        };

	    public VideoSessionStarted = () => {
            return this.BaseUrl + '/SessionStarted';
        };

	    public VideoSessionEnded = () => {
	        return this.BaseUrl + '/SessionEnded';
	    };
	}
}

	