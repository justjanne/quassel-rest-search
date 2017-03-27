class Buffer extends Component {
    constructor(id, name, network, contextList = []) {
        super();

        this.id = id;
        this.name = name;
        this.network = network;
        this.contextList = contextList;

        this.render();
        this.contextList.forEach((context) => this.insert(context));
    }

    render() {
        return this.elem = (
            <div className="buffer">
                <div className="title">
                    <h2>{this.network} – {this.name}</h2>
                    <button onClick={() => this.selected()}/>
                </div>
                {this.insertContainer = (
                    <div className="container">
                        {(this.loadMoreBtn = new LoadMore(translation.results.show_more, this.loadMore)).elem}
                    </div>
                )}
            </div>
        );
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