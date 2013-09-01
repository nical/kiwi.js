console.log("imported kiwi.ui");
var kiwi = kiwi||{}
kiwi.ui = (function() {

var PORT_SIZE = 15;
var PORT_RADIUS = 10;
var PORT_SPACING = 5;
var NODE_HEADER_HEIGHT = 36;
var HEADER_FONT_SIZE = 12;
var PORT_FONT_SIZE = 10;
var PORT_COLOR = "#444"
var LINK_COLOR = "#444"
var NODE_COLOR = "lightgray"
var TEXT_COLOR = "black"
var SEPARATOR_COLOR = "gray"

function compute_node_height(node) {
    var height = NODE_HEADER_HEIGHT;
    height += node.inputs.length * (PORT_SIZE+PORT_SPACING);
    height += node.outputs.length * (PORT_SIZE+PORT_SPACING);
    return height;
}

function compute_node_width(node) {
    return 100;
}

function relative_pos(evt, canvas) {
    return {
        x: evt.pageX - canvas.offsetLeft,
        y: evt.pageY - canvas.offsetTop,
    }
}

function get_relative_input_position(node, index) {
    return{
        x: 0,
        y: NODE_HEADER_HEIGHT + index * (PORT_SIZE+PORT_SPACING)
    }
}

function get_relative_output_position(node, index) {
    return{
        x: node.w,
        y: NODE_HEADER_HEIGHT + (node.inputs.length+index) * (PORT_SIZE+PORT_SPACING)
    }
}

function draw_link(scene, n1, p1, n2, p2) {
    var out_port = get_relative_output_position(n1, p1);
    var in_port = get_relative_input_position(n2, p2);

    out_port.x += n1.x;
    out_port.y += n1.y;
    in_port.x += n2.x;
    in_port.y += n2.y;

    scene.ctx.strokeStyle = LINK_COLOR;
    scene.ctx.lineWidth = 4.0;
    scene.ctx.beginPath();
    scene.ctx.moveTo(out_port.x, out_port.y);
    scene.ctx.bezierCurveTo(out_port.x+Math.abs(in_port.x-out_port.x)*0.5,
                            out_port.y,
                            in_port.x-Math.abs(in_port.x-out_port.x)*0.5,
                            in_port.y,
                            in_port.x,
                            in_port.y);
    scene.ctx.stroke();
    //console.log("link "+ out_port.x+ " "+out_port.y);
}

function circle(ctx, cx, cy, r) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI, false);
}

function separator(ctx, y, width, offset) {
    ctx.lineWidth = 1.0;
    ctx.strokeStyle = SEPARATOR_COLOR;
    ctx.moveTo(offset, y);
    ctx.lineTo(width - offset, y);
    ctx.stroke()
}

function draw_node(scene, node, graph) {
    var ctx = scene,ctx;
    ctx.save();
    ctx.fillStyle = NODE_COLOR;
    ctx.transform(1.0, 0.0,
                  0.0, 1.0,
                  node.x, node.y);

    ctx.fillRect(0, 0, node.w, node.h);
    separator(ctx, NODE_HEADER_HEIGHT - 18, node.w, 6);
    ctx.fillStyle = TEXT_COLOR;
    ctx.textAlign = "center";
    ctx.fillText(node.type.name, node.w*0.5, 12 );
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    var y = NODE_HEADER_HEIGHT;
    for (var i in node.inputs) {
        ctx.fillStyle = PORT_COLOR;
        circle(ctx, 0, y, 6);
        ctx.fill();
        ctx.fillStyle = TEXT_COLOR;
        ctx.fillText(node.type.inputs[i].name, 10, y );
        y += PORT_SIZE+PORT_SPACING;
    }
    ctx.textAlign = "right";
    for (var o in node.outputs) {
        ctx.fillStyle = PORT_COLOR;
        circle(ctx, node.w, y, 6);
        ctx.fill();
        ctx.fillStyle = LINK_COLOR;
        ctx.fillText(node.type.outputs[o].name, node.w - 10, y);
        y += PORT_SIZE+PORT_SPACING;
    }
    ctx.restore();
}

