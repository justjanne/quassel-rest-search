class HistoryElement {
    constructor(query) {
        this.query = query;
        this.render();
        this.elem.addEventListener('click', () => {
            window.location.href = '#' + encodeURIComponent(this.query);
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
    selected(value) {
        this.elem.classList.toggle('selected', value);
    }
}