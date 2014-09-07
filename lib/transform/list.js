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
Transform.prototype.createKeyNode = function createKeyNode(key, meta) {
  return key;
};
Transform.prototype.createValueNode = function createValueNode(value, type, meta) {
  return ['<span data-type="', type, '">', value, '</span>'].join('');
};

Transform.prototype.createEmptyValueNode = function createEmptyValueNode(type, meta) {
  return ['<span data-type="', type, '"> Empty ', type, '</span>'].join('');
};

Transform.prototype.createRootPrefix = function createRootPrefix(rootType) {
  this.indentRight();
  if (rootType === 'object') {
    return [
      '<dl class="dl-horizontal text-overflow" data-type="', rootType, '" data-is-root="1">', this.newLine
    ].join('');
  } else if (rootType === 'array') {
    return [
      '<ol start="0" class="" data-type="', rootType, '" data-is-root="1">', this.newLine
    ].join('');
  } else {
    return this.newLine;
  }
};
Transform.prototype.createRootPostfix = function createRootPostfix(rootType) {
  this.indentLeft();
  if (rootType === 'object') {
    return [
      '</dl>', this.newLine
    ].join('');
  } else if (rootType === 'array') {
    return [
      '</ol>', this.newLine
    ].join('');
  } else {
    return this.newLine;
  }
};

Transform.prototype.createCollectionPrefix = function createCollectionPrefix(type, meta) {
  var v;
  if (type === 'array' && meta.parent.type === 'object') {
    v = [
      this.indent(), '<dt>', meta.keyNode, '</dt>', this.newLine,
      this.indent(), '<dd>', this.newLine,
      this.indentRight(), '<ol start="0" class="" data-parent-type="', meta.parent.type, '" data-type="', type, '">', this.newLine
    ].join('');
    this.indentRight();
    return v;
  } else if (type === 'array' && meta.parent.type === 'array') {
    v = [
      this.indent(), '<li>', this.newLine,
      this.indentRight(), '<ol start="0" class="" data-parent-type="', meta.parent.type, '" data-type="', type, '">', this.newLine
    ].join('');
    this.indentRight();
    return v;
  } else if (type === 'object' && meta.parent.type === 'array') {
    v = [
      this.indent(), '<li>', this.newLine,
      this.indentRight(), '<ol start="0" class="" data-parent-type="', meta.parent.type, '" data-type="', type, '">', this.newLine
    ].join('');
    this.indentRight();
    return v;
  } else {
    v = [
      this.indent(), '<dt>', meta.keyNode, '</dt>', this.newLine,
      this.indent(), '<dd>', this.newLine,
      this.indentRight(), '<span class="clearfix"></span>', this.newLine,
      this.indent(), '<dl class="dl-horizontal text-overflow" data-parent-type="', meta.parent.type, '" data-type="', type, '">', this.newLine
    ].join('');
    this.indentRight();
    return v;
  }

};

Transform.prototype.createCollectionPostfix = function createCollectionPostfix(type, meta) {

  if (type === 'array' && meta.parent.type === 'object') {
    return [
      this.indentLeft(), '</ol>', this.newLine,
      this.indentLeft(), '</dd>', this.newLine
    ].join('');
  } else if (type === 'array' && meta.parent.type === 'array') {
    return [
      this.indentLeft(), '</ol>', this.newLine,
      this.indentLeft(), '</li>', this.newLine
    ].join('');
  } else  if (type === 'object' && meta.parent.type === 'array') {
    return [
      this.indentLeft(), '</ol>', this.newLine,
      this.indentLeft(), '</li>', this.newLine
    ].join('');
  } else {
    return [
      this.indentLeft(), '</dl>', this.newLine,
      this.indentLeft(), '</dd>', this.newLine
    ].join('');

  }
};

Transform.prototype.createPairNode = function createPairNode(type, key, value, meta) {
  if (meta.parent.type === 'array') {
    return [this.indent(), '<li>', value, '</li>', this.newLine].join('');
  } else {
    return [
      this.indent(), '<dt>', key, '</dt>', this.newLine,
      this.indent(), '<dd>', value, '</dd>', this.newLine
    ].join('');
  }
};

module.exports = Transform;