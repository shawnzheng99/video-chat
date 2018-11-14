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
            }).then(({ roomid, username }) => {
                model.initializeClient(roomid, username);
                model.setUpStreamSubscription();
            }).catch(err => {
                console.log("Error: " + err);
            });
    }
}