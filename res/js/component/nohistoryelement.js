class NoHistoryElement {
    constructor() {
        this.render();
    }

    render() {
        const wrapper = document.createElement("p");
            const value = document.createTextNode(translation.history.error_unavailable);
            wrapper.appendChild(value);
        this.elem = wrapper;
    }
}