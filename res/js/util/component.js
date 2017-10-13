class Component {
    constructor() {
        this.eventListeners = {};
    }

    addEventListener(type, handler) {
        this.getListeners(type).push(handler);
    }

    removeEventListener(type, handler) {
        const listeners = this.getListeners(type);
        listeners.splice(listeners.indexOf(handler), 1);
    }

    getListeners(type) {
        if (!this.eventListeners[type])
            this.eventListeners[type] = [];
        return this.eventListeners[type];
    }

    sendEvent(type, argv) {
        this.getListeners(type).forEach((listener) => {
            listener.apply(null, argv);
        })
    }

    setVisible(value) {
        if (this.elem)
            this.elem.classList.toggle("hidden", !value);
    }
}