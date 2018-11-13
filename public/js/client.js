var videoSource = null;
var audioSource = null;
var client, localStream;
const APP_ID = '<APP_ID>';
var channel = '1000';

(() => {
    let url = new URL(window.location.href);
    let roomid = url.searchParams.get("roomid");
    if (roomid) {
        channel = roomid;
    }
})();

if (!AgoraRTC.checkSystemRequirements()) {
    alert("Your browser does not support WebRTC!");
}

(() => {
    var channel_key = null;
    client = AgoraRTC.createClient({ mode: 'live' });
    client.init(APP_ID, () => {
        console.log("AgoraRTC client initialized");
        client.join(channel_key, channel, null, uid => {

            console.log("User " + uid + " join channel successfully");
            let stream_config = {
                streamID: uid,
                audio: true,
                cameraId: videoSource,
                microphoneId: audioSource,
                video: true,
                screen: false
            }
            localStream = AgoraRTC.createStream(stream_config);
            localStream.setVideoProfile('720p_3');

            // The user has granted access to the camera and mic.
            localStream.on("accessAllowed", () => {
                console.log("accessAllowed");
            });
            // The user has denied access to the camera and mic.
            localStream.on("accessDenied", () => {
                console.log("accessDenied");
            });

            localStream.init(() => {
                console.log("getUserMedia successfully");
                localStream.play('agora_local');
                client.publish(localStream, function (err) {
                    console.log("Publish local stream error: " + err);
                });
                client.on('stream-published', function (evt) {
                    console.log("Publish local stream successfully");
                });
            }, (err) => {
                console.log("getUserMedia failed", err);
            });
        }, (err) => {
            console.log("Join channel failed", err);
        });
    }, (err) => {
        console.log("AgoraRTC client init failed", err);
    });

    channelKey = "";
    client.on('error', err => {
        console.log("Got error msg:", err.reason);
        if (err.reason === 'DYNAMIC_KEY_TIMEOUT') {
            client.renewChannelKey(channelKey, function () {
                console.log("Renew channel key successfully");
            }, function (err) {
                console.log("Renew channel key failed: ", err);
            });
        }
    });
    client.on('stream-added', evt => {
        var stream = evt.stream;
        console.log("New stream added: " + stream.getId());
        console.log("Subscribe ", stream);
        client.subscribe(stream, err => {
            console.log("Subscribe stream failed", err);
        });
    });
    client.on('stream-subscribed', evt => {
        var stream = evt.stream;
        console.log("Subscribe remote stream successfully: " + stream.getId());
        if ($('div#video #agora_remote' + stream.getId()).length === 0) {
            $('div#video').append('<div id="agora_remote' + stream.getId() + '" style="float:left; width:810px;height:607px;display:inline-block;"></div>');
        }
        stream.play('agora_remote' + stream.getId());
    });
    client.on('stream-removed', evt => {
        var stream = evt.stream;
        stream.stop();
        $('#agora_remote' + stream.getId()).remove();
        console.log("Remote stream is removed " + stream.getId());
    });
    client.on('peer-leave', evt => {
        var stream = evt.stream;
        if (stream) {
            stream.stop();
            $('#agora_remote' + stream.getId()).remove();
            console.log(evt.uid + " leaved from this channel");
        }
    });
})();

(() => {
    AgoraRTC.getDevices(devices => {
        for (var i = 0; i !== devices.length; ++i) {
            var device = devices[i];
            if (device.kind === 'audioinput') {
                let label = device.label;
                if (label.startsWith('Default')) {
                    audioSource = device.deviceId;
                }
            } else if (device.kind === 'videoinput') {
                videoSource = device.deviceId;
            }
        }
    });
})();



