class Message extends Component {
    constructor(id, type, time, sender, content, isAnchor) {
        super();
        this.id = id;
        this.type = type;
        this.time = time.replace(' ', 'T') + 'Z';
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
            var $$b = document.createElement('span');
            $$a.appendChild($$b);
            var $$c = document.createElement('span');
            $$c.setAttribute('class', 'invisible');
            $$c.setAttribute('aria-hidden', 'true');
            $$b.appendChild($$c);
            var $$d = document.createTextNode('[');
            $$c.appendChild($$d);
            var $$e = document.createElement('time');
            $$e.setAttribute('dateTime', this.time);
            $$b.appendChild($$e);
            $$e.appendChildren(this.formatTime());
            var $$g = document.createElement('span');
            $$g.setAttribute('class', 'invisible');
            $$g.setAttribute('aria-hidden', 'true');
            $$b.appendChild($$g);
            var $$h = document.createTextNode(']');
            $$g.appendChild($$h);
            var $$i = document.createElement('span');
            $$i.setAttribute('class', 'container');
            $$a.appendChild($$i);
            var $$j = document.createElement('span');
            $$j.setAttribute('class', 'sender');
            $$j.setAttribute('data-sendercolor', SenderColorHandler.nickToColor(this.getNick()));
            $$i.appendChild($$j);
            var $$k = document.createElement('span');
            $$k.setAttribute('class', 'invisible');
            $$k.setAttribute('aria-hidden', 'true');
            $$j.appendChild($$k);
            var $$l = document.createTextNode(' <');
            $$k.appendChild($$l);
            $$j.appendChildren(this.getNick());
            var $$n = document.createElement('span');
            $$n.setAttribute('class', 'invisible');
            $$n.setAttribute('aria-hidden', 'true');
            $$j.appendChild($$n);
            var $$o = document.createTextNode('> ');
            $$n.appendChild($$o);
            var $$p = document.createElement('span');
            $$p.setAttribute('class', 'content');
            $$i.appendChild($$p);
            $$p.appendChildren(content.length ? content : null);
            $$a.appendChildren(this.isAnchor ? function () {
                var $$s = document.createElement('a');
                $$s.setAttribute('class', 'more icon');
                $$s.setAttribute('role', 'button');
                $$s.setAttribute('aria-label', translation.context.show_hide);
                $$s.addEventListener('click', () => this.sendEvent('focus', []));
                var $$t = document.createTextNode('list');
                $$s.appendChild($$t);
                return $$s;
            }.call(this) : null);
            var $$u = document.createElement('br');
            $$a.appendChild($$u);
            return $$a;
        }.call(this);
    }
    formatTime() {
        const dateFormat = Storage.exists('dateformat') ? Storage.get('dateformat') : 'L';
        const timeFormat = Storage.exists('timeformat') ? Storage.get('timeformat') : 'LT';
        const dateTimeFormat = dateFormat + ' ' + timeFormat;
        return moment(new Date(this.time)).format(dateTimeFormat);
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