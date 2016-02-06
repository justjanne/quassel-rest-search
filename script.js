var userdata = { "username": localStorage.getItem("username"), "password": localStorage.getItem("password") };
var state = { "query": "", "offset": 0};
var buffers = {};

var sortData = function (data) {
  var bufs = [];
  data.forEach(message => {
    if (!buffers.hasOwnProperty(message.bufferid)) {
      buffers[message.bufferid] = {
        id: message.bufferid,
        name: message.buffername,
        network: message.networkname,
        selected: false,
        contexts: [],
        offset: 0
      }
    }
    if (bufs.indexOf(message.bufferid) === -1) {
      bufs.push(message.bufferid);
    }
    buffers[message.bufferid].contexts.push({"selected": false, "original": message, "before": [], "after": [], "buffer": message.bufferid, "id": buffers[message.bufferid].contexts.length});
  });
  return bufs;
}

$("#q").keypress(function (e) {
  var key = e.which || e.keyCode;
  if (key === 13) {
    search();
  }
})

$("#login").click(function() {
  localStorage.setItem("username", prompt("username"));
  localStorage.setItem("password", prompt("password"));
})
$("#logout").click(function() {
  localStorage.removeItem("username");
  localStorage.removeItem("password");
})

var sendercolor = function (nick) {
  return "";
}

var render_buffer_full = function (buffer) {
  return (
    "<buffer id='buffer"+buffer.id+"' data-bufferid='"+buffer.id+"' class='selected'>" +
      "<h2>" + buffer.network + " – " + buffer.name + "</h2>" + 
      "<article>" + 
        buffer.contexts.map(render_context).reduce((x, y) => x + y, "") +
        "<inline-button class='load_more'>Load More Results</inline-button>" +  
      "</article>" + 
    "</buffer>"
  )
}

var render_buffer_overview = function (buffer) {
  return (
    "<buffer id='buffer"+buffer.id+"' data-bufferid='"+buffer.id+"'>" +
      "<h2>" + buffer.network + " – " + buffer.name + "</h2>" + 
      "<article>" + 
        buffer.contexts.slice(0, 4).map(render_context).reduce((x, y) => x + y, "") +
        "<inline-button class='load_more'>Load More Results</inline-button>" +   
      "</article>" + 
    "</buffer>"
  )
}

var render_buffer = function (buffer) {
  return (buffer.selected) ? render_buffer_full(buffer) : render_buffer_overview(buffer);
}

var attach_buffer = function (elem) {
  elem.unbind();
  var id = elem.data("bufferid");
  elem.click(make_toggle_buffer(id));
  elem.find(".load_more").click((e) => {
    if (buffers[id].selected || buffers[id].contexts.length <= 4)
      more_buffer(id);
    select_buffer(id);
    e.stopPropagation();
  });
  buffers[id].contexts.forEach(context => {
    attach_context(elem.find("#context"+context.id));
  })
}

var render_context_overview = function (context) {
  return (
    "<context id='context"+context.id+"' data-contextid='"+context.id+"' data-bufferid='"+context.buffer+"'>" +
      render_message(context.original, true) +
    "</context>"
  )
}

var render_context_full = function (context) {
  return (
    "<context id='context"+context.id+"' data-contextid='"+context.id+"' data-bufferid='"+context.buffer+"' class='selected'>" +
      "<inline-button class='load_before'>Load Earlier Context</inline-button>" +
      context.before.map(render_message).reduce((x, y) => x + y, "") +
      render_message(context.original, true) +
      context.after.map(render_message).reduce((x, y) => x + y, "") + 
      "<inline-button class='load_after'>Load Later Context</inline-button>" +
    "</context>"
  )
}

var render_context = function (context) {
  return context.selected ? render_context_full(context) : render_context_overview(context); 
}

var attach_context = function (elem) {
  elem.unbind();
  var id = elem.data("contextid");
  var bufferid = elem.data("bufferid");
  elem.click(make_toggle_context(bufferid, id));
  elem.find(".load_before").click((e) => {
    earlier(bufferid, id, 5);
    e.stopPropagation();
  });
  elem.find(".load_after").click((e) => {
    later(bufferid, id, 5);
    e.stopPropagation();
  });
}

var render_message = function (message, highlight) {
  return (
    "<message id='message" + message.messageid + "' data-messageid='"+message.messageid+"' "+(highlight===true ? "" : "class='faded'")+">" +
      "<time>" + new Date(message.time.replace(" ", "T") + "Z").toLocaleString() + "</time>" + 
      "<sender style='color: " + sendercolor(message.sender.split("!")[0]) + "'>" + message.sender.split("!")[0] + "</sender>" + 
      "<content>" + message.message + "</content>" + 
    "</message>"
  )
}

