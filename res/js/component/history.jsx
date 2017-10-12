const HISTORY_KEY = "history";
const HISTORY_MAX_LENGTH = 4;

class HistoryView {
    constructor() {
        this.index = -1;

        this.elements = this.load().map(function (query) {
            return new HistoryElement(query);
        });

        this.render();
        this.insert(this.elements);
    }

    render() {
        return this.elem = (
            <div className="history">
                {this.list = (
                    <ul>
                        {(this.noHistory = new NoHistoryElement()).elem}
                    </ul>
                )}
            </div>
        );
    }

    insert(items) {
        if (!(items instanceof Array))
            return this.insert([items]);

        const anchor = this.list.firstChild;
        items.forEach(item => this.list.insertBefore(item.elem, anchor));
        if (items.length && this.noHistory.elem.parentNode === this.list)
            this.list.removeChild(this.noHistory.elem);
    }

    add(item) {
        if (item.query === "")
            return;

        const idx = this.elements.map((item) => item.query).indexOf(item.query);
        if (idx !== -1) {
            this.list.removeChild(this.elements[idx].elem);
            this.elements.splice(idx, 1);
        }

        this.elements.unshift(item);
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
        return JSON.parse(loaded === undefined ? "[]" : loaded);
    }

    store() {
        localStorage[HISTORY_KEY] = JSON.stringify(this.elements.map((item) => item.query));
    }

    navigateBefore() {
        if (this.elements[this.index])
            this.elements[this.index].focus(false);

        this.index++;
        this.index %= this.elements.length;

        if (this.elements[this.index])
            this.elements[this.index].focus(true);

        console.log(this.index);
    }

    navigateLater() {
        if (this.elements[this.index])
            this.elements[this.index].focus(false);

        this.index--;
        if (this.index < 0)
            this.index = -1;
        else
            this.index %= this.elements.length;

        if (this.elements[this.index])
            this.elements[this.index].focus(true);

        console.log(this.index);
    }

    resetNavigation() {
        if (this.elements[this.index])
            this.elements[this.index].focus(false);

        this.index = -1;
    }

    truncate() {
        while (this.elements.length > HISTORY_MAX_LENGTH)
            this.list.removeChild(this.elements.shift().elem);
    }
}