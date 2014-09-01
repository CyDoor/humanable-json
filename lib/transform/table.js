'use strict';

function Transform(opts) {
  if (!(this instanceof Transform)) { return new Transform(opts); }
  opts = opts || {};
  this.indentMark = (opts.indentMark || opts.indentMark === '') ? opts.indentMark : '    ';
  this.newLine = (opts.newLine || opts.newLine === '') ? opts.newLine : '\n';
  this.indents = '';
  this.classNames = opts.classNames || {};

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
Transform.prototype.createKeyNode = function createKeyNode(key, meta) {
  return key;
};
Transform.prototype.createValueNode = function createValueNode(value, type, meta) {
  if (type === 'function') {
    value = 'function';
  } else if (type === 'string') {
    value = value
      .replace(/\\r/g, '<br/>')
      .replace(/\\n/g, '<br/>');
  }
  return value;
};

Transform.prototype.createEmptyValueNode = function createEmptyValueNode(type, meta) {
  var str = 'Empty';
  if (type === 'string') {
    str = 'Empty String';
  } else if (type === 'object') {
    str = 'Empty Object';
  } else if (type === 'array') {
    str = 'Empty Array';
  }
  return str;
};

Transform.prototype.createRootPrefix = function createRootPrefix() {
  return [
    '<table class="table table-bordered', (this.classNames.root) ? ' ' + this.classNames.root : '', '" data-type="root">', this.newLine,
    this.indentRight(), '<tbody>', this.newLine, this.indentRight(false)
  ].join('');
};
Transform.prototype.createRootPostfix = function createRootPostfix() {
  return [
    this.indentLeft(), '</tbody>', this.newLine,
    '</table>', this.newLine, this.indentLeft(false)
  ].join('');
};

Transform.prototype.createCollectionPrefix = function createCollectionPrefix(type, meta) {
  return [
    this.indent(), '<tr>', this.newLine,
    this.indentRight(), '<th data-parent-type="', meta.parent.type, '">', meta.keyNode, '</th>', this.newLine,
    this.indent(), '<td>', this.newLine,
    this.indentRight(), '<table class="table table-bordered" data-type="', type, '">', this.newLine,
    this.indentRight(), '<tbody>', this.newLine, this.indentRight(false)
  ].join('');
};

Transform.prototype.createCollectionPostfix = function createCollectionPostfix() {
  return [
    this.indentLeft(), '</tbody>', this.newLine,
    this.indentLeft(), '</table>', this.newLine,
    this.indentLeft(), '</td>', this.newLine,
    this.indentLeft(), '</tr>', this.newLine
  ].join('');
};

Transform.prototype.createPairNode = function createPairNode(type, keyNode, valueNode, meta) {
  return [
    this.indent(), '<tr>', this.newLine,
    this.indentRight(), '<th data-parent-type="', meta.parent.type, '">', keyNode, '</th>', this.newLine,
    this.indent(), '<td><span data-type="', type, '">', valueNode, '</span></td>', this.newLine,
    this.indentLeft(), '</tr>', this.newLine
  ].join('');
};

module.exports = Transform;