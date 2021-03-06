var end, eq, g, i, lex_test, node, tok, token_test;

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

module("Dot Lexer");

eq = equal;

g = null;

lex_test = function(title, s, tests) {
  return test(title + " \n\n" + s + "\n\n", function() {
    g = dot_lex(dot_tokenize(s));
    tests();
    return g = null;
  });
};

lex_test("graph normal", 'graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph directed", 'digraph {}', function() {
  eq(g.type, 'directed');
  eq(g.id, null);
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("graph strict", 'strict graph {}', function() {
  eq(g.type, 'normal');
  eq(g.id, null);
  eq(g.strict, true);
  return deepEqual(g.statements, []);
});

lex_test("graph with id", 'graph "My Graph" {}', function() {
  eq(g.type, 'normal');
  eq(g.id, "My Graph");
  eq(g.strict, false);
  return deepEqual(g.statements, []);
});

lex_test("simple nodes", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, 'h');
  eq(g.statements[0].nodes[2].compass_pt, null);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, 'e');
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, null);
  return eq(g.statements[1].nodes[1].compass_pt, null);
});

lex_test('simple node directed', "digraph graphname {\n  a -> b -> c\n  b -> d:id:nw\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 3);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  eq(g.statements[0].nodes[0].port, null);
  eq(g.statements[0].nodes[0].compass_pt, null);
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].nodes[1].port, null);
  eq(g.statements[0].nodes[1].compass_pt, null);
  ok(g.statements[0].nodes[2] instanceof Node);
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].id, 'c');
  eq(g.statements[0].nodes[2].port, null);
  eq(g.statements[0].nodes[2].compass_pt, null);
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'b');
  eq(g.statements[1].nodes[0].port, null);
  eq(g.statements[1].nodes[0].compass_pt, null);
  ok(g.statements[1].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[1].id, 'd');
  eq(g.statements[1].nodes[1].port, 'id');
  eq(g.statements[1].nodes[1].compass_pt, 'nw');
  return eq(g.statements[1].attributes.length, 0);
});

lex_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red [shape=box, \"size\"=.9 id=ea]\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'red');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'blue');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'label');
  eq(g.statements[0].attributes[0].right, 'lbl');
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].id, 'red');
  eq(g.statements[1].attributes.length, 3);
  eq(g.statements[1].attributes[0].left, 'shape');
  eq(g.statements[1].attributes[0].right, 'box');
  eq(g.statements[1].attributes[1].left, 'size');
  eq(g.statements[1].attributes[1].right, .9);
  eq(g.statements[1].attributes[2].left, 'id');
  return eq(g.statements[1].attributes[2].right, 'ea');
});

lex_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  eq(g.statements.length, 1);
  ok(g.statements[0] instanceof Attributes);
  eq(g.statements[0].type, 'edge');
  eq(g.statements[0].attributes.length, 1);
  eq(g.statements[0].attributes[0].left, 'one');
  return eq(g.statements[0].attributes[0].right, 1);
});

lex_test('basic subgraph', "digraph {\n  a -> b;\n  { c; b -> c }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'b');
  ok(g.statements[1].nodes[0].statements[1].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[0].statements[1].nodes[1].id, 'c');
});

lex_test('linked subgraph', "digraph {\n  a -> b;\n  { c -> d o } -> subgraph { e -> a }\n}", function() {
  eq(g.statements.length, 2);
  ok(g.statements[0] instanceof Edge);
  eq(g.statements[0].nodes.length, 2);
  ok(g.statements[0].nodes[0] instanceof Node);
  eq(g.statements[0].nodes[0].id, 'a');
  ok(g.statements[0].nodes[1] instanceof Node);
  eq(g.statements[0].nodes[1].id, 'b');
  eq(g.statements[0].attributes.length, 0);
  ok(g.statements[1] instanceof Edge);
  eq(g.statements[1].nodes.length, 2);
  ok(g.statements[1].nodes[0] instanceof SubGraph);
  eq(g.statements[1].nodes[0].statements.length, 2);
  ok(g.statements[1].nodes[0].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[0].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[0].id, 'c');
  ok(g.statements[1].nodes[0].statements[0].nodes[1] instanceof Node);
  eq(g.statements[1].nodes[0].statements[0].nodes[1].id, 'd');
  ok(g.statements[1].nodes[0].statements[1] instanceof Edge);
  eq(g.statements[1].nodes[0].statements[1].nodes.length, 1);
  ok(g.statements[1].nodes[0].statements[1].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[0].statements[1].nodes[0].id, 'o');
  ok(g.statements[1].nodes[1] instanceof SubGraph);
  eq(g.statements[1].nodes[1].statements.length, 1);
  ok(g.statements[1].nodes[1].statements[0] instanceof Edge);
  eq(g.statements[1].nodes[1].statements[0].nodes.length, 2);
  ok(g.statements[1].nodes[1].statements[0].nodes[0] instanceof Node);
  eq(g.statements[1].nodes[1].statements[0].nodes[0].id, 'e');
  ok(g.statements[1].nodes[1].statements[0].nodes[1] instanceof Node);
  return eq(g.statements[1].nodes[1].statements[0].nodes[1].id, 'a');
});

