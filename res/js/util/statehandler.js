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
        if (this.state.length > 0 || value === this.state)
            history.replaceState(null, "", "#" + encodeURIComponent(value));
        else
            history.pushState(null, "", "#" + encodeURIComponent(value));
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

    parse(options = {}) {
        let query = [];
        const words = this.state.split(" ");
        words.forEach((word) => {
            const parts = word.split(":");
            if (parts.length === 2 && [
                    "sender",
                    "buffer",
                    "network",
                    "before",
                    "since"
                ].includes(parts[0])) {
                options[parts[0]] = parts[1];
            } else {
                query.push(word);
            }
        });
        return {
            ...options,
            query: query.join(" ")
        }
    }

    clear() {
        this.replace("");
    }
}