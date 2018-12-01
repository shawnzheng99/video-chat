class Controller {
    constructor() {
        this._model = new Model();
        this._view = new View();
    }
    dispatch(action, args) {
        this._actions[action](this, args);
    }
}

Controller.prototype._actions = {
    INIT: (instance, args) => {
        let model = instance._model;
        model.checkSystemRequirements()
            .then(() => {
                model.setDevice();
                return model.extractUrlParam(new URL(window.location.href));
            }).then(channel => {
                return model.requestChannelKey(channel);
            }).then(() => {
                model.initializeClient();
                model.setUpStreamSubscription();
            }).catch(err => {
                console.log("Error: " + err);
                $.get('https://videochat-4711.herokuapp.com/404notfound')
            });
    }
}