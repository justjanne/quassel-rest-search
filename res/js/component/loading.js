class Loading {
    constructor() {
        this.render();
    }
    render() {
        return this.elem = function () {
            var $$a = document.createElement('div');
            $$a.setAttribute('class', 'progress');
            var $$b = document.createElement('div');
            $$b.setAttribute('class', 'indeterminate');
            $$a.appendChild($$b);
            return $$a;
        }.call(this);
    }
    show() {
        this.elem.classList.add('visible');
    }
    hide() {
        this.elem.classList.remove('visible');
    }
}