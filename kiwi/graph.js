console.log("imported kiwi.graph")
var kiwi = kiwi||{};
(function(kiwi) {

function Graph() {
    this.nodes = [];
}

Graph.prototype.add_node = function graph_add_node(node_type, px, py) {
    var node = {
        x: px||0,
        y: py||0,
        w: node_type.w,
        h: node_type.h,
        type: node_type,
        inputs: [],
        outputs: [],
    }

    for (var i in node_type.inputs) {
        node.inputs[i] = [];
    }

    for (var o in node_type.outputs) {
        node.outputs[o] = [];
    }

    this.nodes.push(node);
    return node;
}

function remove_index_from_array(array, idx) {
    array.splice(idx,1);
}

function remove_val_from_array(array, val) {
    var idx = array.indexOf(val);
    array.splice(idx,1);
}

Graph.prototype.remove_node = function graph_remove_node(node) {
    var idx = this.nodes.indexOf(node);
    nodes.splice(idx,1);
}

Graph.prototype.connect = function graph_connect(n1, p1, n2, p2) {
    n1.outputs[p1].push({node: n2, port: p2});
    n2.inputs[p2].push({node: n1, port: p1});
}

Graph.prototype.disconnect = function graph_disconnect(n1, p1, n2, p2) {
    var outputs = n1.outputs[p1]
    for (var o in outputs) {
        if (outputs[o].node === n2 && outputs[o].port === p2) {
            remove_index_from_array(outputs,o);
            break;
        }
    }
    var inputs = n2.inputs[p2]
    for (var i in inputs) {
        if (inputs[i].node === n1 && inputs[i].port === p1) {
            remove_index_from_array(inputs,i);
            break;
        }
    }
}

/*
Graph.prototype.disconnect_inputs = function graph_disconnect_in(n, p) {
    while (n.inputs[p].length > 0) {
        this.disconnect(n.inputs[0].node, n.inputs[0].port, n,p);
    }
}

Graph.prototype.disconnect_outputs = function graph_disconnect_out(n, p) {
    while (n.outputs[p].length > 0) {
        this.disconnect(n, p, n.outputs[0].node, n.outputs[0].port);
    }
}
*/

if (!kiwi) { kiwi = {} } 
kiwi.Graph = Graph;
})(kiwi);