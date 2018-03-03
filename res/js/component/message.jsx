class Message extends Component {
    constructor(id, type, time, sender, content, isAnchor) {
        super();

        this.id = id;
        this.type = type;
        this.time = time;
        this.sender = sender;
        this.content = content;
        this.isAnchor = isAnchor;

        this.render();
    }

    render() {
        const classes = ["message"];
        if ((this.type & 0x00000002) !== 0)
            classes.push("notice");
        if ((this.type & 0x00000004) !== 0)
            classes.push("action");

        return this.elem = (
            <span className={classes.join(" ")}>
                <span><time>{this.formatTime()}</time></span>
                <span className="container">
                    <span className="sender" data-sendercolor={SenderColorHandler.nickToColor(this.getNick())}>
                        <span className="invisible"> &lt;</span>
                        {this.getNick()}
                        <span className="invisible">&gt; </span>
                    </span>
                    <span className="content">
                        {MircColorHandler.render(this.content)}
                    </span>
                </span>
                {this.isAnchor ? (
                    <a className="more icon" onClick={() => this.sendEvent("focus", [])}>list</a>
                ) : null}
                <br/>
            </span>
        );
    }

    formatTime() {
        const dateFormat = Storage.exists('dateformat') ? Storage.get('dateformat') : 'L';
        const timeFormat = Storage.exists('timeformat') ? Storage.get('timeformat') : 'LT';
        const dateTimeFormat = dateFormat + " " + timeFormat;

        return moment(new Date(this.time.replace(" ", "T") + "Z")).format(dateTimeFormat);
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