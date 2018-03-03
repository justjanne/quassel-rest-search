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
        return this.elem = function () {
            var $$a = document.createElement('span');
            $$a.setAttribute('class', classes.join(' '));
            var $$b = document.createElement('span');
            $$a.appendChild($$b);
            var $$c = document.createElement('time');
            $$b.appendChild($$c);
            $$c.appendChildren(this.formatTime());
            var $$e = document.createElement('span');
            $$e.setAttribute('class', 'container');
            $$a.appendChild($$e);
            var $$f = document.createElement('span');
            $$f.setAttribute('class', 'sender');
            $$f.setAttribute('data-sendercolor', SenderColorHandler.nickToColor(this.getNick()));
            $$e.appendChild($$f);
            var $$g = document.createElement('span');
            $$g.setAttribute('class', 'invisible');
            $$f.appendChild($$g);
            var $$h = document.createTextNode(' <');
            $$g.appendChild($$h);
            $$f.appendChildren(this.getNick());
            var $$j = document.createElement('span');
            $$j.setAttribute('class', 'invisible');
            $$f.appendChild($$j);
            var $$k = document.createTextNode('> ');
            $$j.appendChild($$k);
            var $$l = document.createElement('span');
            $$l.setAttribute('class', 'content');
            $$e.appendChild($$l);
            $$l.appendChildren(MircColorHandler.render(this.content));
            $$a.appendChildren(this.isAnchor ? function () {
                var $$o = document.createElement('a');
                $$o.setAttribute('class', 'more icon');
                $$o.addEventListener('click', () => this.sendEvent('focus', []));
                var $$p = document.createTextNode('list');
                $$o.appendChild($$p);
                return $$o;
            }.call(this) : null);
            var $$q = document.createElement('br');
            $$a.appendChild($$q);
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