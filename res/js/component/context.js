class Context {
    constructor(preview, beforeList=[], afterList=[]) {
        this.preview = preview;
        this.beforeList = beforeList;
        this.afterList = afterList;

        this.render();
    }

    render() {
        const context = document.createElement("div");
            context.classList.add("context");
            const containerBefore = document.createElement("div");
                containerBefore.classList.add("container");
                containerBefore.classList.add("before");
                const loadBeforeBtn = new LoadMore(translation.context.load_earlier);
                loadBeforeBtn.addEventListener("click", this.loadBefore);
                containerBefore.appendChild(loadBeforeBtn.elem);
            context.appendChild(containerBefore);
        
            context.appendChild(this.preview.elem);
        
            const containerAfter = document.createElement("div");
                containerAfter.classList.add("container");
                containerAfter.classList.add("after");
                const loadAfterBtn = new LoadMore(translation.context.load_later);
                loadAfterBtn.addEventListener("click", this.loadAfter);
                containerAfter.appendChild(loadAfterBtn.elem);
            context.appendChild(containerAfter);
        this.elem = context;
        this.containerBefore = containerBefore;
        this.loadBeforeBtn = loadBeforeBtn;
        this.containerAfter = containerAfter;
        this.loadAfterBtn = loadAfterBtn;
        
        this.beforeList.forEach(this.insertBefore);
        this.afterList.forEach(this.insertAfter);
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