class StateHandler extends Component {
    constructor() {
        super();
        window.addEventListener("hashchange", () => {
            this.sendEvent("update", [this.state]);
        });
    }

    init() {
        this.update();
    }

    replace(value) {
        history.replaceState(null, null, "#" + encodeURIComponent(value));
        this.update();
    }

    push(value) {
        history.pushState(null, null, "#" + encodeURIComponent(value));
        this.update();
    }

    update() {
        const oldState = this.state;
        this.state = decodeURIComponent(window.location.hash.substr(1));

        if (this.state !== oldState && this.state !== "")
            this.sendEvent("update", [this.state]);
    }

    clear() {
        this.replace("");
    }
}