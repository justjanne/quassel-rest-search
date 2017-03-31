class HistoryElement {
    constructor(query) {
        this.query = query;

        this.render();
        this.elem.addEventListener("mousedown", (event) => {
            statehandler.replace(this.query);
            event.preventDefault();
        });
    }

    render() {
        return this.elem = (
            <li>
                <span className="icon">history</span>
                {this.query}
            </li>
        );
    }

    focus(focus) {
        this.elem.classList.toggle("focus", focus);
    }
}