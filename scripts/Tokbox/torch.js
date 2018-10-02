//Test browser support
var SUPPORTS_MEDIA_DEVICES = 'mediaDevices' in navigator;

if (SUPPORTS_MEDIA_DEVICES) {
    //Get the environment camera (usually the second one)
    navigator.mediaDevices.enumerateDevices().then(devices => {

        var cameras = devices.filter((device) => device.kind === 'videoinput');

        if (cameras.length === 0) {
            throw 'No camera found on this device.';
        }
        var camera = cameras[cameras.length - 1];

        // Create stream and get video track
        navigator.mediaDevices.getUserMedia({
            video: {
                deviceId: camera.deviceId,
                facingMode: ['user', 'environment'],
                height: { ideal: 1080 },
                width: { ideal: 1920 }
            }
        }).then(stream => {
            var track = stream.getVideoTracks()[0];
            if (!track) {
            }
            //Create image capture object and get camera capabilities
            var btn = $('.switch');
            try {
                var imageCapture = new ImageCapture(track);
            } catch(ex) {
                btn.hide();
            }

            imageCapture.getPhotoCapabilities().then(() => {

                //todo: check if camera has a torch

                //let there be light!
                var btn = $('.switch');
                var on = false;
                btn.on('click', function () {
                    on = !on;
                    track.applyConstraints({
                        advanced: [{ torch: on }]
                    });
                });
            });
        });
    });

    //The light will be on as long the track exists


}