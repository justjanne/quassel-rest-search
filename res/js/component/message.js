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
        const classes = ['message'];
        if ((this.type & 2) !== 0)
            classes.push('notice');
        if ((this.type & 4) !== 0)
            classes.push('action');
        const content = MircColorHandler.render(this.content);
        return this.elem = function () {
            var $$a = document.createElement('span');
            $$a.setAttribute('class', classes.join(' '));
            var $$b = document.createElement('div');
            $$b.setAttribute('class', 'hidden');
            $$a.appendChild($$b);
            $$b.appendChildren(JSON.stringify(MircColorHandler.render(this.content)));
            var $$d = document.createElement('span');
            $$a.appendChild($$d);
            var $$e = document.createElement('time');
            $$d.appendChild($$e);
            $$e.appendChildren(this.formatTime());
            var $$g = document.createElement('span');
            $$g.setAttribute('class', 'container');
            $$a.appendChild($$g);
            var $$h = document.createElement('span');
            $$h.setAttribute('class', 'sender');
            $$h.setAttribute('data-sendercolor', SenderColorHandler.nickToColor(this.getNick()));
            $$g.appendChild($$h);
            var $$i = document.createElement('span');
            $$i.setAttribute('class', 'invisible');
            $$h.appendChild($$i);
            var $$j = document.createTextNode(' <');
            $$i.appendChild($$j);
            $$h.appendChildren(this.getNick());
            var $$l = document.createElement('span');
            $$l.setAttribute('class', 'invisible');
            $$h.appendChild($$l);
            var $$m = document.createTextNode('> ');
            $$l.appendChild($$m);
            var $$n = document.createElement('span');
            $$n.setAttribute('class', 'content');
            $$g.appendChild($$n);
            $$n.appendChildren(content.length ? content : null);
            $$a.appendChildren(this.isAnchor ? function () {
                var $$q = document.createElement('a');
                $$q.setAttribute('class', 'more icon');
                $$q.addEventListener('click', () => this.sendEvent('focus', []));
                var $$r = document.createTextNode('list');
                $$q.appendChild($$r);
                return $$q;
            }.call(this) : null);
            var $$s = document.createElement('br');
            $$a.appendChild($$s);
            return $$a;
        }.call(this);
    }
    formatTime() {
        const dateFormat = Storage.exists('dateformat') ? Storage.get('dateformat') : 'L';
        const timeFormat = Storage.exists('timeformat') ? Storage.get('timeformat') : 'LT';
        const dateTimeFormat = dateFormat + ' ' + timeFormat;
        return moment(new Date(this.time.replace(' ', 'T') + 'Z')).format(dateTimeFormat);
    }
    getNick() {
        return this.sender.split('!')[0];
    }
    getIdent() {
        return this.sender.split('@')[0].split('!')[1];
    }
    getHost() {
        return this.sender.split('@')[1];
    }
}