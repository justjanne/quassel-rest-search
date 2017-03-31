class HistoryElement {
    constructor(query) {
        this.query = query;
        this.render();
        this.elem.addEventListener('mousedown', event => {
            statehandler.replace(this.query);
            event.preventDefault();
        });
    }
    render() {
        return this.elem = function () {
            var $$a = document.createElement('li');
            var $$b = document.createElement('span');
            $$b.setAttribute('class', 'icon');
            $$a.appendChild($$b);
            var $$c = document.createTextNode('history');
            $$b.appendChild($$c);
            $$a.appendChildren(this.query);
            return $$a;
        }.call(this);
    }
    focus(focus) {
        this.elem.classList.toggle('focus', focus);
    }
}