class MessagePreview {
    constructor(id, time, sender, content, preview) {
        this.id = id;
        this.time = time;
        this.sender = sender;
        this.content = content;
        this.preview = preview;

        this.render();
    }

    render() {
        return this.elem = (
            <div className="message preview">
                <time>{new Date(this.time.replace(" ", "T") + "Z").toLocaleString()}</time>
                <div className="container">
                    <div className="sender" data-sendercolor={SenderColorHandler.nickToColor(this.getNick())}>
                        {this.getNick()}
                    </div>
                    <div className="content">
                        {MircColorHandler.render(this.content)}
                    </div>
                    <div className="preview">
                        {MircColorHandler.highlight(this.preview)}
                    </div>
                </div>
            </div>
        );
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