module("Dot Tokenizer");

i = tok = null;

node = function(type, value) {
  ok(tok[i] instanceof type, "Node is " + type.name);
  return equal(tok[i++].value, value, "Node contains " + value);
};

end = function() {
  return ok(tok[i] == null, "There's no extra elements");
};

token_test = function(title, s, tests) {
  return test(title + ": \n\n" + s + "\n\n", function() {
    i = 0;
    tok = dot_tokenize(s);
    tests();
    i = null;
    return tok = null;
  });
};

token_test('simple', 'graph {}', function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Brace, '}');
  return end();
});

token_test("normal", "graph graphname {\n  a -- b -- c:h;\n  b:e -- d;\n}", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Delimiter, ':');
  node(Id, 'h');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Delimiter, ':');
  node(Id, 'e');
  node(Operator, '--');
  node(Id, 'd');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('directed', "digraph graphname {\n  a -> b -> c;\n  b -> d:id:nw;\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'a');
  node(Operator, '->');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'c');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '->');
  node(Id, 'd');
  node(Delimiter, ':');
  node(Id, 'id');
  node(Delimiter, ':');
  node(Id, 'nw');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with quoted strings', "digraph \"Graph name\" {\n  \"Node with \\\" in it\" -> \"Node with\nline break\";\n}", function() {
  node(Keyword, 'digraph');
  node(Id, 'Graph name');
  node(Brace, '{');
  node(Id, 'Node with " in it');
  node(Operator, '->');
  node(Id, 'Node with\nline break');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

token_test('with attributes', "graph {\n  red -- blue [label=\"lbl\"];\n  red -- green [shape=box, \"size\"=1.9 id=ea];\n}", function() {
  node(Keyword, 'graph');
  node(Brace, '{');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'blue');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'lbl');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'red');
  node(Operator, '--');
  node(Id, 'green');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Delimiter, ',');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, 1.9);
  node(Id, 'id');
  node(Assign, '=');
  node(Id, 'ea');
  node(Brace, ']');
  return node(Delimiter, ';');
});

token_test('test attr_stmt', "digraph {\n  edge [one = 1.00]\n}", function() {
  node(Keyword, 'digraph');
  node(Brace, '{');
  node(Keyword, 'edge');
  node(Brace, '[');
  node(Id, 'one');
  node(Assign, '=');
  node(Number, 1);
  node(Brace, ']');
  node(Brace, '}');
  return end();
});

token_test("with comments", "graph graphname {\n   // This attribute applies /to the graph itself\n   size=\"1,1\"; /* size to 1,1 */\n   // The label attribute can be used to change the label of a node\n   a [label=\"Foo\"]; // label to Foo\n   # Here, the node /shape is changed.\n   b [shape=box]; # Shape to box\n   /* These edges both\n    have different /line\n    properties\n   */\n   a -- b -- c [color=blue];\n   b -- d [style=dotted];\n }", function() {
  node(Keyword, 'graph');
  node(Id, 'graphname');
  node(Brace, '{');
  node(Id, 'size');
  node(Assign, '=');
  node(Id, '1,1');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Brace, '[');
  node(Id, 'label');
  node(Assign, '=');
  node(Id, 'Foo');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Brace, '[');
  node(Id, 'shape');
  node(Assign, '=');
  node(Id, 'box');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'a');
  node(Operator, '--');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'c');
  node(Brace, '[');
  node(Id, 'color');
  node(Assign, '=');
  node(Id, 'blue');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Id, 'b');
  node(Operator, '--');
  node(Id, 'd');
  node(Brace, '[');
  node(Id, 'style');
  node(Assign, '=');
  node(Id, 'dotted');
  node(Brace, ']');
  node(Delimiter, ';');
  node(Brace, '}');
  return end();
});

//# sourceMappingURL=tests.js.map
