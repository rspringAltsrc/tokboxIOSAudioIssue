interface JQuery {
	annotate(options?: Object): JQuery;
	annotate(command: string, args: any, callback?: any): JQuery;
	spectrum(options: any): JQuery;
	modal(command: string): JQuery;
}

namespace tok {
    export class ScreenCaptureManager {

        private CaptureCount = 1;
        private MaxCaptureCount = 30;

        constructor(
            private TokManager: TokManager,
            private SessionManager: SessionManager
        ) {
            this.initialize();
        }

        public initialize = () => {
            $('#snapshots').on('click', 'img', this.bindAnnotateClick);

            $('#videoBody').on('click', '#btnSaveScreenShots', this.saveScreenShots);

            $('#videoBody').on('click', '#snapshotButton', this.snapShotButton);

            $('body').on('click', '#btnAnnotateSave', this.annotateSave);

        }

        public IncrementCapture = () => {
            this.CaptureCount++;
        };

        public DecrementCapture = () => {
            this.CaptureCount--;
        };

        public GetCaptureCount = () => {
            return this.CaptureCount;
        };

        public CanCapture = () => {
            return this.CaptureCount <= this.MaxCaptureCount;
        };

        private bindAnnotateClick = (e: JQueryEventObject) => {
            $('#editImageModal').modal('toggle');
            let annotateOpts = {};
            let bodyWidth = $('body').innerWidth();

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
                change: (color: any) => {
                    $('#annotateCanvas').annotate("color", color.toHexString());
                }
            });
        }

        private unbindAnnotateWindowUI = () => {
            $("#myCanvas").annotate("destroy");
        }
        
        private saveScreenShots = (e: any) => {

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
            formData.append('sessionId', this.SessionManager.GetOldSessionId());
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
                success: (msg: any) => {
                    alert('Saved ' + msg + ' screen shots');
                },
                error: (xhr: any, err: any) => {
                    alert(err);
                }
            });

            e.preventDefault();
            e.stopPropagation();
        }

	    public AppendScreenshot = (index: number, imgData: string) => {
			if (!this.CanCapture()) {
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

	        this.IncrementCapture();
		};

        private snapShotButton = () => {
            var subscriber = this.SessionManager.GetSubscriber();

            if (!subscriber) {
                return;
            }

            $('#btnSaveScreenShots').show();

            var imgData = subscriber.getImgData();

            var index = this.GetCaptureCount();

            this.AppendScreenshot(index, 'data:image/png;base64,' + imgData);
        }

        private annotateSave = () => {
            $('#annotateCanvas').annotate("export",
                {
                    type: 'image/png',
                    quality: 0.99
                },
                (image: string) => {

                    var index = this.GetCaptureCount();

                    this.AppendScreenshot(index, image);

                    $('#editImageModal').modal('toggle');
                });
        }
    };
}

