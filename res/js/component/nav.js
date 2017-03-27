const keyMapping = {
    13: 'Enter',
    27: 'Escape',
    38: 'ArrowUp',
    40: 'ArrowDown'
};
class Navigation extends Component {
    constructor() {
        super();
        this.render();
    }
    render() {
        return this.elem = function () {
            var $$a = document.createElement('div');
            $$a.setAttribute('class', 'nav');
            var $$b = document.createElement('div');
            $$b.setAttribute('class', 'bar');
            $$a.appendChild($$b);
            var $$c = document.createElement('div');
            $$c.setAttribute('class', 'container');
            $$b.appendChild($$c);
            var $$d = document.createElement('div');
            $$d.setAttribute('class', 'searchBar');
            $$c.appendChild($$d);
            var $$e = document.createElement('p');
            $$e.setAttribute('class', 'icon');
            $$d.appendChild($$e);
            var $$f = document.createTextNode('search');
            $$e.appendChild($$f);
            $$d.appendChildren(this.input = function () {
                var $$h = document.createElement('input');
                $$h.setAttribute('class', 'search');
                $$h.setAttribute('placeholder', translation.search);
                $$h.setAttribute('type', 'text');
                $$h.setAttribute('autoComplete', 'off');
                $$h.addEventListener('focus', () => this.elem.classList.add('focus'));
                $$h.addEventListener('blur', () => this.elem.classList.remove('focus'));
                $$h.addEventListener('keydown', e => this.inputKeyDown(e));
                return $$h;
            }.call(this));
            var $$i = document.createElement('div');
            $$i.setAttribute('class', 'actions');
            $$c.appendChild($$i);
            var $$j = document.createElement('a');
            $$j.setAttribute('href', 'login.php?action=logout');
            $$j.setAttribute('title', translation.logout);
            $$j.setAttribute('class', 'icon');
            $$i.appendChild($$j);
            var $$k = document.createTextNode('exit_to_app');
            $$j.appendChild($$k);
            $$a.appendChildren((this.historyView = new HistoryView()).elem);
            return $$a;
        }.call(this);
    }
    inputKeyDown(event) {
        switch (event.key || keyMapping[event.keyCode]) {
        case 'ArrowUp':
            this.historyView.navigateLater();
            event.preventDefault();
            break;
        case 'ArrowDown':
            this.historyView.navigateBefore();
            event.preventDefault();
            break;
        case 'Enter':
            this.sendEvent('search', [this.historyView.index === -1 ? this.input.value : this.historyView.elements[this.historyView.index].query]);
            this.input.blur();
            event.preventDefault();
            break;
        case 'Escape':
            this.input.blur();
            event.preventDefault();
            break;
        }
    }
}