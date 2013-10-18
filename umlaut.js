// Generated by CoffeeScript 1.6.3
(function() {
  var Element, Link, Lozenge, Square, data, diagonal, drag, element, force, height, link, svg, sync, tick, width, _ref, _ref1,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Element = (function() {
    function Element(x, y, text, fixed) {
      this.x = x;
      this.y = y;
      this.text = text;
      this.fixed = fixed != null ? fixed : false;
      this.height = __bind(this.height, this);
      this.width = __bind(this.width, this);
      this._margin = {
        x: 10,
        y: 5
      };
    }

    Element.prototype.center = function() {
      return {
        x: this.x + (this._txt_bbox && this._txt_bbox.width || 0) / 2 + this._margin.x,
        y: this.y + (this._txt_bbox && this._txt_bbox.height || 0) / 2 + this._margin.y
      };
    };

    Element.prototype.width = function() {
      return this._txt_bbox.width + 2 * this._margin.x;
    };

    Element.prototype.height = function() {
      return this._txt_bbox.height + 2 * this._margin.y;
    };

    return Element;

  })();

  Square = (function(_super) {
    __extends(Square, _super);

    function Square() {
      _ref = Square.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Square.prototype.path = function() {
      return "M 0 0 L " + (this.width()) + " 0 L " + (this.width()) + " " + (this.height()) + " L 0 " + (this.height()) + " z";
    };

    return Square;

  })(Element);

  Lozenge = (function(_super) {
    __extends(Lozenge, _super);

    function Lozenge() {
      _ref1 = Lozenge.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    Lozenge.prototype.path = function() {
      return "M -10 0 L " + (this.width()) + " 0 L " + (this.width() + 10) + " " + (this.height()) + " L 0 " + (this.height()) + " z";
    };

    return Lozenge;

  })(Element);

  Link = (function() {
    function Link(elt1, elt2) {
      this.elt1 = elt1;
      this.elt2 = elt2;
      this.target = __bind(this.target, this);
      this.source = __bind(this.source, this);
      this.value = Math.random() * 10;
    }

    Link.prototype.source = function() {
      return this.elt1.center();
    };

    Link.prototype.target = function() {
      return this.elt2.center();
    };

    return Link;

  })();

  this.data = data = {};

  this.state = {
    selection: [],
    mouse: {
      x: 0,
      y: 0
    }
  };

  this.combinations = function(elts, n) {
    var f, result;
    if (elts.length < n) {
      return [];
    }
    if (elts.length === n) {
      return [elts];
    }
    result = [];
    f = function(prefix, elts) {
      var combination, i, _results;
      i = 0;
      _results = [];
      while (i < elts.length) {
        combination = prefix.concat(elts[i]);
        if (combination.length === n) {
          result.push(combination);
        }
        f(combination, elts.slice(i + 1));
        _results.push(i++);
      }
      return _results;
    };
    f([], elts);
    return result;
  };

  data.elts = [new Lozenge(1, 2, 'Yop'), new Square(343, 232, "That's right"), new Lozenge(130, 622, 'So what ?'), new Square(532, 92, "WTF")];

  data.lnks = [new Link(this.data.elts[0], this.data.elts[1]), new Link(this.data.elts[0], this.data.elts[2]), new Link(this.data.elts[1], this.data.elts[3]), new Link(this.data.elts[3], this.data.elts[0])];

  width = this.innerWidth;

  height = this.innerHeight - 25;

  svg = d3.select("body").append("svg").attr("width", width).attr("height", height);

  force = d3.layout.force().gravity(.15).distance(100).charge(-1000).size([width, height]);

  drag = force.drag().on("dragstart", function(elt) {
    if (d3.event.sourceEvent.shiftKey) {
      state.selection.push(elt);
    } else {
      d3.selectAll('.selected').classed('selected', false);
      state.selection = [elt];
    }
    return d3.select(this).classed('selected', true);
  });

  force.nodes(data.elts).links(data.lnks);

  diagonal = d3.svg.diagonal().source(function(elt) {
    return elt.source();
  }).target(function(elt) {
    return elt.target();
  }).projection(function(d) {
    return [d.x, d.y];
  });

  element = null;

  link = null;

  svg.on('click', function() {
    if (d3.event.target === this) {
      d3.selectAll('.selected').classed('selected', false);
      return state.selection = [];
    }
  });

  svg.append('g').attr('class', 'links');

  svg.append('g').attr('class', 'elements');

  sync = function() {
    link = svg.select('g.links').selectAll('path.link').data(data.lnks);
    link.enter().append("path").attr("class", "link");
    element = svg.select('g.elements').selectAll('g.element').data(data.elts);
    element.enter().append('g').attr('class', 'element').call(drag);
    element.append('path').attr('class', 'shape');
    element.append('text').attr('x', function(elt) {
      return elt._margin.x;
    }).attr('y', function(elt) {
      return elt._margin.y;
    });
    element.select('text').text(function(elt) {
      return elt.text;
    }).each(function(elt) {
      return elt._txt_bbox = this.getBBox();
    });
    element.select('path.shape').attr('d', function(elt) {
      return elt.path();
    });
    element.exit().remove();
    link.exit().remove();
    tick();
    return force.start();
  };

  tick = function() {
    element.attr("transform", (function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    }));
    return link.attr("d", diagonal);
  };

  d3.select('html').on('mousemove', function() {
    return state.mouse = d3.mouse(this);
  }).on('keydown', function() {
    var combination, elt, lnk, new_elt, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
    if (d3.event.which === 83) {
      new_elt = new Square(state.mouse[0], state.mouse[1], 'New element');
      data.elts.push(new_elt);
      _ref2 = state.selection;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        elt = _ref2[_i];
        data.lnks.push(new Link(elt, new_elt));
      }
      sync();
    }
    if (d3.event.which === 76) {
      _ref3 = combinations(state.selection, 2);
      for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
        combination = _ref3[_j];
        data.lnks.push(new Link(combination[0], combination[1]));
      }
      sync();
    }
    if (d3.event.which === 80) {
      _ref4 = state.selection;
      for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
        elt = _ref4[_k];
        elt.fixed = !elt.fixed;
      }
    }
    if (d3.event.which === 69) {
      _ref5 = state.selection;
      for (_l = 0, _len3 = _ref5.length; _l < _len3; _l++) {
        elt = _ref5[_l];
        elt.text = prompt("Enter a name for " + elt.text + ":");
      }
      sync();
    }
    if (d3.event.ctrlKey && d3.event.which === 65) {
      state.selection = data.elts;
      d3.selectAll('g.element').classed('selected', true);
      d3.event.preventDefault();
    }
    if (d3.event.which === 46) {
      _ref6 = state.selection;
      for (_m = 0, _len4 = _ref6.length; _m < _len4; _m++) {
        elt = _ref6[_m];
        data.elts.splice(data.elts.indexOf(elt), 1);
        _ref7 = data.lnks.slice();
        for (_n = 0, _len5 = _ref7.length; _n < _len5; _n++) {
          lnk = _ref7[_n];
          if (elt === lnk.elt1 || elt === lnk.elt2) {
            data.lnks.splice(data.lnks.indexOf(lnk), 1);
          }
        }
      }
      state.selection = [];
      d3.selectAll('g.element').classed('selected', false);
      return sync();
    }
  });

  force.on('tick', tick);

  sync();

  combinations(data.elts, 2);

}).call(this);
