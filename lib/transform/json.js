'use strict';

function Transform(opts) {
  if (!(this instanceof Transform)) { return new Transform(opts); }
  opts = opts || {};
  this.indentMark = (opts.indentMark || opts.indentMark === '') ? opts.indentMark : '    ';
  this.newLine = (opts.newLine || opts.newLine === '') ? opts.newLine : '\n';
  this.indents = '';

  this.indentRight = function indentRight(print) {
    this.indents += this.indentMark;
    return (print === false) ? '' : this.indents;
  };
  this.indentLeft = function indentLeft(print) {
    this.indents = this.indents.substr(0, this.indents.length - this.indentMark.length);
    return (print === false) ? '' : this.indents;
  };
  this.indent = function indent() {
    return this.indents;
  };
}
Transform.prototype.createKeyNode = function createKeyNode(key /*, meta */) {
  return ['"', key, '"'].join('');
};
Transform.prototype.createValueNode = function createValueNode(value, type /*, meta */) {
  if (type === 'string') {
    return ['"', value, '"'].join('');
  } else if (type === 'undefined') {
    return 'null';
  } else {
    return value;
  }
};

Transform.prototype.createEmptyValueNode = function createEmptyValueNode(type /*, meta */) {
  switch (type) {
    case 'string':
      return '""';
    case 'array':
      return '[]';
    case 'object':
      return '{}';
  }
  return type;
};

Transform.prototype.createRootPrefix = function createRootPrefix() {
  return [this.indent(), '{', this.newLine, this.indentRight(false)].join('');
};
Transform.prototype.createRootPostfix = function createRootPostfix() {
  return [this.indentLeft(), '}', this.newLine].join('');
};

Transform.prototype.createCollectionPrefix = function createCollectionPrefix(type, meta) {
  if (meta.parent.type === 'object' && type === 'array') {
    return [this.indent(), meta.keyNode, ': [', this.newLine, this.indentRight(false)].join('');
  } else if (meta.parent.type === 'object' && type === 'object') {
    return [this.indent(), meta.keyNode, ': {', this.newLine, this.indentRight(false)].join('');
  } else if (meta.parent.type === 'array' && type === 'array') {
    return [this.indent(), '[', this.newLine, this.indentRight(false)].join('');
  } else if (meta.parent.type === 'array' && type === 'object') {
    return [this.indent(), '{', this.newLine, this.indentRight(false)].join('');
  } else {
    return [this.indent(), meta.keyNode, ': {', this.newLine, this.indentRight(false)].join('');
  }
};

Transform.prototype.createCollectionPostfix = function createCollectionPostfix(type, meta) {
  this.indentLeft();
  var arr;
  if (type === 'array') {
    arr = [this.indent(), ']'];
  } else {
    arr = [this.indent(), '}'];
  }
  if (!meta.isLast) {
    arr = arr.concat([',', this.newLine]);
  } else {
    arr = arr.concat([this.newLine]);
  }
  return arr.join('');
};

Transform.prototype.createPairNode = function createPairNode(type, keyNode, valueNode, meta) {
  var arr;
  if (meta.parent.type === 'object') {
    arr = [this.indent(), keyNode, ': ', valueNode];
  } else if (meta.parent.type === 'array') {
    arr = [this.indent(), valueNode];
  } else {
    arr = [this.indent(), valueNode];
  }
  if (!meta.isLast) {
    arr = arr.concat([',', this.newLine]);
  } else {
    arr = arr.concat([this.newLine]);
  }
  return arr.join('');
};

module.exports = Transform;