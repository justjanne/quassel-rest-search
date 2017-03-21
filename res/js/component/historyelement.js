class HistoryElement {
    constructor(query) {
        this.query = query;

        this.render();
    }

    render() {
        const wrapper = document.createElement("li");
            const icon = document.createElement("span");
                icon.classList.add("icon");
                const iconValue = document.createTextNode("history");
                icon.appendChild(iconValue);
            wrapper.appendChild(icon);
            const queryValue = document.createTextNode(this.query);
            wrapper.appendChild(queryValue);
        this.elem = wrapper;
        this.elem.addEventListener("click", () => {
            window.location.href = "#"+encodeURIComponent(this.query);
        })
    }
}