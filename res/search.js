var state = {"query": "", "selected_history_entry": -1};
var buffers = {};
var open = [];

var max_history_size = 8;

var add_to_history = function (query) {
    if (!query)
        return;

    var history = get_history().filter(function (x) { return x != query; });
    history.push(query);
    history = history.slice(Math.max(0, history.length - max_history_size));
    localStorage.setItem('history', JSON.stringify(history));
};

var get_history = function () {
    return JSON.parse(localStorage.getItem('history')) || [];
};

var wrap_click_handler = function (fun) {
    return function (event) {
        event.stopPropagation();
        fun(event);
    }
};

$("#q").keypress(function (e) {
    var key = e.which || e.keyCode;
    if (key === 13) {
        search();
    }
    if (key === 40) {
        $("#history"+state.selected_history_entry).removeClass("selected");
        state.selected_history_entry = (state.selected_history_entry + 1) % get_history().length;
        $("#q").val(get_history().reverse()[state.selected_history_entry]);
        $("#history"+state.selected_history_entry).addClass("selected");
    } else if (key === 38) {
        $("#history"+state.selected_history_entry).removeClass("selected");
        if (state.selected_history_entry === 0) {
            state.selected_history_entry = -1;
            $("#q").val("");
        } else {
            state.selected_history_entry = (state.selected_history_entry - 1) % get_history().length;
            $("#q").val(get_history().reverse()[state.selected_history_entry]);
            $("#history"+state.selected_history_entry).addClass("selected");
        }
    }
});

$("#q").focus(function (){
    $("#autocomplete").addClass("active");
    $("#results").addClass("hidden");
    $("nav").addClass("search");
});
$("#q").blur(function () {
    $("#autocomplete").removeClass("active");
    $("#results").removeClass("hidden");
    $("nav").removeClass("search");
});

var sendercolor = function (nick) {
    var sendercolors = [
        "#e90d7f",
        "#8e55e9",
        "#b30e0e",
        "#17b339",
        "#58afb3",
        "#9d54b3",
        "#b39775",
        "#3176b3",
        "#e90d7f",
        "#8e55e9",
        "#b30e0e",
        "#17b339",
        "#58afb3",
        "#9d54b3",
        "#b39775",
        "#3176b3"
    ];

    var reflect = function(crc, n) {
        var j = 1, crcout = 0;
        for (var i = (1 << (n - 1)); i > 0; i >>= 1) {
            if ((crc & i) > 0) {
                crcout |= j;
            }
            j <<= 1;
        }
        return crcout;
    };

    var qChecksum = function(str) {
        var crc = 0xffff;
        var crcHighBitMask = 0x8000;

        for (var i = 0; i < str.length; i++) {
            var b = str.codePointAt(i);
            var c = reflect(b, 8);
            for (var j = 0x80; j > 0; j >>= 1) {
                var highBit = crc & crcHighBitMask;
                crc <<= 1;
                if ((c & j) > 0) {
                    highBit ^= crcHighBitMask;
                }
                if (highBit > 0) {
                    crc ^= 0x1021;
                }
            }
        }

        crc = reflect(crc, 16);
        crc ^= 0xffff;
        crc &= 0xffff;

        return crc;
    };

    var senderIndex = function (str) {
        var nickToHash = str.replace(/_*$/, "").toLowerCase();
        return qChecksum(nickToHash) & 0xF;
    };

    return sendercolors[senderIndex(nick)];
};

var render_buffer_full = function (buffer) {
    return (
        "<buffer id='buffer" + buffer.id + "' data-bufferid='" + buffer.id + "' class='selected'>" + (
            "<h2>" + buffer.network + " – " + buffer.name + "</h2>" +
            "<article>" + (
                buffer.contexts.map(render_context).join("") +
                "<inline-button class='load_more'>Load More Results</inline-button>"
            ) + "</article>"
        ) + "</buffer>"
    )
};

var render_buffer_overview = function (buffer) {
    return (
        "<buffer id='buffer" + buffer.id + "' data-bufferid='" + buffer.id + "'>" + (
            "<h2>" + buffer.network + " – " + buffer.name + "</h2>" +
            "<article>" + (
                buffer.contexts.slice(0, 4).map(render_context).join("") +
                "<inline-button class='load_more'>Load More Results</inline-button>"
            ) + "</article>"
        ) + "</buffer>"
    )
};

var render_buffer = function (buffer) {
    return (buffer.selected) ? render_buffer_full(buffer) : render_buffer_overview(buffer);
};

var attach_buffer = function (elem) {
    elem.unbind();
    var id = elem.data("bufferid");
    elem.click(wrap_click_handler(make_toggle_buffer(id)));
    elem.find(".load_more").click(wrap_click_handler(function (e) {
        if (buffers[id].selected || buffers[id].contexts.length <= 4)
            more_buffer(id);
        select_buffer(id);
        e.stopPropagation();
    }));
    buffers[id].contexts.forEach(function (context) {
        var ctx = elem.find("#context" + context.id);
        if (ctx.length)
            attach_context(ctx);
    })
};

