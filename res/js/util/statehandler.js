class StateHandler extends Component {
    constructor() {
        super();
        this.state = null;
        window.addEventListener("hashchange", () => {
            this.update()
        });
    }

    init() {
        this.update();
    }

    replace(value) {
        history.replaceState(null, "", "#" + encodeURIComponent(value));
        this.update();
    }

    push(value) {
        history.pushState(null, "", "#" + encodeURIComponent(value));
        this.update();
    }

    update() {
        const oldState = this.state;
        this.state = decodeURIComponent(window.location.hash.substr(1));

        if (this.state !== oldState && this.state.length > 0)
            this.sendEvent("update", [this.state]);
    }

    clear() {
        this.replace("");
    }
}