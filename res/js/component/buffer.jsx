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

        this.loading = false;
    }

    render() {
        this.elem = (
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
                    {(this.loadMoreBtn = new LoadMore(translation.results.show_more)).elem}
                </div>
            </div>
        );
        this.loadMoreBtn.addEventListener("click", () => this.loadMore());
        return this.elem;
    }

    count() {
        return this.contextList.length
    }

    loadMore() {
        this.sendEvent("loadMore", [])
    }

    focus(focus) {
        if (focus === undefined)
            focus = !this.elem.classList.contains("focus");

        this.elem.classList.toggle("focus", focus);
        this.sendEvent("focus", focus);

        if (focus === false) {
            const bottomVisible = this.elem.offsetTop - this.insertContainerFirst.offsetTop + 20 + this.insertContainerFirst.offsetHeight;
            const fullyVisible = this.elem.offsetTop - this.insertContainerFirst.offsetTop + 20;
            const targetPosition = window.scrollY - this.insertContainer.offsetHeight;
            window.scrollTo(0, (targetPosition > bottomVisible - 56) ? fullyVisible : targetPosition);
        }
    }

    load(resultSet) {
        resultSet.results
            .map((msg) => new Context(new Message(msg.messageid, msg.time, msg.sender, msg.message)))
            .forEach((context) => {
                this.contextList.push(context);
                this.insert(context)
            });
        this.hasMore = resultSet.hasmore;
        this.loadMoreBtn.setVisible(this.hasMore);
    }

    insert(context) {
        let container = (this.insertContainerFirst.childElementCount < 4 ? this.insertContainerFirst : this.insertContainer);
        container.appendChild(context.elem);
    }

    setLoading(value) {
        // Add UI indicator
        this.loading = value;
    }
}