function draw_graph(scene) {
    scene.ctx.setTransform(1.0, 0.0,
                           0.0, 1.0,
                           0.0, 0.0);

    scene.ctx.clearRect(0, 0, scene.canvas.width, scene.canvas.height);

    scene.ctx.setTransform(scene.zoom, 0.0, 0.0, scene.zoom,
                           scene.scroll.x, scene.scroll.y);
    var graph = scene.graph;
    for (var i in graph.nodes) {
        draw_node(scene.ctx, graph.nodes[i], graph);
    }

    for (var n in graph.nodes) {
        for (var o in graph.nodes[n].outputs) {
            for (var oo in graph.nodes[n].outputs[o]) {
                var link = graph.nodes[n].outputs[o][oo];
                draw_link(scene, graph.nodes[n], parseInt(o,10), link.node, link.port);
            }
        }
    }



    if (scene.debug) {
        scene.ctx.fillRect(scene.debug.x-2, scene.debug.y-2, 4, 4);
    }
}

function point_in_rect(px, py, rx, ry, rw, rh) {
    return px > rx && py > ry && px < rx+rw && py < ry + rh;
}

function hit_test(scene, x, y) {
    for (var n in scene.graph.nodes) {
        var node = scene.graph.nodes[n];
        for (var i=0; i < node.inputs.length; ++i) {
            var input = get_relative_input_position(node, i);
            input.x += node.x;
            input.y += node.y;
            if (point_in_rect(x, y,
                              input.x - PORT_RADIUS*0.5, input.y-PORT_RADIUS*0.5,
                              PORT_RADIUS, PORT_RADIUS)) {
                return { type:"input_port", node:node, port:i }
            }
        }
        for (var o=0; o < node.outputs.length; ++o) {
            var output = get_relative_output_position(node, o);
            output.x += node.x;
            output.y += node.y;
            if (point_in_rect(x, y,
                              output.x - PORT_RADIUS*0.5, output.y-PORT_RADIUS*0.5,
                              PORT_RADIUS, PORT_RADIUS)) {
                return { type:"output_port", node:node, port:i }
            }
        }
    }

    for (var n in scene.graph.nodes) {
        var node = scene.graph.nodes[n];
        if (point_in_rect(x,y, node.x, node.y, node.w, node.h)) {
            return {obj:node, type:"node"}
        }
    }
    return {type:"background"}
}


function init_canvas(canvas) {
    var scene = {
        canvas: canvas,
        ctx: canvas.getContext("2d"),
        scroll: { x: 0, y:0 },
        zoom: 1.0
    }
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    scene.scroll.x = canvas.width * 0.5;
    scene.scroll.y = canvas.height * 0.5;
    function mouse_wheel(evt) {
        console.log("zoooom");
        var delta = Math.max(-1, Math.min(1, evt.wheelDelta||-evt.detail));
        scene.zoom += delta * 0.5;
        if (scene.zoom < 0.8) {
            scene.zoom = 0.8;
        }
        console.log(scene.zoom);
        draw_graph(scene);
    }
    window.addEventListener("resize", function() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        draw_graph(scene);
    });
    canvas.addEventListener("mousewheel", mouse_wheel, false);
    canvas.addEventListener("DOMMouseScroll", mouse_wheel, false);
    canvas.onmousedown = function(evt) {
        var cursor = relative_pos(evt, canvas);
        var pick = hit_test(scene,
                            (cursor.x - scene.scroll.x)/scene.zoom,
                            (cursor.y-scene.scroll.y)/scene.zoom);
        if (pick.type == "background") {
            var old_x = cursor.x;
            var old_y = cursor.y;
            canvas.onmousemove = function(evt) {
                var cursor = relative_pos(evt, canvas);
                scene.scroll.x += cursor.x - old_x
                scene.scroll.y += cursor.y - old_y
                old_x = cursor.x;
                old_y = cursor.y;
                kiwi.ui.draw_graph(scene)
            }
        } else if (pick.type == "node") {
            var node = pick.obj;
            var old_x = cursor.x;
            var old_y = cursor.y;
            canvas.onmousemove = function(evt) {
                var cursor = relative_pos(evt, canvas);
                node.x += (cursor.x - old_x)/scene.zoom;
                node.y += (cursor.y - old_y)/scene.zoom;
                old_x = cursor.x;
                old_y = cursor.y;
                kiwi.ui.draw_graph(scene);
            }
        } else {
            console.log("picked "+pick.type);
        }
    }
    canvas.onmouseup = function(evt) {
        canvas.onmousemove = null;
    }
    return scene;
}

return {
    draw_node: draw_node,
    draw_graph: draw_graph,
    init_canvas: init_canvas
}

})(); // kiwi.ui