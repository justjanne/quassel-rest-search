class MircColorHandler {
    static render(text) {
        const CODE_BOLD = '\x02';
        const CODE_COLOR = '\x03';
        const CODE_HEXCOLOR = '\x04';
        const CODE_ITALIC = '\x1D';
        const CODE_UNDERLINE = '\x1F';
        const CODE_STRIKETHROUGH = '\x1E';
        const CODE_MONOSPACE = '\x11';
        const CODE_SWAP = '\x16';
        const CODE_RESET = '\x0F';

        const urlRegex = /\b((?:(?:mailto:|(?:[+.-]?\w)+:\/\/)|www(?=\.\S+\.))(?:(?:[,.;@:]?[-\w]+)+\.?|\[[0-9a-f:.]+])(?::\d+)?(?:\/(?:[,.;:]*[\w~@/?&=+$()!%#*-])*)?)(?:>|[,.;:"]*\b|$)/gi;
        const readNumber = function (str, start, end) {
            if (start >= end || start >= str.length)
                return -1;
            else
                return parseInt(str.substr(start, end - start), 10);
        };
        const findEndOfNumber = function (str, start) {
            const validCharCodes = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
            let i;
            let tmp = str.substr(start, 2);
            for (i = 0; i < 2 && i < tmp.length; i++) {
                if (validCharCodes.indexOf(tmp.charAt(i)) === -1)
                    break;
            }
            return i + start;
        };
        const readHexNumber = function (str, start, end) {
            if (start >= end || start >= str.length)
                return -1;
            else
                return parseInt(str.substr(start, end - start), 16);
        };
        const findEndOfHexNumber = function (str, start) {
            const validCharCodes = [
                '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
                'a', 'b', 'c', 'd', 'e', 'f', 'A', 'B', 'C', 'D', 'E', 'F'
            ];
            let i;
            let tmp = str.substr(start, 6);
            for (i = 0; i < 6 && i < tmp.length; i++) {
                if (validCharCodes.indexOf(tmp.charAt(i)) === -1)
                    break;
            }
            return i + start;
        };
        const fromState = function (state) {
            const elem = document.createElement((state.url) ? 'a' : 'span');
            if (state.bold)
                elem.classList.add('irc_bold');
            if (state.italic)
                elem.classList.add('irc_italic');
            if (state.underline)
                elem.classList.add('irc_underline');
            if (state.strikethrough)
                elem.classList.add('irc_strikethrough');
            if (state.monospace)
                elem.classList.add('irc_monospace');
            if (state.foreground !== null)
                elem.dataset['irc_foreground'] = state.foreground;
            if (state.background !== null)
                elem.dataset['irc_background'] = state.background;
            if (state.hexforeground !== null)
                elem.style.color = '#' + ("000000" + state.hexforeground.toString(16)).substr(-6);
            if (state.highlight)
                elem.classList.add('irc_highlight');
            return elem;
        };
        const unescape = function (str) {
            return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        };
        const apply = function (lastTag, str, i, normalCount, nodes) {
            const s = unescape(str.substr(i - normalCount, normalCount));
            if (normalCount === 0)
                return;
            if (lastTag.tagName === 'A') {
                lastTag.target = '_blank';
                lastTag.rel = 'noopener'
                if (s.indexOf('://') !== -1)
                    lastTag.href = s;
                else
                    lastTag.href = "http://" + s;
            }
            lastTag.appendChild(document.createTextNode(s));
            nodes.push(lastTag);
        };
        const urlStart = [];
        const urlEnd = [];
        let m;
        do {
            if (m) {
                urlStart.push(m.index);
                urlEnd.push(m.index + m[0].length);
            }
            m = urlRegex.exec(text);
        } while (m);
        const formatString = function (str) {
            if (!str)
                return document.createTextNode('');
            let state = {
                bold: false,
                italic: false,
                underline: false,
                strikethrough: false,
                monospace: false,
                foreground: null,
                hexforeground: null,
                background: null,
                highlight: false,
                url: false
            };
            let lastTag = fromState(state);
            let nodes = [];
            let normalCount = 0;
            for (let i = 0; i < str.length; i++) {
                const character = str.charAt(i);
                if (urlEnd.includes(i)) {
                    apply(lastTag, str, i, normalCount, nodes);
                    normalCount = 0;
                    state.url = false;
                    lastTag = fromState(state);
                }
                if (urlStart.includes(i)) {
                    apply(lastTag, str, i, normalCount, nodes);
                    normalCount = 0;
                    state.url = true;
                    lastTag = fromState(state);
                }
                switch (character) {
                    case CODE_BOLD: {
                        apply(lastTag, str, i, normalCount, nodes);
                        normalCount = 0;
                        state.bold = !state.bold;
                        lastTag = fromState(state);
                    }
                        break;
                    case CODE_ITALIC: {
                        apply(lastTag, str, i, normalCount, nodes);
                        normalCount = 0;
                        state.italic = !state.italic;
                        lastTag = fromState(state);
                    }
                        break;
                    case CODE_UNDERLINE: {
                        apply(lastTag, str, i, normalCount, nodes);
                        normalCount = 0;
                        state.underline = !state.underline;
                        lastTag = fromState(state);
                    }
                        break;
                    case CODE_STRIKETHROUGH: {
                        apply(lastTag, str, i, normalCount, nodes);
                        normalCount = 0;
                        state.strikethrough = !state.strikethrough;
                        lastTag = fromState(state);
                    }
                        break;
                    case CODE_MONOSPACE: {
                        apply(lastTag, str, i, normalCount, nodes);
                        normalCount = 0;
                        state.monospace = !state.monospace;
                        lastTag = fromState(state);
                    }
                        break;
                    case CODE_COLOR: {
                        apply(lastTag, str, i, normalCount, nodes);
                        normalCount = 0;
                        let foregroundStart = i + 1;
                        let foregroundEnd = findEndOfNumber(str, foregroundStart);
                        if (foregroundEnd > foregroundStart) {
                            let foreground = readNumber(str, foregroundStart, foregroundEnd);
                            let background = -1;
                            let backgroundStart = foregroundEnd + 1;
                            let backgroundEnd = -1;
                            if (str.length > foregroundEnd && str.charAt(foregroundEnd) === ',') {
                                backgroundEnd = findEndOfNumber(str, backgroundStart);
                                background = readNumber(str, backgroundStart, backgroundEnd);
                            }
                            if (state.foreground !== null) {
                                if (background === -1)
                                    background = state.background;
                            }
                            if (foreground === -1) {
                                state.foreground = null;
                                state.hexforeground = null;
                            } else {
                                state.foreground = foreground;
                                state.hexforeground = null;
                            }
                            state.background = background === -1 ? null : background;
                            lastTag = fromState(state);
                            i = (backgroundEnd === -1 ? foregroundEnd : backgroundEnd) - 1;
                        } else if (state.foreground !== null) {
                            state.foreground = null;
                            state.background = null;
                            lastTag = fromState(state);
                        }
                    }
                        break;
                    case CODE_HEXCOLOR: {
                        apply(lastTag, str, i, normalCount, nodes);
                        normalCount = 0;
                        let foregroundStart = i + 1;
                        let foregroundEnd = findEndOfHexNumber(str, foregroundStart);
                        if (foregroundEnd > foregroundStart) {
                            let foreground = readHexNumber(str, foregroundStart, foregroundEnd);
                            if (foreground === -1) {
                                state.hexforeground = null;
                                state.foreground = null;
                            } else {
                                state.hexforeground = foreground;
                                state.foreground = null;
                            }
                            lastTag = fromState(state);
                            i = foregroundEnd - 1;
                        } else if (state.hexforeground !== null) {
                            state.hexforeground = null;
                            lastTag = fromState(state);
                        }
                    }
                        break;
                    case CODE_SWAP: {
                        apply(lastTag, str, i, normalCount, nodes);
                        normalCount = 0;
                        if (state.foreground !== null) {
                            state.foreground = state.background;
                            state.background = state.foreground;
                            lastTag = fromState(state);
                        }
                    }
                        break;
                    case CODE_RESET: {
                        apply(lastTag, str, i, normalCount, nodes);
                        normalCount = 0;
                        state.bold = false;
                        state.italic = false;
                        state.underline = false;
                        state.foreground = null;
                        state.background = null;
                        lastTag = fromState(state);
                    }
                        break;
                    case '<': {
                        const start_tag = '<b>';
                        const end_tag = '</b>';
                        if (str.substr(i, start_tag.length) === start_tag) {
                            apply(lastTag, str, i, normalCount, nodes);
                            normalCount = 0;
                            state.highlight = true;
                            lastTag = fromState(state);

                            i += start_tag.length - 1;
                        } else if (str.substr(i, end_tag.length) === end_tag) {
                            apply(lastTag, str, i, normalCount, nodes);
                            normalCount = 0;
                            state.highlight = false;
                            lastTag = fromState(state);

                            i += end_tag.length - 1;
                        } else {
                            normalCount++;
                        }
                    }
                        break;
                    default: {
                        normalCount++;
                    }
                        break;
                }
            }
            apply(lastTag, str, str.length, normalCount, nodes);
            return nodes;
        };
        return formatString(text);
    }
}
