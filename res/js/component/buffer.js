class Buffer extends Component {
    constructor(id, name, network, contextList = []) {
        super();

        this.id = id;
        this.name = name;
        this.network = network;
        this.contextList = contextList;

        this.render();
    }

    render() {
        const buffer = document.createElement("div");
            buffer.classList.add("buffer");
            const title = document.createElement("div");
                title.classList.add("title");
                const titleHeader = document.createElement("h2");
                    const titleValue = document.createTextNode(this.network + " - " + this.name);
                    titleHeader.appendChild(titleValue);
                title.appendChild(titleHeader);
                const toggleButton = document.createElement("button");
                    toggleButton.addEventListener("click", () => {
                        this.selected();
                    });
                title.appendChild(toggleButton);
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

    selected(isSelected) {
        if (isSelected === undefined)
            isSelected = !this.elem.classList.contains("selected");

        this.elem.classList.toggle("selected", isSelected);
        this.sendEvent("expanded", isSelected);
    }

    insert(context) {
        this.insertContainer.insertBefore(context.elem, this.loadMoreBtn.elem);
    }
}