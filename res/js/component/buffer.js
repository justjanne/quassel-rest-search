class Buffer {
    constructor(id, name, network, contextList = []) {
        this.id = id;
        this.name = name;
        this.network = network;
        this.contextList = contextList;

        this.render();
    }

    render() {
        const buffer = document.createElement("div");
            buffer.classList.add("buffer");
            const title = document.createElement("h2");
                title.classList.add("title");
                const titleValue = document.createTextNode(this.network + " - " + this.name);
                title.appendChild(titleValue);
            buffer.appendChild(title);
            const contextWrap = document.createElement("div");
                contextWrap.classList.add("container");
                const loadMoreBtn = new LoadMore(translation.results.show_more);
                loadMoreBtn.addEventListener("click", this.loadMore);
                contextWrap.appendChild(loadMoreBtn.elem);
            buffer.appendChild(contextWrap);
        this.elem = buffer;
        this.insertContainer = contextWrap;
        this.loadMoreBtn = loadMoreBtn;

        this.contextList.forEach((context) => this.insert(context));
    }

    loadMore() {
        /* load data */
    }

    insert(context) {
        this.insertContainer.insertBefore(context.elem, this.loadMoreBtn.elem);
    }
}