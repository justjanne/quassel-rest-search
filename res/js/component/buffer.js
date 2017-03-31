class Buffer extends Component {
    constructor(id, name, network, contextList = []) {
        super();
        this.id = id;
        this.name = name;
        this.network = network;
        this.contextList = contextList;
        this.render();
        this.contextList.forEach(context => this.insert(context));
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
            $$a.appendChildren(this.insertContainer = function () {
                var $$m = document.createElement('div');
                $$m.setAttribute('class', 'container');
                $$m.appendChildren((this.loadMoreBtn = new LoadMore(translation.results.show_more, this.loadMore)).elem);
                return $$m;
            }.call(this));
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
        this.insertContainer.insertBefore(context.elem, this.loadMoreBtn.elem);
    }
}