
console.log("imported kiwi.test");

function assert(condition, message) {
    if (!condition) {
        throw  "Assertion failed " + message||"";
    }
}

function test_log(msg) { console.log(msg); }


function graph_test() {

    console.log("Begin kiwi graph test");

    var FloatAddType = {
        type: "float:Add",
        inputs: [
            {name:"A", type:"float"},
            {name:"B", type:"float"}
        ],
        outputs: [
            {name:"R", type:"float"}
        ]
    };

    var SomthingType = {
        type: "float:Something",
        inputs: [
            {name:"A", type:"float"},
            {name:"B", type:"float"}
        ],
        outputs: [
            {name:"R1", type:"float"},
            {name:"R2", type:"float"}
        ]
    };

    var g = new kiwi.Graph();

    var n1 = g.add_node(FloatAddType);
    var n2 = g.add_node(FloatAddType);
    var n3 = g.add_node(SomthingType);

    assert(n1 != n2);
    assert(n2 != n3);
    assert(n1 != n3);

    test_log("test - a");
    assert(n1.inputs.length == FloatAddType.inputs.length, "a1");
    assert(n1.outputs.length == FloatAddType.outputs.length, "a2");

    test_log("test - b");
    assert(n1.outputs[0].length == 0,   "b1");
    assert(n2.inputs[0].length == 0,    "b2");
    g.connect(n1, 0, n2, 0);
    assert(n1.outputs[0].length == 1,   "b3");
    assert(n2.inputs[0].length == 1,    "b4");
    assert(n2.inputs[0][0].port == 0,   "b5");
    assert(n1.outputs[0][0].port == 0,  "b6");
    assert(n2.inputs[0][0].node == n1,  "b7");
    assert(n1.outputs[0][0].node == n2, "b8");
    assert(n1.inputs.length == FloatAddType.inputs.length,   "b9");
    assert(n1.outputs.length == FloatAddType.outputs.length, "b10");

    test_log("test - c");
    g.disconnect(n1, 0, n2, 0);
    assert(n1.outputs[0].length == 0,   "c1");
    assert(n2.inputs[0].length == 0,    "c2");
    assert(n1.inputs.length == FloatAddType.inputs.length,   "c3");
    assert(n1.outputs.length == FloatAddType.outputs.length, "c4");

    test_log("test - d");
    g.connect(n1, 0, n2, 1);
    assert(n1.outputs[0].length == 1,   "d1");
    assert(n2.inputs[1].length == 1,    "d2");
    assert(n2.inputs[0].length == 0,    "d3");
    assert(n1.inputs.length == FloatAddType.inputs.length,   "d4");
    assert(n1.outputs.length == FloatAddType.outputs.length, "d5");
    g.connect(n3, 1, n1, 1);
    assert(n1.inputs.length == FloatAddType.inputs.length,   "d6");
    assert(n1.outputs.length == FloatAddType.outputs.length, "d7");

    console.log("End kiwi graph test");
}

