class LoadMore extends Component {
    constructor(text, eventListener) {
        super();
        this.render(text);
        if (eventListener)
            this.addEventListener('click', eventListener);
    }
    render(text) {
        return this.elem = function () {
            var $$a = document.createElement('div');
            $$a.setAttribute('class', 'inline-button');
            $$a.addEventListener('click', event => this.sendEvent('click', [event]));
            $$a.appendChildren(text);
            return $$a;
        }.call(this);
    }
}