var videoSource = null;
var audioSource = null;
var client, localStream;
var channel = '1000';

var controller = new Controller();
$(document).ready(() => {
    controller.dispatch('INIT');
});



