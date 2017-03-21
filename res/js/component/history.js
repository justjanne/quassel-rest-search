const HISTORY_KEY = "history";
const HISTORY_MAX_LENGTH = 4;

class HistoryView {
    constructor() {
        this.index = -1;

        this.elements = this.load().map(function (query) {
            return new HistoryElement(query);
        });

        this.render();
    }

    render() {
        const historyView = document.createElement("div");
            historyView.classList.add("history");
            const list = document.createElement("ul");
                const noHistory = new NoHistoryElement();
                list.appendChild(noHistory.elem);
            historyView.appendChild(list);
        this.elem = historyView;
        this.list = list;
        this.noHistory = noHistory;

        this.elements.forEach((elem) => this.insert(elem));
    }

    insert(item) {
        this.list.insertBefore(item.elem, this.list.firstChild);
        if (this.noHistory.elem.parentNode === this.list)
            this.list.removeChild(this.noHistory.elem);
    }

    add(item) {
        if (item.query == "")
            return;

        const idx = this.elements.map((item) => item.query).indexOf(item.query);
        if (idx !== -1) {
            this.list.removeChild(this.elements[idx].elem);
            this.elements.splice(idx, 1);
        }

        this.elements.push(item);
        this.insert(item);

        this.truncate();

        this.store();
    }

    clear() {
        while (this.elements.length) {
            this.list.removeChild(this.elements.pop().elem);
        }
        this.store();
        this.list.appendChild(this.noHistory.elem);
    }

    load() {
        const loaded = localStorage[HISTORY_KEY];
        return JSON.parse(loaded===undefined ? "[]" : loaded);
    }

    store() {
        localStorage[HISTORY_KEY] = JSON.stringify(this.elements.map((item) => item.query));
    }

    navigateBefore() {
        this.index++;
        this.index %= this.elements.length;
    }

    navigateLater() {
        this.index--;
        if (this.index < 0)
            this.index = -1;
        else
            this.index %= this.elements.length;
    }

    truncate() {
        while (this.elements.length > HISTORY_MAX_LENGTH)
            this.list.removeChild(this.elements.shift().elem);
    }
}