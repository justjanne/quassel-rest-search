class Error {
    constructor(text) {
        this.render(text);
    }
    render(text) {
        return this.elem = function () {
            var $$a = document.createElement('div');
            $$a.setAttribute('class', 'error');
            var $$b = document.createElement('img');
            $$b.setAttribute('src', 'res/icons/error.png');
            $$a.appendChild($$b);
            var $$c = document.createElement('h1');
            $$a.appendChild($$c);
            $$c.appendChildren(text);
            return $$a;
        }.call(this);
    }
}