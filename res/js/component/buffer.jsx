class Buffer extends Component {
    constructor(id, name, network, hasMore, contextList = []) {
        super();

        this.id = id;
        this.name = name;
        this.network = network;
        this.contextList = contextList;

        this.render();
        this.contextList.forEach((context) => this.insert(context));
        this.loadMoreBtn.setVisible(hasMore);
    }

    render() {
        return this.elem = (
            <div className="buffer">
                <div className="title">
                    <h2>{this.network} – {this.name}</h2>
                    <button onClick={() => this.focus()}>
                        <span className="open">{translation.buffer.open}</span>
                        <span className="close">{translation.buffer.close}</span>
                    </button>
                </div>
                <div className="container">
                    {this.insertContainerFirst = (
                        <div className="primary"/>
                    )}
                    {this.insertContainer = (
                        <div className="secondary">
                        </div>
                    )}
                    {(this.loadMoreBtn = new LoadMore(translation.results.show_more, this.loadMore)).elem}
                </div>
            </div>
        );
    }

    loadMore() {
        /* load data */
    }

    focus(focus) {
        if (focus === undefined)
            focus = !this.elem.classList.contains("focus");

        this.elem.classList.toggle("focus", focus);
        this.sendEvent("focus", focus);
    }

    insert(context) {
        let container = (this.insertContainerFirst.childElementCount < 4 ? this.insertContainerFirst : this.insertContainer);
        container.appendChild(context.elem);
    }
}