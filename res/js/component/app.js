const statehandler = new StateHandler();
class App {
    constructor() {
        this.navigation = new Navigation();
        this.buffers = [];
        this.loadingQuery = 0;
        this.error = null;
        if (Storage.exists('language')) {
            moment.locale(Storage.get('language'));
        }
        this.render();
        this.navigation.addEventListener('search', query => {
            this.search(query);
        });
        statehandler.addEventListener('update', query => {
            this.search(query);
        });
        statehandler.init();
    }
    render() {
        this.elem = function () {
            var $$a = document.createElement('div');
            $$a.appendChildren(this.navigation.elem);
            $$a.appendChildren(this.resultContainer = function () {
                var $$d = document.createElement('div');
                $$d.setAttribute('class', 'results');
                return $$d;
            }.call(this));
            return $$a;
        }.call(this);
        this.buffers.forEach(buffer => this.insert(buffer));
    }
    search(query, sender, buffer, network, before, since) {
        this.clear();
        this.navigation.loading.show();
        this.navigation.input.blur();
        this.navigation.historyView.resetNavigation();
        this.navigation.historyView.add(new HistoryElement(query));
        this.navigation.input.value = query;
        statehandler.replace(query, sender, buffer, network, before, since);
        if (query.trim() === '')
            return;
        this.loadingQuery++;
        const queryId = this.loadingQuery;
        load('web/search/', statehandler.parse()).then(result => {
            if (this.loadingQuery !== queryId)
                return;
            this.navigation.loading.hide();
            this.buffers = result.map(buffer => {
                return new Buffer(buffer.bufferid, buffer.buffername, buffer.networkname, buffer.hasmore, buffer.messages.map(msg => {
                    return new Context(new Message(msg.messageid, msg.type, msg.time, msg.sender, msg.message, true));
                }));
            });
            this.buffers.forEach(buffer => this.insert(buffer));
            if (this.buffers.length === 0) {
                this.showError(translation.error.none_found);
            }
        });
    }
    clear() {
        while (this.buffers.length) {
            const buffer = this.buffers.pop();
            this.resultContainer.removeChild(buffer.elem);
        }
        if (this.error) {
            this.error = null;
            this.resultContainer.removeChild(this.error.elem);
        }
    }
    clearAll() {
        this.clear();
        this.navigation.historyView.clear();
        statehandler.clear();
    }
    showError(text) {
        this.error = new Error(text);
        this.resultContainer.appendChild(this.error.elem);
    }
    insert(buffer) {
        this.resultContainer.appendChild(buffer.elem);
        buffer.addEventListener('loadMore', () => this.bufferLoadMore(buffer));
        buffer.addEventListener('loadBefore', context => {
            this.contextLoadBefore(buffer, context);
        });
        buffer.addEventListener('loadAfter', context => {
            this.contextLoadAfter(buffer, context);
        });
        buffer.addEventListener('loadInitial', context => {
            this.contextLoadInitial(buffer, context);
        });
    }
    bufferLoadMore(buffer) {
        if (buffer.loading)
            return;
        buffer.setLoading(true);
        const offset = buffer.count();
        console.log(offset);
        load('web/searchbuffer/', statehandler.parse({
            buffer: buffer.id,
            offset: offset
        })).then(result => {
            buffer.load(result);
            buffer.setLoading(false);
        });
    }
    contextLoadBefore(buffer, context) {
        if (context.loading)
            return;
        context.setLoading(true);
        load('web/backlog/', statehandler.parse({
            buffer: buffer.id,
            anchor: context.anchorBefore,
            after: 0,
            before: 10
        })).then(result => {
            context.loadBefore(result.map(msg => new Message(msg.messageid, msg.type, msg.time, msg.sender, msg.message)));
            context.setLoading(false);
        });
    }
    contextLoadAfter(buffer, context) {
        if (context.loading)
            return;
        context.setLoading(true);
        load('web/backlog/', statehandler.parse({
            buffer: buffer.id,
            anchor: context.anchorAfter,
            after: 10,
            before: 0
        })).then(result => {
            context.loadAfter(result.map(msg => new Message(msg.messageid, msg.type, msg.time, msg.sender, msg.message)));
            context.setLoading(false);
        });
    }
    contextLoadInitial(buffer, context) {
        if (context.loading)
            return;
        context.setLoading(true);
        load('web/backlog/', statehandler.parse({
            buffer: buffer.id,
            anchor: context.anchorAfter,
            after: 4,
            before: 4
        })).then(result => {
            const before = result.filter(msg => msg.messageid < context.anchorBefore);
            const after = result.filter(msg => msg.messageid > context.anchorAfter);
            context.loadBefore(before.map(msg => new Message(msg.messageid, msg.type, msg.time, msg.sender, msg.message)));
            context.loadAfter(after.map(msg => new Message(msg.messageid, msg.type, msg.time, msg.sender, msg.message)));
            context.setLoading(false);
        });
    }
}
const app = new App();
document.body.insertBefore(app.elem, document.body.firstChild);