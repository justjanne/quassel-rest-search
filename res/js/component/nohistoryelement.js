class NoHistoryElement {
    constructor() {
        this.render();
    }
    render() {
        return this.elem = function () {
            var $$a = document.createElement('p');
            $$a.appendChildren(translation.history.error_unavailable);
            return $$a;
        }.call(this);
    }
}