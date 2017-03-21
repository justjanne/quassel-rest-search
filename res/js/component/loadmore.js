class LoadMore extends Component {
    constructor(text) {
        super();
        const button = document.createElement("div");
            button.classList.add("inline-button");
            button.addEventListener("click", (event) => this.sendEvent("click", [event]));
            const buttonValue = document.createTextNode(text);
            button.appendChild(buttonValue);
        this.elem = button;
    }
}