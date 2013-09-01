
console.log("main");


function create_test_graph() {
    var T1 = {
        name:"T1",
        inputs: [{name:"In", type:"float"}],
        outputs: [{name:"Out", type:"float"}],
        w: 60, h:80
    }
    var T2 = {
        name:"T2",
        inputs: [
            {name:"A", type:"float"},
            {name:"B", type:"float"}
        ],
        outputs: [
            {name:"R1", type:"float"},
            {name:"R2", type:"float"}
        ],
        w: 80, h:120
    }

    var g = new kiwi.Graph();

    var n1 = g.add_node(T1, 0, 0);
    var n2 = g.add_node(T1, 250, 50);
    var n3 = g.add_node(T2, 150, 120);

    g.connect(n1,0, n2,0);
    g.connect(n1,0, n3,0);

    return g;
}

function editor_main() {
    graph_test();

    var canvas = document.getElementsByTagName("canvas")[0];
    var scene = kiwi.ui.init_canvas(canvas);

    scene.graph = create_test_graph();

    scene.ctx.fillStyle = "gray";
    scene.ctx.fillRect(0, 0, canvas.width, canvas.height);

    kiwi.ui.draw_graph(scene);
}