var render_context_overview = function (context) {
    return (
        "<context id='context" + context.id + "' data-contextid='" + context.id + "' data-bufferid='" + context.buffer + "'>" + (
            render_message(context.original, true, true)
        ) + "</context>"
    )
};

var render_context_full = function (context) {
    return (
        "<context id='context" + context.id + "' data-contextid='" + context.id + "' data-bufferid='" + context.buffer + "' class='selected'>" + (
            "<inline-button class='load_before'>Load Earlier Context</inline-button>" + (
                context.before.map(render_message).join("") +
                render_message(context.original, true) +
                context.after.map(render_message).join("")
            ) + "<inline-button class='load_after'>Load Later Context</inline-button>"
        ) + "</context>"
    )
};

var render_history_item = function (id, query) {
    return (
        "<li id='history"+id+"' data-query='"+btoa(query)+"'>" + (
            "<span class='icon'>history</span>" +
            query
        ) +"</li>"
    )
};

var update_history = function () {
    var container = $("#autocomplete ul");
    container.children().remove();

    var history = get_history().reverse();
    for (var i = 0; i < history.length; i++) {
        container.append(render_history_item(i, history[i]));
        attach_history_item($("#history"+i));
    }
    if (history.length == 0) {
        container.append("<p>No search history available</p>");
    }
};

var attach_history_item = function (elem) {
    elem.unbind();
    var query = atob(elem.data("query"));
    elem.click(wrap_click_handler(function (e) {
        $("#q").val(query);
        search();
    }));
};

var render_context = function (context) {
    return context.selected ? render_context_full(context) : render_context_overview(context);
};

var attach_context = function (elem) {
    elem.unbind();
    var id = elem.data("contextid");
    var bufferid = elem.data("bufferid");
    if (buffers[bufferid] === undefined) {
        console.log("Undefined buffer: " + bufferid);
    }

    elem.click(wrap_click_handler(function (e) {e.stopPropagation(); }));
    $("#message"+buffers[bufferid].contexts[id].original.messageid).click(wrap_click_handler(make_toggle_context(bufferid, id)));
    elem.find(".load_before").click(wrap_click_handler(function (e) {
        earlier(bufferid, id, 5);
        e.stopPropagation();
    }));
    elem.find(".load_after").click(wrap_click_handler(function (e) {
        later(bufferid, id, 5);
        e.stopPropagation();
    }));
};

var render_message = function (message, highlight, preview) {
    var content = preview === true ? message.preview : message.message;
    return (
        "<message id='message" + message.messageid + "' data-messageid='" + message.messageid + "' " + (highlight === true ? "" : "class='faded'") + ">" + (
            "<time>" + new Date(message.time.replace(" ", "T") + "Z").toLocaleString() + "</time>" +
            "<sender style='color: " + sendercolor(message.sender.split("!")[0]) + "'>" + message.sender.split("!")[0] + "</sender>" +
            "<content>" + content + "</content>"
        ) + "</message>"
    )
};

var load_search_overview = function (query, callback) {
    $.post("web/search/?" + $.param({"query": query}), callback, "json");
};

var load_search_buffer = function (query, buffer, offset, limit, callback) {
    $.post("web/searchbuffer/?" + $.param({
            "query": query,
            "buffer": buffer,
            "offset": offset,
            "limit": limit
        }), callback, "json");
};

var load_context = function (msg, buffer, before, after, callback) {
    $.post("web/backlog/?" + $.param({
            "anchor": msg,
            "buffer": buffer,
            "before": before,
            "after": after
        }), callback, "json");
};

var show_overview = function (ids) {
    $("#results").children().remove();

    for (var i = 0; i < ids.length; i++) {
        var buffer = ids[i];

        if (!buffers.hasOwnProperty(buffer.bufferid)) {
            var ctx = 0;
            buffers[buffer.bufferid] = {
                id: buffer.bufferid,
                name: buffer.buffername,
                network: buffer.networkname,
                selected: false,
                contexts: buffer.messages.map(function (message) {
                    return {
                        "selected": false,
                        "original": message,
                        "before": [],
                        "after": [],
                        "buffer": buffer.bufferid,
                        "id": ctx++
                    };
                }),
                offset: 0
            }
        }

        update_overview(buffer.bufferid);
    }

    if (ids.length == 0)
        show_no_more_msg();
};

var update_overview = function (id) {
    var renderedBuffer = render_buffer(buffers[id]);
    if ($("#buffer" + id).length)
        $("#buffer" + id).replaceWith(renderedBuffer);
    else
        $("#results").append(renderedBuffer);

    attach_buffer($("#buffer" + id));
};

