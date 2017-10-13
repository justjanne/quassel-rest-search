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
        return this.elem = (
            <div className="nav">
                <div className="bar">
                    <div className="container">
                        <div className="searchBar">
                            <p className="icon">search</p>
                            {this.input = (
                                <input className="search" placeholder={translation.search} type="search"
                                       autoComplete="off"
                                       onFocus={() => this.elem.classList.add("focus")}
                                       onBlur={() => {
                                           this.elem.classList.remove("focus");
                                           this.historyView.resetNavigation();
                                       }}
                                       onKeyDown={(e) => this.inputKeyDown(e)}
                                />
                            )}
                        </div>
                        <div className="actions">
                            <a href="login.php?action=logout" title={translation.logout}
                               className="icon">exit_to_app</a>
                        </div>
                    </div>
                </div>
                {(this.historyView = new HistoryView()).elem}
            </div>
        );
    }

    inputKeyDown(event) {
        switch (event.key || keyMapping[event.keyCode]) {
            case "ArrowUp":
                this.historyView.navigateLater();
                event.preventDefault();
                break;
            case "ArrowDown":
                this.historyView.navigateBefore();
                event.preventDefault();
                break;
            case "Enter":
                statehandler.replace(this.historyView.index === -1 ? this.input.value : this.historyView.elements[this.historyView.index].query);
                event.preventDefault();
                break;
            case "Escape":
                this.input.blur();
                this.historyView.resetNavigation();
                event.preventDefault();
                break;
        }
    }
}