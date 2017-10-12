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
    }
    render() {
        return this.elem = function () {
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
            $$l.appendChildren((this.loadMoreBtn = new LoadMore(translation.results.show_more, this.loadMore)).elem);
            return $$a;
        }.call(this);
    }
    loadMore() {
    }
    focus(focus) {
        if (focus === undefined)
            focus = !this.elem.classList.contains('focus');
        this.elem.classList.toggle('focus', focus);
        this.sendEvent('focus', focus);
    }
    insert(context) {
        let container = this.insertContainerFirst.childElementCount < 4 ? this.insertContainerFirst : this.insertContainer;
        container.appendChild(context.elem);
    }
}