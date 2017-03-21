class Message {
    constructor(id, time, sender, content) {
        this.id = id;
        this.time = time;
        this.sender = sender;
        this.content = content;

        this.render();
    }

    render() {
        const message = document.createElement("div");
            message.classList.add("message");
            const time = document.createElement("time");
                const timeValue = document.createTextNode(new Date(message.time.replace(" ", "T") + "Z").toLocaleString());
                time.appendChild(timeValue);
            message.appendChild(time);
            const container = document.createElement("div");
                container.classList.add("container");
                const sender = document.createElement("div");
                    sender.classList.add("sender");
                    sender.style.color = senderColorHandler.nickToColor(this.getNick());
                    const senderValue = document.createTextNode(this.getNick());
                    sender.appendChild(senderValue);
                container.appendChild(sender);
                const content = document.createElement("div");
                    content.classList.add("content");
                    mircColorHandler.render(this.content).forEach((elem) => content.appendChild(elem));
                container.appendChild(content);
            message.appendChild(container);
        this.elem = message;
    }

    getNick() {
        return this.sender.split("!")[0];
    }

    getIdent() {
        return this.sender.split("@")[0].split("!")[1];
    }

    getHost() {
        return this.sender.split("@")[1];
    }
}