var search = function () {
    var results = $("#results");
    results.children().remove();
    $("#q").blur();
    buffers = {};
    open = [];
    results.click(wrap_click_handler(deselect_buffers));
    state = {
        "query": $("#q").val(),
        "selected_history_entry": -1
    };
    location = "#"+encodeURIComponent(state.query);
    if (state.query) {
        show_loader();
        load_search_overview(state.query, show_overview);
        add_to_history(state.query);
        update_history();
    }
};

var more_buffer = function (id, limit) {
    if (limit === undefined)
        limit = 10;

    load_search_buffer(state.query, id, buffers[id].contexts.length, limit, function (data) {
        var ctx = buffers[id].contexts.length;
        buffers[id].contexts = buffers[id].contexts.concat(data.map(function (message) {
            return {"selected": false, "original": message, "before": [], "after": [], "buffer": id, "id": ctx++};
        }));
        update_overview(id);
    });
};

var deselect_buffers = function (except) {
    $.each(buffers, function (key, buffer) {
        if (key !== except && buffers[key].selected) {
            buffers[key].selected = false;
            unselect_contexts(key);
            update_buffer(key);
        }
    })
};

var unselect_contexts = function (bufferid) {
    buffers[bufferid].contexts = buffers[bufferid].contexts.map(function (context) {
        context.selected = false;
        return context
    })
};

var make_toggle_buffer = function (id) {
    return function (e) {
        if (buffers[id].selected) {
            deselect_buffers();
            open.pop();
            buffers[id].selected = false;
        } else {
            deselect_buffers();
            open.push(make_toggle_buffer(id));
            buffers[id].selected = true;
        }
        update_buffer(id);
        e.stopPropagation();
    }
};

var select_buffer = function (id) {
    deselect_buffers(id);
    open.push(make_toggle_buffer(id));
    buffers[id].selected = true;
    update_buffer(id);
};

var update_buffer = function (id) {
    $("#buffer" + id).replaceWith(render_buffer(buffers[id]));
    attach_buffer($("#buffer" + id));
};

var make_toggle_context = function (buffer, id) {
    return function (e) {
        var context = buffers[buffer].contexts[id];
        if (context.selected) {
            unselect_contexts(buffer);
            context.selected = false;
            open.pop();
        } else {
            unselect_contexts(buffer);
            if (!buffers[buffer].selected) {
                open.push(make_toggle_buffer(buffer));
                buffers[buffer].selected = true;
            }
            context.selected = true;
            open.push(make_toggle_context(buffer, id));
            if (context.before.length === 0) earlier(buffer, id, 5);
            if (context.after.length === 0) later(buffer, id, 5);
        }
        update_buffer(buffer);
        e.stopPropagation();
    }
};

var show_no_more_msg = function () {
    $("#results").append("<div id='no_more'><img src='https://raw.githubusercontent.com/xiprox/ErrorView/master/library/src/main/res/drawable-xxhdpi/error_view_cloud.png'><h2>No results</h2></div>");
};

var show_loader = function () {
    $("#results").append("  <div class='loader'><svg class='circular' viewBox='25 25 50 50'><circle class='path' cx='50' cy='50' r='20' fill='none' stroke-width='4' stroke-miterlimit='10'/></svg></div>");
};

var earlier = function (bufferid, contextid, amount) {
    var buffer = buffers[bufferid];
    var context = buffer.contexts[contextid];
    var earliest = (context.before[0] || context.original).messageid;
    load_context(earliest, bufferid, amount, 0, function (messages) {
        var newmsgs = messages.slice(0, messages.length - 1);
        context.before = sort_messages(newmsgs.concat(context.before));
        update_buffer(bufferid);
    })
};

var later = function (bufferid, contextid, amount) {
    var buffer = buffers[bufferid];
    var context = buffer.contexts[contextid];
    var latest = (context.after[context.after.length - 1] || context.original).messageid;
    load_context(latest, bufferid, 0, amount, function (messages) {
        var newmsgs = messages.slice(1);
        context.after = sort_messages(context.after.concat(newmsgs));
        update_buffer(bufferid);
    })
};

var sort_messages = function (arr) {
    return arr.sort(function (x, y) {
        return x.messageid - y.messageid;
    }).filter(function (item, pos, ary) {
        return !pos || item.messageid != ary[pos - 1].messageid;
    });
};

update_history();



$("body").click(function (e) {
    if (open.length)
        open[open.length - 1](e);
});

$("nav").click(function (e) {
    e.stopPropagation();
});

var hashChange = function() {
    $("#q").val(decodeURIComponent(location.hash.substr(1)));
    search();
};
hashChange();
$(window).on("hashchange", hashChange);