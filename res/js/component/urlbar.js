class UrlBar extends Component {
    constructor() {
        super();
        window.addEventListener("hashchange", (e) => {
            this.sendEvent("search", [this.get()]);
        });
    }

    set(value) {
        window.location.hash = value;
    }

    init() {
        this.sendEvent("search", [this.get()]);
    }

    get() {
        return decodeURIComponent(window.location.hash.substr(1));
    }

    clear() {
        this.set("");
    }
}