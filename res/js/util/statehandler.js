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
        function split(str, sep, n) {
            const out = [];
            let lastIndex = 0;
            let index;
            while (n-- > 1 && (index = str.indexOf(sep, lastIndex)) >= 0) {
                out.push(str.slice(lastIndex, index));
                lastIndex = index + sep.length;
            }
            out.push(str.slice(lastIndex));
            return out;
        }

        let query = [];
        const words = this.state.split(" ");
        words.forEach((word) => {
            const parts = split(word, ":", 2);
            console.log(parts);
            if ([
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