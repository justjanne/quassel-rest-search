class Context {
    constructor(message, beforeList = [], afterList = []) {
        this.message = message;
        this.beforeList = beforeList;
        this.afterList = afterList;
        this.render();
        this.insertAfterTarget = this.loadAfterBtn;
        this.beforeList.forEach(this.insertBefore);
        this.afterList.forEach(this.insertAfter);
    }
    render() {
        return this.elem = function () {
            var $$a = document.createElement('div');
            $$a.setAttribute('class', 'context');
            $$a.appendChildren(this.containerBefore = function () {
                var $$c = document.createElement('div');
                $$c.setAttribute('class', 'container before');
                $$c.appendChildren((this.loadBeforeBtn = new LoadMore(translation.context.load_earlier, this.loadBefore)).elem);
                return $$c;
            }.call(this));
            $$a.appendChildren(this.message.elem);
            $$a.appendChildren(this.containerAfter = function () {
                var $$g = document.createElement('div');
                $$g.setAttribute('class', 'container after');
                $$g.appendChildren((this.loadAfterBtn = new LoadMore(translation.context.load_later, this.loadAfter)).elem);
                return $$g;
            }.call(this));
            return $$a;
        }.call(this);
    }
    loadBefore() {
    }
    insertBefore(message) {
        this.containerBefore.insertBefore(message.elem, this.insertBeforeTarget);
        this.insertBeforeTarget = message.elem;
    }
    loadAfter() {
    }
    insertAfter(message) {
        this.containerAfter.insertBefore(message.elem, this.insertAfterTarget);
    }
}