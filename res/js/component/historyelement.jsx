class HistoryElement {
    constructor(query) {
        this.query = query;

        this.render();
        this.elem.addEventListener("click", () => {
            window.location.href = "#"+encodeURIComponent(this.query);
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

    selected(value) {
        this.elem.classList.toggle("selected", value);
    }
}