KEYWORDS = ['node', 'edge', 'graph', 'digraph', 'subgraph', 'strict']
BRACES = ['[', '{', '}', ']']
DELIMITERS = [':', ';', ',']
OPERATORS = ['--', '->']

RE_SPACE = /\s/
RE_ALPHA = /\w/
RE_DIGIT = /[\d|.]/
RE_ALPHADIGIT = /[\d|\w]/

class Token
    constructor: (@value) ->

class Keyword extends Token
class Id extends Token
class Number extends Id
class QuotedId extends Id
class Brace extends Token
class Delimiter extends Token
class Assign extends Token
class Operator extends Token

dot_tokenize = (s) ->
    pos = 0
    row = 0
    col = 0

    len = s.length
    tokens = []
    last_chr = chr = null

    while pos < len
        last_chr = chr
        token = null
        col++
        chr = s[pos++]

        # Space
        if chr.match(/\s/)
            if chr == '\n'
                row++
                col = 0
            continue

        # Assign
        else if chr == '='
            token = new Assign(chr)

        # Operator
        else if chr == '-'
            op = chr + s[pos++]
            if op in OPERATORS
                token = new Operator(op)
        # Brace
        else if chr in BRACES
            token = new Brace(chr)

        # Delimiter
        else if chr in DELIMITERS
            token = new Delimiter(chr)

        # Identifier
        else if chr.match(/\w/)
            id = chr

            while (chr = s[pos++])?.match(/\w|\d/)
                id += chr
            pos--
            if id in KEYWORDS
                token = new Keyword(id)
            else
                token = new Id(id)

        # Quoted id
        else if chr == '"'
            id = ''
            escape = false
            while ((chr = s[pos++]) != '"' or escape) and chr?
                if chr == '\\' and not escape
                    escape = true
                    continue

                if escape
                    if chr == 'n'
                        chr = '\n'
                    else if chr == 't'
                        chr = '\t'
                    else if chr == 'r'
                        chr = '\r'
                    else if chr == '"'
                        chr = '"'
                    else if chr == '\\'
                        chr = '\\'
                    else if chr == '\n'
                        chr = ''

                id += chr
                escape = false

            token = new QuotedId(id)

        # Number
        else if chr.match(/\d|\./)
            id = chr
            while (chr = s[pos++])?.match(/\d|\./)
                id += chr
            token = new Number(parseFloat(id))

        # Comment
        else if chr.match(/\/|\#/)
            if chr == '/' and s[pos] == '*'
                # Multiline comment
                pos+=2
                while not ((chr = s[pos]) == '*' and s[pos+1] == '/') and chr?
                    if chr == '\n'
                        row++
                        col = 0
                    else
                        col++
                    pos++
                pos+=2
            else
                if chr == '#' or (chr == '/' and s[pos] == '/')
                    while not ((chr = s[pos]) == '\n') and chr?
                        col++
                        pos++
        else
            throw "[Dot Tokenizer] Syntax error in dot #{chr} at #{row}, #{col}"

        if token
            tokens.push(token)
    tokens


class Graph
    constructor: (@type, @id, @strict) ->
        @statements = []

class Statement

class SubGraph
    constructor: (@id) ->
        @statements = []

class Node extends Statement
    constructor: (@id, @port, @compass_pt) ->
        @attributes = []

class Edge extends Statement
    constructor:  ->
        @node_list = []

class Attribute
    constructor: (@left, @right) ->

class Attributes extends Statement
    constructor: (@type) ->
        @attributes = []

parse_dot_tokens = (tokens) ->
    pos = 0
    level = 0
    if not tokens[pos] instanceof Keyword
        throw 'First token is not a keyword'

    strict = false
    if tokens[pos].value == 'strict'
        strict = true
        pos++

    type = null
    if tokens[pos].value == 'graph'
        type = 'normal'
    else if tokens[pos].value == 'digraph'
        type = 'directed'
    if type == null
        throw 'Unknown graph type'

    id = null
    if tokens[++pos] instanceof Id
        id = tokens[pos++].value

    parse_attribute = ->
        if tokens[pos] instanceof Brace and tokens[pos].value == ']'
            if tokens[pos+1] instanceof Brace and tokens[pos+1].value == '['
                # Concatenate multiple lists by skipping both
                pos+=2
            else
                return null
        if not tokens[pos] instanceof Id
            throw "Invalid left hand side of attribute '#{tokens[pos].value}'"
        left = tokens[pos].value
        pos++
        if not tokens[pos] instanceof Assign
            throw "Invalid assignement '#{tokens[pos].value}'"
        pos++
        if not tokens[pos] instanceof Id
            throw "Invalid right hand side of attribute '#{tokens[pos].value}'"
        right = tokens[pos].value
        new Attribute(left, right)

    parse_attribute_list = ->
        if not tokens[pos] instanceof Brace and tokens[pos].value == '['
            throw 'No opening brace "[" for attribute list'
        pos++
        attributes = []
        while true
            attribute = parse_attribute()
            if attribute == null
                break
            else
                attributes.push attribute
                if tokens[pos+1] instanceof Delimiter and tokens[pos+1].value == ','
                    pos++
        attributes

    parse_subgraph = ->
        id = null
        if tokens[pos] instanceof Keyword and tokens[pos].value == 'subgraph'
            pos++
            if tokens[pos] instanceof Id
                id = tokens[pos++].value

        subgraph = new SubGraph(id)
        subgraph.statements = parse_statement_list()
        subgraph

    parse_node = ->
        if tokens[pos] instanceof Keyword and tokens[pos].value == 'subgraph'
            node = parse_subgraph()
        else if tokens[pos] instanceof Brace and tokens[pos].value == '{'
            node = parse_subgraph()
        else
            if not tokens[pos] instanceof Id
                throw "Invalid edge id '#{tokens[pos].value}'"

    parse_node_list = ->
        node_list = []

        while tokens[pos] instanceof Operator
            parse_node()
            node = new Node(tokens[pos].value)
            node_list.push(node)
        node_list

    parse_statement = ->
        if tokens[pos] instanceof Brace and tokens[pos].value == '}'
            return null
        if tokens[pos] instanceof Brace and tokens[pos].value == '{'
            statement = parse_subgraph()
        else if tokens[pos] instanceof Keyword
            # Subgraph
            if tokens[pos].value == 'subgraph'
                pos++
                statement = parse_subgraph()
            else if tokens[pos].value in ['graph', 'node', 'edge']
                statement = new Attributes(tokens[pos].value)
                statement.attributes = parse_attribute_list()
                return statement
            else
                throw 'Unexpected keyword ' + tokens[pos]
        else if tokens[pos] instanceof Id
            if tokens[pos+1] instanceof Assign
                pos+=2
                if not tokens[pos] instanceof Id
                    throw "Invalid right hand side of attribute '#{tokens[pos].value}'"
                statement = new Attribute(id, tokens[pos].value)
                return statement

            statement = new Edge()
            statement.node_list = parse_node_list()

            if tokens[pos+1] instanceof Brace and tokens[pos+1].value == '['
                statement.attributes = parse_attribute_list()
        else
            throw "Unexpected statement '#{tokens[pos].value}'"
        statement

    # Populate graph statements list
    parse_statement_list = ->
        if not tokens[pos] instanceof Brace and tokens[pos].value == '{'
            throw 'No opening brace "{" for statement list'
        pos++

        statements = []
        while true
            statement = parse_statement()
            if statement == null
                pos++
                break
            else
                statements.push statement
                if tokens[pos] instanceof Delimiter and tokens[pos].value == ';'
                    pos++
        statements

    graph = new Graph(type, id, strict)
    graph.statements = parse_statement_list()
    if pos != tokens.length
        throw "Error in dot file, parsed #{pos} elements out of #{tokens.length}"

    window.g = graph


dot = (src) ->
    mknode = (l) ->
        new rectangle(undefined, undefined, l)

    tokens = dot_tokenize src
    graph = parse_dot_tokens tokens

    d = window.diagram = new ShapeDiagram()
    window.svg = new Svg()

    nodes_by_id = {}
    d.title = graph.id
    link_type = if graph.type == 'directed' then blackarrow else bare_link
    for statement in graph.statements
        if statement instanceof Node
            if statement.id not of nodes_by_id
                node = mknode statement.id
                d.elements.push node
                nodes_by_id[statement.id] = node
        else if statement instanceof Edge
            for edge, i in statement.node_list
                if edge.id not of nodes_by_id
                    node = mknode edge.id
                    d.elements.push node
                    nodes_by_id[edge.id] = node

                if i != 0
                    link = new link_type(nodes_by_id[statement.node_list[i - 1].id], nodes_by_id[edge.id])
                    d.links.push link

    d.force = true
    d.hash()
