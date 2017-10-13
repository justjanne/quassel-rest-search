class LoadMore extends Component {
    constructor(text, eventListener) {
        super();
        this.render(text);
    }

    render(text) {
        return this.elem = (
            <div className="inline-button" onClick={(event) => this.sendEvent("click", [event])}>
                {text}
            </div>
        );
    }
}