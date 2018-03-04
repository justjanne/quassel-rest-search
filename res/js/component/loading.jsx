class Loading {
    constructor() {
        this.render();
    }

    render() {
        return this.elem = (
            <div className="progress">
                <div className="indeterminate">
                </div>
            </div>
        );
    }

    show() {
        this.elem.classList.add("visible");
    }

    hide() {
        this.elem.classList.remove("visible");
    }
}