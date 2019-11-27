class Message extends Component {
    constructor(id, type, time, sender, content, isAnchor) {
        super();

        this.id = id;
        this.type = type;
        this.time = time.replace(" ", "T") + "Z";
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

        const content = MircColorHandler.render(this.content);

        return this.elem = (
            <span className={classes.join(" ")}>
                <span>
                    <span className="invisible" aria-hidden="true">[</span>
                    <time dateTime={this.time}>{this.formatTime()}</time>
                    <span className="invisible" aria-hidden="true">]</span>
                </span>
                <span className="container">
                    <span className="sender" data-sendercolor={SenderColorHandler.nickToColor(this.getNick())}>
                        <span className="invisible" aria-hidden="true"> &lt;</span>
                        {this.getNick()}
                        <span className="invisible" aria-hidden="true">&gt; </span>
                    </span>
                    <span className="content">
                        {content.length ? content : null}
                    </span>
                </span>
                {this.isAnchor ? (
                    <a className="more icon" role="button" aria-label={translation.context.show_hide} onClick={() => this.sendEvent("focus", [])}>list</a>
                ) : null}
                <br/>
            </span>
        );
    }

    formatTime() {
        const dateFormat = Storage.exists('dateformat') ? Storage.get('dateformat') : 'L';
        const timeFormat = Storage.exists('timeformat') ? Storage.get('timeformat') : 'LT';
        const dateTimeFormat = dateFormat + " " + timeFormat;

        return moment(new Date(this.time)).format(dateTimeFormat);
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