class Buffer extends Component {
    constructor(id, name, network, hasMore, contextList = []) {
        super();
        this.id = id;
        this.name = name;
        this.network = network;
        this.contextList = contextList;
        this.render();
        this.contextList.forEach(context => this.insert(context));
        this.loadMoreBtn.setVisible(hasMore);
        this.loading = false;
    }
    render() {
        this.elem = function () {
            var $$a = document.createElement('div');
            $$a.setAttribute('class', 'buffer');
            var $$b = document.createElement('div');
            $$b.setAttribute('class', 'title');
            $$a.appendChild($$b);
            var $$c = document.createElement('h2');
            $$b.appendChild($$c);
            $$c.appendChildren(this.network);
            var $$e = document.createTextNode(' \u2013 ');
            $$c.appendChild($$e);
            $$c.appendChildren(this.name);
            var $$g = document.createElement('button');
            $$g.addEventListener('click', () => this.focus());
            $$b.appendChild($$g);
            var $$h = document.createElement('span');
            $$h.setAttribute('class', 'open');
            $$g.appendChild($$h);
            $$h.appendChildren(translation.buffer.open);
            var $$j = document.createElement('span');
            $$j.setAttribute('class', 'close');
            $$g.appendChild($$j);
            $$j.appendChildren(translation.buffer.close);
            var $$l = document.createElement('div');
            $$l.setAttribute('class', 'container');
            $$a.appendChild($$l);
            $$l.appendChildren(this.insertContainerFirst = function () {
                var $$n = document.createElement('div');
                $$n.setAttribute('class', 'primary');
                return $$n;
            }.call(this));
            $$l.appendChildren(this.insertContainer = function () {
                var $$p = document.createElement('div');
                $$p.setAttribute('class', 'secondary');
                return $$p;
            }.call(this));
            $$l.appendChildren((this.loadMoreBtn = new LoadMore(translation.results.show_more)).elem);
            return $$a;
        }.call(this);
        this.loadMoreBtn.addEventListener('click', () => this.loadMore());
        return this.elem;
    }
    count() {
        return this.contextList.length;
    }
    loadMore() {
        this.sendEvent('loadMore', []);
    }
    focus(focus) {
        if (focus === undefined)
            focus = !this.elem.classList.contains('focus');
        this.elem.classList.toggle('focus', focus);
        this.sendEvent('focus', focus);
        if (focus === false) {
            const bottomVisible = this.elem.offsetTop - this.insertContainerFirst.offsetTop + 20 + this.insertContainerFirst.offsetHeight;
            const fullyVisible = this.elem.offsetTop - this.insertContainerFirst.offsetTop + 20;
            const targetPosition = window.scrollY - this.insertContainer.offsetHeight;
            window.scrollTo(0, targetPosition > bottomVisible - 56 ? fullyVisible : targetPosition);
        }
    }
    load(resultSet) {
        resultSet.results.map(msg => new Context(new Message(msg.messageid, msg.time, msg.sender, msg.message))).forEach(context => {
            this.contextList.push(context);
            this.insert(context);
        });
        this.hasMore = resultSet.hasmore;
        this.loadMoreBtn.setVisible(this.hasMore);
    }
    insert(context) {
        let container = this.insertContainerFirst.childElementCount < 4 ? this.insertContainerFirst : this.insertContainer;
        container.appendChild(context.elem);
    }
    setLoading(value) {
        this.loading = value;
    }
}