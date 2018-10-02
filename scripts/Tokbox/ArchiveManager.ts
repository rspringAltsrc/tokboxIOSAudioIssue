namespace tok {
    import ISecurity = EcsTs.Security.ISecurity;
    import WebPage = EcsTs.WebPage;
    import Permissions = EcsTs.Permissions;

    interface IArchiveTimes {
        [archiveId: string]: Date
    }

    export class ArchiveManager {

        private security: ISecurity;
        private archiveLengths: IArchiveTimes = {};
        private archiveTimerId: number;

		constructor(
			private SessionManager: SessionManager,
            private UrlManager: UrlManager
		) {
		    this.security = EcsTs.Security.securityFactory();
            this.security.getPermissions().then(() => {
                $('#archivedBody').on('click', '.play-archive-video', this.playArchiveVideo);
                if (this.security.Permissions[WebPage.Video].DeleteUndelete) {
                    $('#archivedBody').on('click', '.delete-archive-video', this.deleteArchiveVideo);
                }
                $('#refreshArchives').on('click', this.RefreshArchives);
            });
		}

		private CurrentArchiveId: string = null;

	    private RefreshArchives = () => {
            $('#archivedVideos').html('<span>Loading Videos</span><div class="loading-dots"><div class="circle"></div><div class="circle"></div><div class="circle"></div></div>');
            this.GetArchivesForClaim();
        }

	    public SetupArchiveList = (archiveList: any[]) => {

			if (!archiveList) {
				archiveList = [];
			}
		    var $archivedVideos = $('#archivedVideos');
            $archivedVideos.html('');
            let thumbCount: number;
            for (let video of archiveList) {
                ++thumbCount;

                const $image = $('<img />');
                $image.attr('src', 'data:image/png;base64, ' + video.thumbnailBase64);
                $image.attr('alt', 'archive_video_' + thumbCount);
                $image.addClass('img-thumbnail');

                const $playBtn = $('<button class="btn btn-default play-archive-video"><i class="fas fa-play-circle"></i> Play</button>');
                $playBtn.attr('data-url', video.url);
                let $deleteBtn: JQuery = null;

                $deleteBtn =
                    $('<button class="btn btn-default delete-archive-video disabled"><i class="fas fa-minus-circle"></i> Delete</button>');
                if (this.security.Permissions[WebPage.Video] && this.security.checkPermission(WebPage.Video, Permissions.DeleteUndelete)) {
                    $deleteBtn.removeClass('disabled');
                }
                $deleteBtn.attr('id', 'delete' + video.id);


                const $caption = $('<div class="caption">');
                const $captureDate = $('<div>').text(moment(video.date).local().format('L LTS'));
                const $column = $('<div class="col-md-4">');
                const $parent = $('<div class="thumbnail">');

                $caption.append($captureDate, $playBtn, $deleteBtn);

                $parent.append($image, $caption);

                $column.append($parent);

                var $lastRow = $archivedVideos.find('.row:last');
		        if (!$lastRow.length || $lastRow.find('.col-md-4').length >= 3) {
		            $archivedVideos.append('<div class="row pad">');
                    $lastRow = $archivedVideos.find('.row:last');
		        }

		        $lastRow.append($column);
            }
        };

        private playArchiveVideo = (e: JQueryEventObject) =>
        {
            let url = $(e.target).attr('data-url');
            window.open(url);
        }

        private deleteArchiveVideo = (e: JQueryEventObject) => {
            let $thumbnailDiv = $(e.target).closest('.thumbnail');
            let archiveId = $(e.target).attr('id').replace('delete', '');

            $('#confirm').modal()
                .one('click', '#delete', (e) => {
                    $thumbnailDiv.append('<div class="project-overlay">Deleting...</div><div class="loading-dots"><div class="circle"></div><div class="circle"></div><div class="circle"></div></div>');
                    this.DeleteArchive(archiveId);
                });


            //TODO: Delete call
        }
		public SetArchiveId = (archiveId: string) => {
			this.CurrentArchiveId = archiveId;

			if (!this.CurrentArchiveId) {
				$("#archiveId").html("Not Archiving");
				$("#stopRecordingButton").hide();
				$("#recordButton").show();

			} else if (!!this.CurrentArchiveId) {
				$("#archiveId").html(this.CurrentArchiveId);
				$("#stopRecordingButton").show();
				$("#recordButton").hide();
			}
		};

		public GetArchiveId = () => {
			return this.CurrentArchiveId;
		};

        public DeleteArchive = (archiveId: string) => {
            $.post(this.UrlManager.DeleteArchive(), {
                ClaimId: $('#hidClaimId').val(),
                ArchiveId: archiveId
            }).done((response: string) => {
                this.GetArchivesForClaim();
            });
        }

		public StartRecording = () => {
			if (this.SessionManager.GetSessionId()) {
				$.get(this.UrlManager.StartArchive(), {
					sessionId: this.SessionManager.GetSessionId()
                }).done((archiveId: string) => {
                    this.startVideoTimer(archiveId);
					this.SetArchiveId(archiveId);
				});
			}
        };

        startVideoTimer = (archiveId: string) => {
            const checkJustBeforeFiveMinutesLeft: number = 1499000;
            const maxVideoLength = moment.duration(30, 'minutes');
            this.archiveLengths[archiveId] = moment().add(maxVideoLength).toDate();

            //Start check loop just before 5 minute mark
            this.archiveTimerId = setTimeout(() => {
                    this.checkVideoTimer(archiveId);
            }, checkJustBeforeFiveMinutesLeft);
            
        }

        checkVideoTimer = (archiveId: string) => {
            const exp = this.archiveLengths[archiveId];
            let checkInverval = 60000;

            if (moment().isBetween(moment(exp).subtract(5, 'minutes'), exp)) {
                $('.archiveLimitMsg').find('.alert-danger').hide();
                $('.archiveLimitMsg').find('.alert-warning').show();

                //Increase loop interval when one minute left
                if (moment().isAfter(moment(exp).subtract(1, 'minutes'))) {
                    checkInverval = 10000;
                }
            } else if (moment().isAfter(exp)) {
                $('.archiveLimitMsg').find('.alert-danger').show();
                $('.archiveLimitMsg').find('.alert-warning').hide();
                this.StopRecording();
            } else {
                $('.archiveLimitMsg').find('.alert-danger').hide();
                $('.archiveLimitMsg').find('.alert-warning').hide();
            }

            //Repeat check every 10 seconds
            this.archiveTimerId = setTimeout((archiveId: string) => {
                this.checkVideoTimer(archiveId);
            }, checkInverval, archiveId);

        }

        public StopRecording = (): JQueryPromise<{}> => {
            let deferred = $.Deferred();
            if (this.archiveTimerId) {
                clearTimeout(this.archiveTimerId);
            }
            if (!this.CurrentArchiveId) {
                deferred.resolve(false);
            } else {
                $.get(this.UrlManager.StopArchive(), {
                    claimId: $('#hidClaimId').val(),
                    archiveId: this.CurrentArchiveId
                }).done(() => {
                    this.SetArchiveId(null);
                });

                var claimId = $('#hidClaimId').val();
                var userId = $('#hidUserId').val();
                var primaryTypeId = $('#hidPrimaryTypeId').val();

                var formData = new FormData();
                formData.append('claimId', claimId);
                formData.append('userId', userId);
                formData.append('primaryTypeId', primaryTypeId);
                formData.append('eventItemId', '38');

                $.ajax({
                    type: "POST",
                    url: "VideoEventHandler.ashx",
                    data: formData,
                    cache: false,
                    contentType: false,
                    processData: false,
                    error: (xhr: any, err: any) => {
                        alert(err);
                    }
                }).then((response: any) => {
                    deferred.resolve(true);
                });
            }
            return deferred.promise();
        };

		public IsRecording = () => {
			return !!this.CurrentArchiveId;
		};

        public GetArchivesForClaim = (): JQueryPromise<any> => {
			return $.get(this.UrlManager.GetArchivesForClaim(), {
				claimId: $('#hidClaimId').val()
			}).done((response: any[]) => {
				this.SetupArchiveList(response);
			});
        };
	}
}
