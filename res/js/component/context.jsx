class Context {
    constructor(preview, beforeList=[], afterList=[]) {
        this.preview = preview;
        this.beforeList = beforeList;
        this.afterList = afterList;

        this.render();
        this.insertAfterTarget = this.loadAfterBtn;
        this.beforeList.forEach(this.insertBefore);
        this.afterList.forEach(this.insertAfter);
    }

    render() {
        return this.elem = (
            <div className="context">
                {this.containerBefore = (
                    <div className="container before">
                        {(this.loadBeforeBtn = new LoadMore(translation.context.load_earlier, this.loadBefore)).elem}
                    </div>
                )}
                {this.preview.elem}
                {this.containerAfter = (
                    <div className="container after">
                        {(this.loadAfterBtn = new LoadMore(translation.context.load_later, this.loadAfter)).elem}
                    </div>
                )}
            </div>
        );
    }

    loadBefore() {
        /* load data */
    }

    insertBefore(message) {
        this.containerBefore.insertBefore(message.elem, this.insertBeforeTarget);
        this.insertBeforeTarget = message.elem;
    }

    loadAfter() {
        /* load data */
    }

    insertAfter(message) {
        this.containerAfter.insertBefore(message.elem, this.insertAfterTarget);
    }
}