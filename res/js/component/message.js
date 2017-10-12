class Message {
    constructor(id, time, sender, content) {
        this.id = id;
        this.time = time;
        this.sender = sender;
        this.content = content;
        this.render();
    }
    render() {
        return this.elem = function () {
            var $$a = document.createElement('div');
            $$a.setAttribute('class', 'message');
            var $$b = document.createElement('time');
            $$a.appendChild($$b);
            $$b.appendChildren(new Date(this.time.replace(' ', 'T') + 'Z').toUTCString());
            var $$d = document.createElement('div');
            $$d.setAttribute('class', 'container');
            $$a.appendChild($$d);
            var $$e = document.createElement('div');
            $$e.setAttribute('class', 'sender');
            $$e.setAttribute('data-sendercolor', SenderColorHandler.nickToColor(this.getNick()));
            $$d.appendChild($$e);
            $$e.appendChildren(this.getNick());
            var $$g = document.createElement('div');
            $$g.setAttribute('class', 'content');
            $$d.appendChild($$g);
            $$g.appendChildren(MircColorHandler.render(this.content));
            return $$a;
        }.call(this);
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