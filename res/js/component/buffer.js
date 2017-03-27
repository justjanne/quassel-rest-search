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
            $$g.addEventListener('click', () => this.selected());
            $$b.appendChild($$g);
            $$a.appendChildren(this.insertContainer = function () {
                var $$i = document.createElement('div');
                $$i.setAttribute('class', 'container');
                $$i.appendChildren((this.loadMoreBtn = new LoadMore(translation.results.show_more, this.loadMore)).elem);
                return $$i;
            }.call(this));
            return $$a;
        }.call(this);
    }
    loadMore() {
    }
    selected(isSelected) {
        if (isSelected === undefined)
            isSelected = !this.elem.classList.contains('selected');
        this.elem.classList.toggle('selected', isSelected);
        this.sendEvent('expanded', isSelected);
    }
    insert(context) {
        this.insertContainer.insertBefore(context.elem, this.loadMoreBtn.elem);
    }
}