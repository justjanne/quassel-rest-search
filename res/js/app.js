const statehandler = new StateHandler();

class App {
    constructor() {
        this.navigation = new Navigation();
        this.buffers = [];

        this.loadingQuery = 0;

        this.render();
        this.navigation.addEventListener("search", (query) => this.search(query));
        statehandler.addEventListener("update", (query) => this.search(query));
        statehandler.init();
    }

    render() {
        const wrapper = document.createElement("div");
        wrapper.appendChild(this.navigation.elem);
        const results = document.createElement("div");
        results.classList.add("results");
        wrapper.appendChild(results);
        this.elem = wrapper;
        this.resultContainer = results;

        this.buffers.forEach((buffer) => this.insert(buffer));
    }

    search(query) {
        this.clear();
        this.navigation.input.blur();
        this.navigation.historyView.resetNavigation();
        this.navigation.historyView.add(new HistoryElement(query));
        this.navigation.input.value = query;
        statehandler.replace(query);

        if (query.trim() === "")
            return;

        this.loadingQuery++;
        const queryId = this.loadingQuery;
        load("web/search/", {query: query}).then((result) => {
            if (this.loadingQuery != queryId)
                return;

            this.buffers = result.map((buffer) => {
                return new Buffer(buffer.bufferid, buffer.buffername, buffer.networkname, buffer.hasmore, buffer.messages.map((msg) => {
                    return new Context(new Message(msg.messageid, msg.time, msg.sender, msg.message));
                }));
            });
            this.buffers.forEach((buffer) => this.insert(buffer));
        });
    }

    clear() {
        while (this.buffers.length) {
            const buffer = this.buffers.pop();
            this.resultContainer.removeChild(buffer.elem);
        }
    }

    clearAll() {
        this.clear();
        this.navigation.historyView.clear();
        statehandler.clear();
    }

    insert(buffer) {
        this.resultContainer.appendChild(buffer.elem);
    }
}

const app = new App();
document.body.insertBefore(app.elem, document.body.firstChild);