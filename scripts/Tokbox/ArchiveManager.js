var tok;
(function (tok) {
    var WebPage = EcsTs.WebPage;
    var Permissions = EcsTs.Permissions;
    var ArchiveManager = /** @class */ (function () {
        function ArchiveManager(SessionManager, UrlManager) {
            var _this = this;
            this.SessionManager = SessionManager;
            this.UrlManager = UrlManager;
            this.archiveLengths = {};
            this.CurrentArchiveId = null;
            this.RefreshArchives = function () {
                $('#archivedVideos').html('<span>Loading Videos</span><div class="loading-dots"><div class="circle"></div><div class="circle"></div><div class="circle"></div></div>');
                _this.GetArchivesForClaim();
            };
            this.SetupArchiveList = function (archiveList) {
                if (!archiveList) {
                    archiveList = [];
                }
                var $archivedVideos = $('#archivedVideos');
                $archivedVideos.html('');
                var thumbCount;
                for (var _i = 0, archiveList_1 = archiveList; _i < archiveList_1.length; _i++) {
                    var video = archiveList_1[_i];
                    ++thumbCount;
                    var $image = $('<img />');
                    $image.attr('src', 'data:image/png;base64, ' + video.thumbnailBase64);
                    $image.attr('alt', 'archive_video_' + thumbCount);
                    $image.addClass('img-thumbnail');
                    var $playBtn = $('<button class="btn btn-default play-archive-video"><i class="fas fa-play-circle"></i> Play</button>');
                    $playBtn.attr('data-url', video.url);
                    var $deleteBtn = null;
                    $deleteBtn =
                        $('<button class="btn btn-default delete-archive-video disabled"><i class="fas fa-minus-circle"></i> Delete</button>');
                    if (_this.security.Permissions[WebPage.Video] && _this.security.checkPermission(WebPage.Video, Permissions.DeleteUndelete)) {
                        $deleteBtn.removeClass('disabled');
                    }
                    $deleteBtn.attr('id', 'delete' + video.id);
                    var $caption = $('<div class="caption">');
                    var $captureDate = $('<div>').text(moment(video.date).local().format('L LTS'));
                    var $column = $('<div class="col-md-4">');
                    var $parent = $('<div class="thumbnail">');
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
            this.playArchiveVideo = function (e) {
                var url = $(e.target).attr('data-url');
                window.open(url);
            };
            this.deleteArchiveVideo = function (e) {
                var $thumbnailDiv = $(e.target).closest('.thumbnail');
                var archiveId = $(e.target).attr('id').replace('delete', '');
                $('#confirm').modal()
                    .one('click', '#delete', function (e) {
                    $thumbnailDiv.append('<div class="project-overlay">Deleting...</div><div class="loading-dots"><div class="circle"></div><div class="circle"></div><div class="circle"></div></div>');
                    _this.DeleteArchive(archiveId);
                });
                //TODO: Delete call
            };
            this.SetArchiveId = function (archiveId) {
                _this.CurrentArchiveId = archiveId;
                if (!_this.CurrentArchiveId) {
                    $("#archiveId").html("Not Archiving");
                    $("#stopRecordingButton").hide();
                    $("#recordButton").show();
                }
                else if (!!_this.CurrentArchiveId) {
                    $("#archiveId").html(_this.CurrentArchiveId);
                    $("#stopRecordingButton").show();
                    $("#recordButton").hide();
                }
            };
            this.GetArchiveId = function () {
                return _this.CurrentArchiveId;
            };
            this.DeleteArchive = function (archiveId) {
                $.post(_this.UrlManager.DeleteArchive(), {
                    ClaimId: $('#hidClaimId').val(),
                    ArchiveId: archiveId
                }).done(function (response) {
                    _this.GetArchivesForClaim();
                });
            };
            this.StartRecording = function () {
                if (_this.SessionManager.GetSessionId()) {
                    $.get(_this.UrlManager.StartArchive(), {
                        sessionId: _this.SessionManager.GetSessionId()
                    }).done(function (archiveId) {
                        _this.startVideoTimer(archiveId);
                        _this.SetArchiveId(archiveId);
                    });
                }
            };
            this.startVideoTimer = function (archiveId) {
                var checkJustBeforeFiveMinutesLeft = 1499000;
                var maxVideoLength = moment.duration(30, 'minutes');
                _this.archiveLengths[archiveId] = moment().add(maxVideoLength).toDate();
                //Start check loop just before 5 minute mark
                _this.archiveTimerId = setTimeout(function () {
                    _this.checkVideoTimer(archiveId);
                }, checkJustBeforeFiveMinutesLeft);
            };
            this.checkVideoTimer = function (archiveId) {
                var exp = _this.archiveLengths[archiveId];
                var checkInverval = 60000;
                if (moment().isBetween(moment(exp).subtract(5, 'minutes'), exp)) {
                    $('.archiveLimitMsg').find('.alert-danger').hide();
                    $('.archiveLimitMsg').find('.alert-warning').show();
                    //Increase loop interval when one minute left
                    if (moment().isAfter(moment(exp).subtract(1, 'minutes'))) {
                        checkInverval = 10000;
                    }
                }
                else if (moment().isAfter(exp)) {
                    $('.archiveLimitMsg').find('.alert-danger').show();
                    $('.archiveLimitMsg').find('.alert-warning').hide();
                    _this.StopRecording();
                }
                else {
                    $('.archiveLimitMsg').find('.alert-danger').hide();
                    $('.archiveLimitMsg').find('.alert-warning').hide();
                }
                //Repeat check every 10 seconds
                _this.archiveTimerId = setTimeout(function (archiveId) {
                    _this.checkVideoTimer(archiveId);
                }, checkInverval, archiveId);
            };
            this.StopRecording = function () {
                var deferred = $.Deferred();
                if (_this.archiveTimerId) {
                    clearTimeout(_this.archiveTimerId);
                }
                if (!_this.CurrentArchiveId) {
                    deferred.resolve(false);
                }
                else {
                    $.get(_this.UrlManager.StopArchive(), {
                        claimId: $('#hidClaimId').val(),
                        archiveId: _this.CurrentArchiveId
                    }).done(function () {
                        _this.SetArchiveId(null);
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
                        error: function (xhr, err) {
                            alert(err);
                        }
                    }).then(function (response) {
                        deferred.resolve(true);
                    });
                }
                return deferred.promise();
            };
            this.IsRecording = function () {
                return !!_this.CurrentArchiveId;
            };
            this.GetArchivesForClaim = function () {
                return $.get(_this.UrlManager.GetArchivesForClaim(), {
                    claimId: $('#hidClaimId').val()
                }).done(function (response) {
                    _this.SetupArchiveList(response);
                });
            };
            this.security = EcsTs.Security.securityFactory();
            this.security.getPermissions().then(function () {
                $('#archivedBody').on('click', '.play-archive-video', _this.playArchiveVideo);
                if (_this.security.Permissions[WebPage.Video].DeleteUndelete) {
                    $('#archivedBody').on('click', '.delete-archive-video', _this.deleteArchiveVideo);
                }
                $('#refreshArchives').on('click', _this.RefreshArchives);
            });
        }
        return ArchiveManager;
    }());
    tok.ArchiveManager = ArchiveManager;
})(tok || (tok = {}));
//# sourceMappingURL=ArchiveManager.js.map