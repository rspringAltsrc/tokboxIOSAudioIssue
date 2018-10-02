var tok;
(function (tok) {
    var ScreenCaptureManager = /** @class */ (function () {
        function ScreenCaptureManager(TokManager, SessionManager) {
            var _this = this;
            this.TokManager = TokManager;
            this.SessionManager = SessionManager;
            this.CaptureCount = 1;
            this.MaxCaptureCount = 30;
            this.initialize = function () {
                $('#snapshots').on('click', 'img', _this.bindAnnotateClick);
                $('#videoBody').on('click', '#btnSaveScreenShots', _this.saveScreenShots);
                $('#videoBody').on('click', '#snapshotButton', _this.snapShotButton);
                $('body').on('click', '#btnAnnotateSave', _this.annotateSave);
            };
            this.IncrementCapture = function () {
                _this.CaptureCount++;
            };
            this.DecrementCapture = function () {
                _this.CaptureCount--;
            };
            this.GetCaptureCount = function () {
                return _this.CaptureCount;
            };
            this.CanCapture = function () {
                return _this.CaptureCount <= _this.MaxCaptureCount;
            };
            this.bindAnnotateClick = function (e) {
                $('#editImageModal').modal('toggle');
                var annotateOpts = {};
                var bodyWidth = $('body').innerWidth();
                if (bodyWidth > 768 && bodyWidth < 992) {
                    annotateOpts = {
                        width: 560,
                        height: 420
                    };
                }
                $('#annotateCanvas').annotate(annotateOpts);
                var imgData = $(e.target).attr('src');
                $('#annotateCanvas').annotate('push', imgData);
                $("#annotateColorPicker").spectrum({
                    color: "#f00",
                    change: function (color) {
                        $('#annotateCanvas').annotate("color", color.toHexString());
                    }
                });
            };
            this.unbindAnnotateWindowUI = function () {
                $("#myCanvas").annotate("destroy");
            };
            this.saveScreenShots = function (e) {
                var claimId = $('#hidClaimId').val();
                var userId = $('#hidUserId').val();
                var primaryTypeId = $('#hidPrimaryTypeId').val();
                var allCheckImgTags = $('input[type="checkbox"][id^="screenshot_"]:checked').closest('.thumbnail').find('img');
                var imageCount = allCheckImgTags.length;
                if (imageCount <= 0 || !claimId) {
                    alert('You must select at least 1 image to save');
                    return;
                }
                var formData = new FormData();
                for (var idx = 0; idx < imageCount; ++idx) {
                    var $ss = $(allCheckImgTags[idx]);
                    var image = $ss.attr('src');
                    var base64ImageContent = image.replace(/^data:image\/(png|jpg);base64,/, "");
                    var blob = Base64Manager.ToBlob(base64ImageContent, 'image/png');
                    formData.append($ss.attr('data-ssid'), blob, $ss.attr('data-ssid'));
                }
                formData.append('claimId', claimId);
                formData.append('sessionId', _this.SessionManager.GetOldSessionId());
                formData.append('userId', userId);
                formData.append('primaryTypeId', primaryTypeId);
                formData.append('imageCount', imageCount.toString());
                $.ajax({
                    type: "POST",
                    url: "VideoScreenShotsHandler.ashx",
                    data: formData,
                    cache: false,
                    contentType: false,
                    processData: false,
                    success: function (msg) {
                        alert('Saved ' + msg + ' screen shots');
                    },
                    error: function (xhr, err) {
                        alert(err);
                    }
                });
                e.preventDefault();
                e.stopPropagation();
            };
            this.AppendScreenshot = function (index, imgData) {
                if (!_this.CanCapture()) {
                    alert('Reached maximum capture limit');
                    return;
                }
                var $snapshots = $('#snapshots');
                var $snapshot = $('<img />');
                $snapshot.attr('data-ssid', 'screenshot_' + index);
                $snapshot.attr('src', imgData);
                var $checkbox = $('<div class="checkbox"><label><input type="checkbox" id="screenshot_' + index + '" />Save</label></div>');
                var $column = $('<div class="col-md-4">');
                var $parent = $('<div class="thumbnail">');
                $parent.append($snapshot)
                    .append($checkbox);
                $column.append($parent);
                var $lastRow = $snapshots.find('.row:last');
                if (!$lastRow.length || $lastRow.find('.col-md-4').length >= 3) {
                    $snapshots.append('<div class="row pad">');
                    $lastRow = $snapshots.find('.row:last');
                }
                $lastRow.append($column);
                _this.IncrementCapture();
            };
            this.snapShotButton = function () {
                var subscriber = _this.SessionManager.GetSubscriber();
                if (!subscriber) {
                    return;
                }
                $('#btnSaveScreenShots').show();
                var imgData = subscriber.getImgData();
                var index = _this.GetCaptureCount();
                _this.AppendScreenshot(index, 'data:image/png;base64,' + imgData);
            };
            this.annotateSave = function () {
                $('#annotateCanvas').annotate("export", {
                    type: 'image/png',
                    quality: 0.99
                }, function (image) {
                    var index = _this.GetCaptureCount();
                    _this.AppendScreenshot(index, image);
                    $('#editImageModal').modal('toggle');
                });
            };
            this.initialize();
        }
        return ScreenCaptureManager;
    }());
    tok.ScreenCaptureManager = ScreenCaptureManager;
    ;
})(tok || (tok = {}));
//# sourceMappingURL=ScreenCaptureManager.js.map