class Error {
    constructor(text) {
        this.render(text);
    }

    render(text) {
        return this.elem = (
            <div className="error">
                <img src="res/icons/error.png"/>
                <h1>{text}</h1>
            </div>
        );
    }
}