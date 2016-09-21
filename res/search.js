var state = {
    query: "",
    selected_history_entry: -1,
    buffers: {},
    open: []
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
        });
        tmp.push(query);
        localStorage.setItem('history', JSON.stringify(tmp.slice(0, tmp.max_size)));
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
        auto: function (buffer) {
            return (buffer.selected) ? render.buffer.full(buffer) : render.buffer.overview(buffer);
        },
        overview: function (buffer) {
            return (
                "<buffer id='buffer" + buffer.id + "' data-bufferid='" + buffer.id + "'>" + (
                    "<h2>" + buffer.network + " – " + buffer.name + "</h2>" +
                    "<article>" + (
                        buffer.contexts.slice(0, 4).map(render.context.auto).join("") +
                        "<inline-button class='load_more'>" + (buffer.contexts.length > 4 ? translation.results.show_more : translation.results.load_more) + "</inline-button>"
                    ) + "</article>"
                ) + "</buffer>"
            )
        },
        full: function (buffer) {
            return (
                "<buffer id='buffer" + buffer.id + "' data-bufferid='" + buffer.id + "' class='selected'>" + (
                    "<h2>" + buffer.network + " – " + buffer.name + "</h2>" +
                    "<article>" + (
                        buffer.contexts.map(render.context.auto).join("") +
                        "<inline-button class='load_more'>" + translation.results.load_more + "</inline-button>"
                    ) + "</article>"
                ) + "</buffer>"
            )
        },
        update: function (id) {
            var renderedBuffer = render.buffer.auto(state.buffers[id]);
            if ($("#buffer" + id).length)
                $("#buffer" + id).replaceWith(renderedBuffer);
            else
                $("#results").append(renderedBuffer);

            render.buffer.attach($("#buffer" + id));
        },
        attach: function (elem) {
            elem.unbind();
            var id = elem.data("bufferid");
            elem.click(make_toggle_buffer(id));
            elem.find(".load_more").click(function (e) {
                e.stopPropagation();

                if (state.buffers[id].selected || state.buffers[id].contexts.length <= 4)
                    load.buffer.more(id);

                deselect_buffers(id);
                state.open.push(make_toggle_buffer(id));
                state.buffers[id].selected = true;
                render.buffer.update(id);
            });
            state.buffers[id].contexts.forEach(function (context) {
                var ctx = elem.find("#context" + context.id);
                if (ctx.length)
                    render.context.attach(ctx);
            })
        }
    },
    context: {
        auto: function (context) {
            return context.selected ? render.context.full(context) : render.context.overview(context);
        },
        overview: function (context) {
            return (
                "<context id='context" + context.id + "' data-contextid='" + context.id + "' data-bufferid='" + context.buffer + "'>" + (
                    render.message(context.original, true, true)
                ) + "</context>"
            )
        },
        full: function (context) {
            return (
                "<context id='context" + context.id + "' data-contextid='" + context.id + "' data-bufferid='" + context.buffer + "' class='selected'>" + (
                    "<inline-button class='load_before'>" + translation.context.load_earlier + "</inline-button>" + (
                        context.before.map(render.message).join("") +
                        render.message(context.original, true) +
                        context.after.map(render.message).join("")
                    ) + "<inline-button class='load_after'>" + translation.context.load_later + "</inline-button>"
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

            elem.click(function (e) {
                e.stopPropagation();
            });
            $("#message" + state.buffers[bufferid].contexts[id].original.messageid).click(make_toggle_context(bufferid, id));
            elem.find(".load_before").click(function (e) {
                e.stopPropagation();

                load.context.earlier(bufferid, id, 5);
            });
            elem.find(".load_after").click(function (e) {
                e.stopPropagation();

                load.context.later(bufferid, id, 5);
            });
        }
    },
    message: function (message, highlight, preview) {
        var content = preview === true ? message.preview : message.message;
        return (
            "<message id='message" + message.messageid + "' data-messageid='" + message.messageid + "' " + (highlight === true ? "" : "class='faded'") + ">" + (
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
            elem.click(function (e) {
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
                render.buffer.update(id);
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
                render.buffer.update(bufferid);
            })
        },
        later: function (bufferid, contextid, amount) {
            var buffer = state.buffers[bufferid];
            var context = buffer.contexts[contextid];
            var latest = (context.after[context.after.length - 1] || context.original).messageid;
            load.context.raw(latest, bufferid, 0, amount, function (messages) {
                var newmsgs = messages.slice(1);
                context.after = context.after.concat(newmsgs);
                render.buffer.update(bufferid);
            })
        }
    }
};

var search = function () {
    var results = $("#results");
    results.children().remove();
    $("#q").blur();
    results.click(deselect_buffers);
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
            render.buffer.update(key);
        }
    });
    state.open = [];
};

var unselect_contexts = function (bufferid) {
    state.buffers[bufferid].contexts = state.buffers[bufferid].contexts.map(function (context) {
        context.selected = false;
        return context
    })
};

var make_toggle_buffer = function (id) {
    return function (e) {
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
        render.buffer.update(id);
    }
};

var make_toggle_context = function (buffer, id) {
    return function (e) {
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
        render.buffer.update(buffer);
    }
};

var hashChange = function () {
    $("#q").val(decodeURIComponent(location.hash.substr(1)));
    search();
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

    $("#q").on("keypress", function (e) {
        var key = e.which || e.keyCode;
        if (key === 13) {
            search();
        }
        if (key === 40) {
            $("#history" + state.selected_history_entry).removeClass("selected");
            state.selected_history_entry = (state.selected_history_entry + 1) % get_history().length;
            $("#q").val(get_history().reverse()[state.selected_history_entry]);
            $("#history" + state.selected_history_entry).addClass("selected");
        } else if (key === 38) {
            $("#history" + state.selected_history_entry).removeClass("selected");
            if (state.selected_history_entry === 0) {
                state.selected_history_entry = -1;
                $("#q").val("");
            } else {
                state.selected_history_entry = (state.selected_history_entry - 1) % get_history().length;
                $("#q").val(get_history().reverse()[state.selected_history_entry]);
                $("#history" + state.selected_history_entry).addClass("selected");
            }
        }
    });

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