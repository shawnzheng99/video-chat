const APP_ID = 'd2b36791e0c342cab25481bcb70ae1e9';

class Model {
    constructor() {
        this._audioSource = null;
        this._videoSource = null;
        this._localStream = null;
        this._channel_key = null;
        this._client = null;
    }

    checkSystemRequirements() {
        return new Promise((resolve, reject) => {
            if (!AgoraRTC.checkSystemRequirements()) {
                reject('Your browser does not support WebRTC!');
            } else {
                resolve();
            }
        });
    }

    setDevice() {
        AgoraRTC.getDevices(devices => {
            for (var i = 0; i !== devices.length; ++i) {
                var device = devices[i];
                if (device.kind === 'audioinput') {
                    let label = device.label;
                    if (label.startsWith('Default')) {
                        this._audioSource = device.deviceId;
                    }
                } else if (device.kind === 'videoinput') {
                    this._videoSource = device.deviceId;
                }
            }
        });
    }

    extractUrlParam(url) {
        return new Promise((resolve, reject) => {
            let roomid = url.searchParams.get("roomid");
            let name = url.searchParams.get("username");
            if (roomid) {
                resolve({
                    roomid: roomid,
                    username: name
                });
            } else {
                reject("Room id required");
            }
        });
    }

    initializeClient(roomid, username) {
        this._client = AgoraRTC.createClient({ mode: 'live' });
        this._client.init(APP_ID, () => {
            console.log("AgoraRTC client initialized");
            this._client.join(this._channel_key, roomid, null, uid => {

                let stream_config = {
                    streamID: uid,
                    audio: false,
                    cameraId: this._videoSource,
                    microphoneId: this._audioSource,
                    video: true,
                    screen: false
                }

                this._localStream = AgoraRTC.createStream(stream_config);
                this._localStream.setVideoProfile('720P_3');

                // The user has granted access to the camera and mic.
                this._localStream.on("accessAllowed", () => {
                    console.log("accessAllowed");
                });
                // The user has denied access to the camera and mic.
                this._localStream.on("accessDenied", () => {
                    console.log("accessDenied");
                });
    
                this._localStream.init(() => {
                    // console.log("getUserMedia successfully");
                    this._localStream.play('agora_local');
                    this._client.publish(this._localStream, err => {
                        console.log("Publish local stream error: " + err);
                    });
                    this._client.on('stream-published', evt => {
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
    }

    setUpStreamSubscription() {
        let channelKey = "";
        this._client.on('error', err => {
            console.log("Got error msg:", err.reason);
            if (err.reason === 'DYNAMIC_KEY_TIMEOUT') {
                this._client.renewChannelKey(channelKey, () => {
                    console.log("Renew channel key successfully");
                }, err => {
                    console.log("Renew channel key failed: ", err);
                });
            }
        });
        this._client.on('stream-added', evt => {
            var stream = evt.stream;
            console.log("Subscribe ", stream);
            this._client.subscribe(stream, err => {
                console.log("Subscribe stream failed", err);
            });
        });
        this._client.on('stream-subscribed', evt => {
            var stream = evt.stream;
            console.log("Subscribe remote stream successfully: " + stream.getId());
            if ($('div#video #agora_remote' + stream.getId()).length === 0) {
                $('div#video').append('<div id="agora_remote' + stream.getId() + '" class="video_div"></div>');
            }
            stream.play('agora_remote' + stream.getId());
        });
        this._client.on('stream-removed', evt => {
            var stream = evt.stream;
            stream.stop();
            $('#agora_remote' + stream.getId()).remove();
            console.log("Remote stream is removed " + stream.getId());
        });
        this._client.on('peer-leave', evt => {
            var stream = evt.stream;
            if (stream) {
                stream.stop();
                $('#agora_remote' + stream.getId()).remove();
                console.log(evt.uid + " leaved from this channel");
            }
        });
    }
}