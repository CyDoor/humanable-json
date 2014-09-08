'use strict';

function Transform(opts) {
  if (!(this instanceof Transform)) { return new Transform(opts); }
  opts = opts || {};
  this.indentMark = (opts.indentMark || opts.indentMark === '') ? opts.indentMark : '    ';
  this.newLine = (opts.newLine || opts.newLine === '') ? opts.newLine : '\n';
  this.indents = '';
  this.indent = function () {};
  this.indentRight = function () {};
  this.indentLeft = function () {};
}
Transform.prototype.createKeyNode = function createKeyNode(key, meta) {
  return ['key-node', meta.type, key].join(':');
};

Transform.prototype.createValueNode = function createValueNode(value, type, meta) {
  return ['value-node', meta.type, value].join(':');
};
Transform.prototype.createEmptyValueNode = function createEmptyValueNode(type, meta) {
  return ['empty-value-node', type].join(':');
};
Transform.prototype.createRootPrefix = function createRootPrefix(rootType) {
  return ['root-start', rootType, this.newLine].join(':');
};
Transform.prototype.createRootPostfix = function createRootPostfix(rootType) {
  return ['root-end', rootType, this.newLine].join(':');
};
Transform.prototype.createCollectionPrefix = function createCollectionPrefix(type, meta) {
  return ['collection-start', type, this.newLine].join(':');
};
Transform.prototype.createCollectionPostfix = function createCollectionPostfix(type, meta) {
  return ['collection-end', type, this.newLine].join(':');
};
Transform.prototype.createPairNode = function createPairNode(type, keyNode, valueNode, meta) {
  return ['pair-node', keyNode, valueNode, this.newLine].join(':');
};

module.exports = Transform;