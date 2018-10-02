var tok;
(function (tok) {
    var UrlManager = /** @class */ (function () {
        function UrlManager(HostUrl) {
            var _this = this;
            this.HostUrl = HostUrl;
            this.BaseUrl = this.HostUrl + 'api/tokbox';
            this.GetApiKey = function () {
                return _this.BaseUrl + '/GetApiKey';
            };
            this.GetSession = function () {
                return _this.BaseUrl + '/GetSession';
            };
            this.StopSession = function () {
                return _this.BaseUrl + '/StopSession';
            };
            this.StartArchive = function () {
                return _this.BaseUrl + '/StartArchive';
            };
            this.DeleteArchive = function () {
                return _this.BaseUrl + '/DeleteArchive';
            };
            this.StopArchive = function () {
                return _this.BaseUrl + '/StopArchive';
            };
            this.GetArchivesForClaim = function () {
                return _this.BaseUrl + '/GetArchivedVideosForClaim';
            };
            this.VideoSessionStarted = function () {
                return _this.BaseUrl + '/SessionStarted';
            };
            this.VideoSessionEnded = function () {
                return _this.BaseUrl + '/SessionEnded';
            };
        }
        return UrlManager;
    }());
    tok.UrlManager = UrlManager;
})(tok || (tok = {}));
//# sourceMappingURL=TokUrlManager.js.map