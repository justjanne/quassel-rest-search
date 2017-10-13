class NoHistoryElement {
    constructor() {
        this.render();
    }

    render() {
        return this.elem = (
            <p>{translation.history.error_unavailable}</p>
        );
    }
}