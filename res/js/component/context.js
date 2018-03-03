class Context extends Component {
    constructor(message, beforeList = [], afterList = []) {
        super();
        this.message = message;
        this.beforeList = beforeList;
        this.afterList = afterList;
        this.render();
        this.insertAfterTarget = this.loadAfterBtn.elem;
        this.beforeList.forEach(it => this.insertBefore(it));
        this.afterList.forEach(it => this.insertAfter(it));
        this.message.addEventListener('focus', () => this.focus());
        this.anchorBefore = this.message.id;
        this.anchorAfter = this.message.id;
        this.loading = false;
    }
    render() {
        return this.elem = function () {
            var $$a = document.createElement('div');
            $$a.setAttribute('class', 'context');
            $$a.appendChildren(this.containerBefore = function () {
                var $$c = document.createElement('div');
                $$c.setAttribute('class', 'container before');
                $$c.appendChildren((this.loadBeforeBtn = new LoadMore(translation.context.load_earlier, () => this.triggerLoadBefore())).elem);
                return $$c;
            }.call(this));
            $$a.appendChildren(this.message.elem);
            $$a.appendChildren(this.containerAfter = function () {
                var $$g = document.createElement('div');
                $$g.setAttribute('class', 'container after');
                $$g.appendChildren((this.loadAfterBtn = new LoadMore(translation.context.load_later, () => this.triggerLoadAfter())).elem);
                return $$g;
            }.call(this));
            return $$a;
        }.call(this);
    }
    focus(focus) {
        if (focus === undefined)
            focus = !this.elem.classList.contains('focus');
        if (this.anchorBefore === this.message.id && this.anchorAfter === this.message.id) {
            this.triggerLoadBefore(true);
            this.triggerLoadAfter(true);
        }
        this.elem.classList.toggle('focus', focus);
        this.sendEvent('focus', focus);
    }
    insertBefore(message) {
        this.containerBefore.insertBefore(message.elem, this.insertBeforeTarget);
        this.insertBeforeTarget = message.elem;
        this.anchorBefore = message.id;
    }
    insertAfter(message) {
        this.containerAfter.insertBefore(message.elem, this.insertAfterTarget);
        this.anchorAfter = message.id;
    }
    triggerLoadBefore(initialLoad) {
        this.sendEvent('loadBefore', [
            this,
            initialLoad === true
        ]);
    }
    triggerLoadAfter(initialLoad) {
        this.sendEvent('loadAfter', [
            this,
            initialLoad === true
        ]);
    }
    loadBefore(elements) {
        this.beforeList = elements.concat(this.beforeList);
        elements.forEach(it => this.insertBefore(it));
    }
    loadAfter(elements) {
        this.afterList = elements.concat(this.afterList);
        elements.forEach(it => this.insertAfter(it));
    }
    setLoading(value) {
        this.loading = value;
    }
}