var load_search_overview = function (query, offset, limit, callback) {
  $.post("search.php?" + $.param({"query": query, "offset": offset, "limit": limit}), userdata, callback, "json");
}

var load_search_buffer = function (query, buffer, offset, limit, callback) {
  $.post("search_buffer.php?" + $.param({"query": query, "buffer": buffer, "offset": offset, "limit": limit}), userdata, callback, "json");
}

var load_context = function (msg, buffer, before, after, callback) {
  $.post("context.php?" + $.param({"msg": msg, "buffer": buffer, "before": before, "after": after}), userdata, callback, "json");
}

var show_overview = function (ids) {
  ids.forEach(id => {
    if ($("#buffer"+id).length)
      $("#buffer"+id).replaceWith(render_buffer(buffers[id]))
    else
      $("#load_more").before(render_buffer(buffers[id]))
    attach_buffer($("#buffer"+id));
  });
}

var process_data = function (callback, limit) {
  return function(data) {
    var changed_ids = sortData(data);
    state.offset += changed_ids.length;
    if (changed_ids.length < limit) show_no_more_msg();
    callback(changed_ids);
  }
}

var search = function () {
  $("#results").children().remove();
  buffers = {};
  $("#results").append("<inline-button id='load_more'>Load More Channels/Queries</inline-button>");
  $("#load_more").click(more);
  $("#results").click(deselect_buffers);
  state = {
    "query": $("#q").val(),
    "offset": 0
  };
  more();
}

var more = function () {
  var limit = 4;
  load_search_overview(state.query, state.offset, limit, process_data(show_overview, limit));
}

var more_buffer = function (id) {
  var limit = 10;
  load_search_buffer(state.query, id, buffers[id].contexts.length, limit, (data) => {
    buffers[id].contexts = buffers[id].contexts.concat(data.map(message => ({"selected": false, "original": message, "before": [], "after": [], "buffer": id, "id": buffers[id].contexts.length})));
    show_overview([id])
  });
}

var deselect_buffers = function (except) {
  $.each(buffers, (key, buffer) => {
    if (key !== except && buffers[key].selected) {
      buffers[key].selected = false;
      unselect_contexts(key);
      update_buffer(key);
    }
  })
}

var unselect_contexts = function (bufferid) {
  buffers[bufferid].contexts = buffers[bufferid].contexts.map(context => {
    context.selected = false;
    return context
  })
}

var make_toggle_buffer = function (id) {
  return function (e) {
    if (buffers[id].selected) {
      deselect_buffers();
      buffers[id].selected = false;
    } else {
      deselect_buffers();
      buffers[id].selected = true;
    }
    update_buffer(id);
    e.stopPropagation();
  }
}

var select_buffer = function (id) {
  deselect_buffers(id);
  buffers[id].selected = true;
  update_buffer(id);
}

var update_buffer = function (id) {
  $("#buffer"+id).replaceWith(render_buffer(buffers[id]));
  attach_buffer($("#buffer"+id));
}

var make_toggle_context = function (buffer, id) {
  return function (e) {
    var context = buffers[buffer].contexts[id];
    if (context.selected) {
      unselect_contexts(buffer);
      context.selected = false;   
    } else {
      unselect_contexts(buffer);
      buffers[buffer].selected = true;
      context.selected = true;
      if (context.before.length === 0) earlier(buffer, id, 5);
      if (context.after.length === 0) later(buffer, id, 5);
    }
    update_buffer(buffer);
    e.stopPropagation();
  }
}

var show_no_more_msg = function () {
  $("#load_more").before("<div id='no_more'><img src='https://raw.githubusercontent.com/xiprox/ErrorView/master/library/src/main/res/drawable-xxhdpi/error_view_cloud.png'><h2>No more results</h2></div>");
  $("#load_more").remove();
}

var earlier = function (bufferid, contextid, amount) {
  var buffer = buffers[bufferid];
  var context = buffer.contexts[contextid];
  var earliest = (context.before[0] || context.original).messageid;
  load_context(earliest, bufferid, amount, 0, (messages) => {
    var newmsgs = messages.slice(0, messages.length - 1)
    context.before = sort_messages(newmsgs.concat(context.before));
    update_buffer(bufferid);
  })
}

var later = function (bufferid, contextid, amount) {
  var buffer = buffers[bufferid];
  var context = buffer.contexts[contextid];
  var latest = (context.after[context.after.length - 1] || context.original).messageid;
  load_context(latest, bufferid, 0, amount, (messages) => {
    var newmsgs = messages.slice(1)
    context.after = sort_messages(context.after.concat(newmsgs));
    update_buffer(bufferid);
  })
}

var sort_messages = function (arr) {
  return arr.sort((x, y) => x.messageid - y.messageid).filter((item, pos, ary) => {
      return !pos || item.messageid != ary[pos - 1].messageid;
  })
}