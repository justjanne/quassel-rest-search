const keyMapping = {
    13: "Enter",
    27: "Escape",
    38: "ArrowUp",
    40: "ArrowDown"
};

class Navigation extends Component {
    constructor() {
        super();
        this.render();
    }

    render() {
        const nav = document.createElement("div");
            nav.classList.add("nav");
            const wrapper = document.createElement("div");
                wrapper.classList.add("container");
                const searchBar = document.createElement("div");
                    searchBar.classList.add("searchBar");
                    const searchIcon = document.createElement("div");
                        searchIcon.classList.add("icon");
                        const searchIconValue = document.createTextNode("search");
                        searchIcon.appendChild(searchIconValue);
                    searchBar.appendChild(searchIcon);
                    const input = document.createElement("input");
                        input.classList.add("search");
                        input.placeholder = translation.search;
                        input.type = "text";
                        input.autocomplete = "off";
                        input.addEventListener("focus", () => this.elem.classList.add("focus"));
                        input.addEventListener("blur", () => this.elem.classList.remove("focus"));
                        input.addEventListener("keydown", (e) => {
                            switch (e.key || keyMapping[e.keyCode]) {
                                case "ArrowUp": {
                                    this.historyView.navigateLater();
                                } break;
                                case "ArrowDown": {
                                    this.historyView.navigateBefore();
                                } break;
                                case "Enter": {
                                    this.sendEvent("search", [this.input.value]);
                                    this.input.blur();
                                } break;
                                case "Escape": {
                                    this.input.blur();
                                } break;
                            }
                        });
                    searchBar.appendChild(input);
                wrapper.appendChild(searchBar);
            nav.appendChild(wrapper);
            const actions = document.createElement("div");
                actions.classList.add("actions");
                const logout = document.createElement("a");
                    logout.title = translation.logout;
                    logout.href = "login.php?action=logout";
                    logout.classList.add("icon");
                    const logoutValue = document.createTextNode("exit_to_app");
                    logout.appendChild(logoutValue);
                actions.appendChild(logout);
            nav.appendChild(actions);
            const historyView = new HistoryView();
            nav.appendChild(historyView.elem);
        this.elem = nav;

        this.input = input;
        this.historyView = historyView;
    }
}