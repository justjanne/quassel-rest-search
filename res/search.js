/*
var state = {
    query: "",
    selected_history_entry: -1,
    buffers: {},
    open: []
};

var bind_click = function (elem, handler) {
    elem.unbind("mousedown");
    elem.unbind("mouseup");

    elem.mousedown(function (e) {
        getSelection().removeAllRanges();
    });

    elem.mouseup(function (e) {
        if (e.which === 1 && getSelection().isCollapsed)
            handler(e);
    });
};

var make_select_buffer = function (buffer, id) {
    state.buffers[buffer].selected = true;
    apply_selection();
};

var make_select_context = function (buffer, id) {
    state.buffers[buffer].selected = true;
    state.buffers[buffer].contexts[id].selected = true;
    apply_selection();
};

var search_history = {
    max_size: 8,
    get: function () {
        return (JSON.parse(localStorage.getItem('history')) || []).reverse();
    },
    clear: function () {
        localStorage.removeItem('history');
    },
    push: function (query) {
        if (!query)
            return;

        var tmp = search_history.get().filter(function (x) {
            return x != query;
        }).reverse();
        tmp.push(query);
        localStorage.setItem('history', JSON.stringify(tmp.slice(Math.max(0, tmp.length - search_history.max_size))));
    }
};

var render = {
    overview: function (ids) {
        $("#results").children().remove();

        for (var i = 0; i < ids.length; i++) {
            var buffer = ids[i];

            if (!state.buffers.hasOwnProperty(buffer.bufferid)) {
                var ctx = 0;
                state.buffers[buffer.bufferid] = {
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

            render.buffer.update(buffer.bufferid);
        }

        if (ids.length == 0)
            render.no_more();
    },
    buffer: {
        full: function (buffer) {
            return (
                "<buffer id='buffer" + buffer.id + "' data-bufferid='" + buffer.id + "'>" + (
                    "<h2>" + buffer.network + " – " + buffer.name + "</h2>" +
                    "<article>" + (
                        buffer.contexts.map(render.context.full).join("") +
                        "<inline-button class='load_more'>" + translation.results.load_more + "</inline-button>"
                    ) + "</article>"
                ) + "</buffer>"
            )
        },
        update: function (id) {
            $("#buffer" + id).unbind();
            var renderedBuffer = render.buffer.full(state.buffers[id]);
            if ($("#buffer" + id).length)
                $("#buffer" + id).replaceWith(renderedBuffer);
            else
                $("#results").append(renderedBuffer);

            render.buffer.attach($("#buffer" + id));
        },
        attach: function (elem) {
            elem.unbind();
            var id = elem.data("bufferid");
            bind_click(elem, make_toggle_buffer(id));
            bind_click(elem.find(".load_more"), function (e) {
                e.stopPropagation();

                if (state.buffers[id].selected || state.buffers[id].contexts.length <= 4)
                    load.buffer.more(id);

                deselect_buffers(id);
                state.open.push(make_toggle_buffer(id));
                state.buffers[id].selected = true;
            });
            state.buffers[id].contexts.forEach(function (context) {
                var ctx = elem.find("#context" + context.id);
                if (ctx.length) {
                    ctx.unbind();
                    render.context.attach(ctx);
                }
            })
        }
    },
    context: {
        full: function (context) {
            return (
                "<context id='context" + context.id + "' data-contextid='" + context.id + "' data-bufferid='" + context.buffer + "'>" + (
                    "<div class='before'>" +(
                        "<inline-button class='load_before'>" + translation.context.load_earlier + "</inline-button>" +
                        context.before.map(render.message).join("")
                    ) + "</div>" +
                    render.message(context.original, true) +
                    "<div class='after'>" +(
                        context.after.map(render.message).join("")
                        + "<inline-button class='load_after'>" + translation.context.load_later + "</inline-button>"
                    ) + "</div>"
                ) + "</context>"
            )
        },
        attach: function (elem) {
            elem.unbind();
            var id = elem.data("contextid");
            var bufferid = elem.data("bufferid");
            if (state.buffers[bufferid] === undefined) {
                console.log("Undefined buffer: " + bufferid);
            }

            bind_click(elem, function (e) {
                e.stopPropagation();
            });
            $("#message" + state.buffers[bufferid].contexts[id].original.messageid).unbind();
            bind_click($("#message" + state.buffers[bufferid].contexts[id].original.messageid), make_toggle_context(bufferid, id));
            bind_click(elem.find(".load_before"), function (e) {
                e.stopPropagation();

                load.context.earlier(bufferid, id, 5);
            });
            bind_click(elem.find(".load_after"), function (e) {
                e.stopPropagation();

                load.context.later(bufferid, id, 5);
            });
        }
    },
    message: function (message, highlight, preview) {
        var content = preview === true ? message.preview : message.message;
        return (
            "<message id='message" + message.messageid + "' data-messageid='" + message.messageid + "' " + (highlight === true ? "class='original'" : "") + ">" + (
                "<time>" + new Date(message.time.replace(" ", "T") + "Z").toLocaleString() + "</time>" +
                "<div class='container'>" + (
                    "<sender style='color: " + sendercolor(message.sender.split("!")[0]) + "'>" + message.sender.split("!")[0] + "</sender>" +
                    "<content>" + content + "</content>"
                ) + "</div>"
            ) + "</message>"
        )
    },
    history: {
        all: function (history) {
            var container = $("#autocomplete ul");
            container.children().remove();

            for (var i = 0; i < history.length; i++) {
                container.append(render.history.item(i, history[i]));
                render.history.attach($("#history" + i));
            }
            if (history.length == 0) {
                container.append("<p>" + translation.history.error_unavailable + "</p>");
            }
 "<li id='history" + id + "' data-query='" + btoa(query) + "'>" + (
 "<span class='icon'>history</span>" +
 query
 ) + "</li>"
        },
        item: function (id, query) {
            return (
                "<li id='history" + id + "' data-query='" + btoa(query) + "'>" + (
                    "<span class='icon'>history</span>" +
                    query
                ) + "</li>"
            )
        },
        attach: function (elem) {
            elem.unbind();
            var query = atob(elem.data("query"));
            bind_click(elem, function (e) {
                e.stopPropagation();

                $("#q").val(query);
                search();
            });
        }
    },
    loader: function () {
        $("#results").append("  <div class='loader'><svg class='circular' viewBox='25 25 50 50'><circle class='path' cx='50' cy='50' r='20' fill='none' stroke-width='4' stroke-miterlimit='10'/></svg></div>");
    },
    no_more: function () {
        $("#results").append("<div id='no_more'><img src='res/error.png'><h2>No results</h2></div>");
    }
};

var load = {
    overview: function (query, callback) {
        $.post("web/search/?" + $.param({"query": query}), callback, "json");
    },
    buffer: {
        raw: function (query, buffer, offset, limit, callback) {
            $.post("web/searchbuffer/?" + $.param({
                    "query": query,
                    "buffer": buffer,
                    "offset": offset,
                    "limit": limit
                }), callback, "json");
        },
        more: function (id, limit) {
            if (limit === undefined)
                limit = 10;

            load.buffer.raw(state.query, id, state.buffers[id].contexts.length, limit, function (data) {
                var ctx = state.buffers[id].contexts.length;
                state.buffers[id].contexts = state.buffers[id].contexts.concat(data.map(function (message) {
                    return {
                        "selected": false,
                        "original": message,
                        "before": [],
                        "after": [],
                        "buffer": id,
                        "id": ctx++
                    };
                }));
            });
        }
    },
    context: {
        raw: function (msg, buffer, before, after, callback) {
            $.post("web/backlog/?" + $.param({
                    "anchor": msg,
                    "buffer": buffer,
                    "before": before,
                    "after": after
                }), callback, "json");
        },
        earlier: function (bufferid, contextid, amount) {
            var buffer = state.buffers[bufferid];
            var context = buffer.contexts[contextid];
            var earliest = (context.before[0] || context.original).messageid;
            load.context.raw(earliest, bufferid, amount, 0, function (messages) {
                var newmsgs = messages.slice(0, messages.length - 1);
                context.before = newmsgs.concat(context.before);
                $("#buffer"+bufferid+" #context"+contextid+" .before .load_before").after(newmsgs.map(render.message).join(""))
            })
        },
        later: function (bufferid, contextid, amount) {
            var buffer = state.buffers[bufferid];
            var context = buffer.contexts[contextid];
            var latest = (context.after[context.after.length - 1] || context.original).messageid;
            load.context.raw(latest, bufferid, 0, amount, function (messages) {
                var newmsgs = messages.slice(1);
                context.after = context.after.concat(newmsgs);
                $("#buffer"+bufferid+" #context"+contextid+" .after .load_after").before(newmsgs.map(render.message).join(""))
            })
        }
    }
};

var search = function () {
    var results = $("#results");
    results.children().remove();
    $("#q").blur();
    bind_click(results, deselect_buffers);
    state = {
        "query": $("#q").val(),
        "selected_history_entry": -1,
        "buffers": {},
        "open": []
    };
    window.location = "#" + encodeURIComponent(state.query);
    if (state.query) {
        render.loader();
        load.overview(state.query, render.overview);
        search_history.push(state.query);
        render.history.all(search_history.get());
    }
};

var deselect_buffers = function (except) {
    $.each(state.buffers, function (key, buffer) {
        if (key !== except && buffer.selected) {
            buffer.selected = false;
            unselect_contexts(key);
        }
    });
    state.open = [];
};

var unselect_contexts = function (bufferid) {
    state.buffers[bufferid].contexts.forEach(function (context) {
        context.selected = false;
    })
};

var make_toggle_buffer = function (id) {
    return function (e) {
        console.log("toggle buffer " + id);

        e.stopPropagation();

        if (state.buffers[id].selected) {
            deselect_buffers();
            state.open.pop();
            state.buffers[id].selected = false;
        } else {
            deselect_buffers(id);
            state.open.push(make_toggle_buffer(id));
            state.buffers[id].selected = true;
        }
        apply_selection();
    }
};

var make_toggle_context = function (buffer, id) {
    return function (e) {
        console.log("toggle_context " + buffer + " " + id);

        e.stopPropagation();

        var context = state.buffers[buffer].contexts[id];
        if (context.selected) {
            unselect_contexts(buffer);
            context.selected = false;
            state.open.pop();
        } else {
            deselect_buffers(buffer);
            unselect_contexts(buffer);
            if (!state.buffers[buffer].selected) {
                state.open.push(make_toggle_buffer(buffer));
                state.buffers[buffer].selected = true;
            }
            context.selected = true;
            state.open.push(make_toggle_context(buffer, id));
            if (context.before.length === 0) load.context.earlier(buffer, id, 5);
            if (context.after.length === 0) load.context.later(buffer, id, 5);
        }
        apply_selection();
    }
};

var apply_selection = function () {
    $.each(state.buffers, function (key, buffer) {
        $("#buffer"+key).toggleClass("selected", state.buffers[key].selected);
        state.buffers[key].contexts.map(function (ctx) {
            $("#buffer"+key+" #context"+ctx.id).toggleClass("selected", ctx.selected);
        })
    });
};

var hashChange = function () {
    var input = $("#q");
    var newquery = decodeURIComponent(location.hash.substr(1));
    if (input.val() != newquery) {
        input.val(newquery);
        search();
    }
};

var init = function () {
    $("body").on("click", function (e) {
        if (state.open.length)
            state.open[state.open.length - 1](e);
    });

    $("nav").on("click", function (e) {
        e.stopPropagation();
    });

    $(window).on("hashchange", hashChange);



    $("#q").on("focus", function () {
        $("#autocomplete").addClass("active");
        $("#results").addClass("hidden");
        $("nav").addClass("search");
    });
    $("#q").on("blur", function () {
        $("#autocomplete").removeClass("active");
        $("#results").removeClass("hidden");
        $("nav").removeClass("search");
    });

    hashChange();
    render.history.all(search_history.get());
};
init();

 $("#q").on("keypress", function (e) {
 const key = e.which || e.keyCode;
 if (key === 13) {
 search();
 }

 const index_before = historyHandler.index;
 if (key === 40) {
 historyHandler.navigateBefore();
 } else if (key === 38) {
 historyHandler.navigateLater();
 }
 if (index_before != historyHandler.index) {
 $("[data-history="+index_before+"]").removeClass("selected");
 $("[data-history="+historyHandler.index+"]").addClass("selected");
 }
 });
*/