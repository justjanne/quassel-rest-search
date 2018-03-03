const statehandler = new StateHandler();

class App {
    constructor() {
        this.navigation = new Navigation();
        this.buffers = [];

        this.loadingQuery = 0;

        if (Storage.exists('language')) {
            moment.locale(Storage.get('language'));
        }

        this.render();
        this.navigation.addEventListener("search", (query) => {
            this.search(query)
        });
        statehandler.addEventListener("update", (query) => {
            this.search(query)
        });
        statehandler.init();
    }

    render() {
        this.elem = <div>
            {this.navigation.elem}
            {this.resultContainer = <div className="results"/>}
        </div>;

        this.buffers.forEach((buffer) => this.insert(buffer));
    }

    search(query, sender, buffer, network, before, since) {
        this.clear();
        this.navigation.input.blur();
        this.navigation.historyView.resetNavigation();
        this.navigation.historyView.add(new HistoryElement(query));
        this.navigation.input.value = query;
        statehandler.replace(query, sender, buffer, network, before, since);

        if (query.trim() === "")
            return;

        this.loadingQuery++;
        const queryId = this.loadingQuery;
        load("web/search/", statehandler.parse()).then((result) => {
            if (this.loadingQuery !== queryId)
                return;

            this.buffers = result.map((buffer) => {
                return new Buffer(buffer.bufferid, buffer.buffername, buffer.networkname, buffer.hasmore, buffer.messages.map((msg) => {
                    return new Context(new Message(msg.messageid, msg.time, msg.sender, msg.message, true));
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
        buffer.addEventListener("loadMore", () => this.bufferLoadMore(buffer));
        buffer.addEventListener("loadBefore", (context, initialLoad) => {
            this.contextLoadBefore(buffer, context, initialLoad);
        });
        buffer.addEventListener("loadAfter", (context, initialLoad) => {
            this.contextLoadAfter(buffer, context, initialLoad);
        });
    }

    bufferLoadMore(buffer) {
        if (buffer.loading)
            return;

        buffer.setLoading(true);
        const offset = buffer.count();
        console.log(offset);
        load("web/searchbuffer/", statehandler.parse({buffer: buffer.id, offset: offset})).then((result) => {
            buffer.load(result);
            buffer.setLoading(false);
        });
    }

    contextLoadBefore(buffer, context, initialLoad) {
        if (context.loading && initialLoad !== true)
            return;

        context.setLoading(true);
        const amount = initialLoad ? 4 : 10;
        load("web/backlog/", statehandler.parse({
            buffer: buffer.id,
            anchor: context.anchorBefore,
            after: 0,
            before: amount
        })).then((result) => {
            context.loadBefore(result.map((msg) => new Message(msg.messageid, msg.time, msg.sender, msg.message)));
            context.setLoading(false);
        });
    }

    contextLoadAfter(buffer, context, initialLoad) {
        if (context.loading && initialLoad !== true)
            return;

        context.setLoading(true);
        const amount = initialLoad ? 4 : 10;
        load("web/backlog/", statehandler.parse({
            buffer: buffer.id,
            anchor: context.anchorAfter,
            after: amount,
            before: 0
        })).then((result) => {
            context.loadAfter(result.map((msg) => new Message(msg.messageid, msg.time, msg.sender, msg.message)));
            context.setLoading(false);
        });
    }
}

const app = new App();
document.body.insertBefore(app.elem, document.body.firstChild);