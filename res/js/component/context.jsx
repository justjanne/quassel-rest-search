class Context extends Component {
    constructor(message, beforeList = [], afterList = []) {
        super();

        this.message = message;
        this.beforeList = beforeList;
        this.afterList = afterList;

        this.render();
        this.insertAfterTarget = this.loadAfterBtn.elem;
        this.beforeList.forEach((it) => this.insertBefore(it));
        this.afterList.forEach((it) => this.insertAfter(it));

        this.message.addEventListener("focus", () => this.focus());

        this.anchorBefore = this.message.id;
        this.anchorAfter = this.message.id;

        this.loading = false;
    }

    render() {
        return this.elem = (
            <span className="context">
                {this.containerBefore = (
                    <span className="container before">
                        {(this.loadBeforeBtn = new LoadMore(translation.context.load_earlier, () => this.triggerLoadBefore())).elem}
                    </span>
                )}
                {this.message.elem}
                {this.containerAfter = (
                    <span className="container after">
                        {(this.loadAfterBtn = new LoadMore(translation.context.load_later, () => this.triggerLoadAfter())).elem}
                    </span>
                )}
            </span>
        );
    }

    focus(focus) {
        if (focus === undefined)
            focus = !this.elem.classList.contains("focus");

        if (this.anchorBefore === this.message.id && this.anchorAfter === this.message.id) {
            this.triggerLoadInitial();
        }

        this.elem.classList.toggle("focus", focus);
        this.sendEvent("focus", focus);
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

    triggerLoadBefore() {
        this.sendEvent("loadBefore", [this]);
    }

    triggerLoadAfter() {
        this.sendEvent("loadAfter", [this]);
    }

    triggerLoadInitial() {
        this.sendEvent("loadInitial", [this]);
    }

    loadBefore(elements) {
        this.beforeList = elements.concat(this.beforeList);
        elements.forEach((it) => this.insertBefore(it));
    }

    loadAfter(elements) {
        this.afterList = elements.concat(this.afterList);
        elements.forEach((it) => this.insertAfter(it));
    }

    setLoading(value) {
        // Add UI indicator
        this.loading = value;
    }
}