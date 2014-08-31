'use strict';

// load built-in transforms
require('./transform/table');
require('./transform/preformatted');
require('./transform/json');
require('./transform/list');
require('./transform/tagged');

var DEFAULT_TRANSFORM = {
  name: 'table',
  opts: {}
};

var TYPE_ENUM = {
  'unknown': 0,
  'array': 1,
  'bool': 2,
  'int': 3,
  'float': 4,
  'string': 5,
  'object': 6,
  'function': 7,
  'null': 8,
  'undefined': 9
};

var TYPE_ENUM_ARR = [];
for (var k in TYPE_ENUM) {
  if (!TYPE_ENUM.hasOwnProperty(k)) { continue; }
  TYPE_ENUM_ARR[TYPE_ENUM[k]] = k;
}
function _getType(obj) {
  var type = typeof obj;
  if (type === 'boolean') {
    return TYPE_ENUM.bool;
  } else if (type === 'string') {
    return TYPE_ENUM.string;
  } else if (type === 'number') {
    return (obj % 1 === 0) ? TYPE_ENUM.int : TYPE_ENUM.float;
  } else if (type === 'function') {
    return TYPE_ENUM.function;
  } else if (toString.call(obj) === '[object Array]') {
    return TYPE_ENUM.array;
  } else if (type === 'object' && obj === null) {
    return TYPE_ENUM.null;
  } else if (obj === Object(obj)) {
    return TYPE_ENUM.object;
  } else if (type === 'undefined') {
    return TYPE_ENUM.undefined;
  } else {
    return TYPE_ENUM.unknown;
  }
}

function getType(obj) {
  return TYPE_ENUM_ARR[_getType(obj)];
}

function clone(obj) {
  if (obj === null || typeof obj !== 'object') { return obj; }
  var copy = obj.constructor();
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) { copy[attr] = obj[attr]; }
  }
  return copy;
}

function objectLength(obj) {
  var count = 0;
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) { count++; }
  }
  return count;
}

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/"/g, '&quot;');
}

function parseJSON(obj, opts) {
  opts = clone(opts) || {};

  var escapeHTMLEntities = (opts.escapeHTMLEntities !== false);
  var transform = opts.transform || DEFAULT_TRANSFORM;
  if (getType(transform) === 'string') { transform = { name: transform, opts: {} }; }

  var Transform;
  try {
    Transform = require('./transform/' + transform.name);
  } catch (e) {
    Transform = require('./transform/' + DEFAULT_TRANSFORM.name);
  }
  Transform.prototype.createValueNode = transform.createValueNode || Transform.prototype.createValueNode;
  Transform.prototype.createKeyNode = transform.createKeyNode || Transform.prototype.createKeyNode;
  Transform.prototype.createEmptyValueNode = transform.createEmptyValueNode || Transform.prototype.createEmptyValueNode;
  Transform.prototype.createPairNode = transform.createPairNode || Transform.prototype.createPairNode;
  Transform.prototype.createRootPrefix = transform.createRootPrefix || Transform.prototype.createRootPrefix;
  Transform.prototype.createRootPostfix = transform.createRootPostfix || Transform.prototype.createRootPostfix;
  Transform.prototype.createCollectionPrefix = transform.createCollectionPrefix || Transform.prototype.createCollectionPrefix;
  Transform.prototype.createCollectionPostfix = transform.createCollectionPostfix || Transform.prototype.createCollectionPostfix;
  Transform = new Transform(transform.opts);

  var elements = [];
  function startRoot(rootType) {
    elements.push(Transform.createRootPrefix(rootType));
  }
  function endRoot(rootType) {
    elements.push(Transform.createRootPostfix(rootType));
  }
  function startCollection(collectionType, meta) {
    elements.push(Transform.createCollectionPrefix(collectionType, meta));
  }
  function endCollection(collectionType, meta) {
    elements.push(Transform.createCollectionPostfix(collectionType, meta));
  }
  function addPair(type, keyNode, valueNode, meta) {
    elements.push(Transform.createPairNode(type, keyNode, valueNode, meta));
  }

  function _parse(obj, parentMeta) {
    var result;
    var type = getType(obj);
//    var meta = {
//      parent: { type: type, parent: parentMeta },
//      isLast: true,
//      isRoot: false
//    };
    var meta = {
      isLast: true,
      isRoot: false,
      key: null,
      parent: parentMeta,
      type: type,
      value: obj
    };
//    console.log('parentMeta', parentMeta);
    switch (type) {
      case 'object':
        var objectLen = objectLength(obj);
        if (objectLen === 0) {
          result = Transform.createEmptyValueNode(type, meta);
          break;
        }
        var count = 0;
        for (var key in obj) {
          if (!obj.hasOwnProperty(key)) { continue; }
          count++;
          meta.key = key;
          meta.isLast = (count === objectLen);
          _parseChild(key, obj[key], clone(meta));
        }
        break;
      case 'array':
        if (obj.length === 0) {
          result = Transform.createEmptyValueNode(type, meta);
          break;
        }
        for (var i = 0; i < obj.length; i++) {
          meta.key = i;
          meta.isLast = (i === obj.length - 1);
          _parseChild(i, obj[i], clone(meta));
        }
        break;
      case 'string':
        if (obj !== '') {
          obj = (escapeHTMLEntities) ? escapeHTML(obj) : obj;
          result = Transform.createValueNode(obj, type, parentMeta);
        } else {
          result = Transform.createEmptyValueNode(type, parentMeta);
        }
        break;
      case 'bool':
        result = Transform.createValueNode(obj, type, parentMeta);
        break;
      case 'int':
        result = Transform.createValueNode(obj, type, parentMeta);
        break;
      case 'float':
        result = Transform.createValueNode(obj, type, parentMeta);
        break;
      case 'function':
        result = Transform.createValueNode(obj, type, parentMeta);
        break;
      case 'null':
        result = Transform.createValueNode(type, 'null', parentMeta);
        break;
      case 'undefined':
        result = Transform.createValueNode(type, 'undefined', parentMeta);
        break;
      default:
        obj = (obj && escapeHTMLEntities) ? escapeHTML(obj) : obj;
        result = Transform.createValueNode(obj, type, parentMeta);
        break;
    }
    return result;
  }

  function _parseChild(key, child, meta) {
    var valueNode;
    var keyNode;
    var childType = getType(child);
    meta.key = key;
    meta.value = child;
    meta.valueType = childType;
    meta.type = childType;

    keyNode = Transform.createKeyNode(key, meta);
    meta.keyNode = keyNode;
    // note: at this point, valueNode has not been created yet

//    var parentMeta = {
//      type: rootType,
//      isRoot: false,
//      parent: null
//    };
    switch (childType) {
      case 'object':
        if (objectLength(child) > 0) {
          startCollection(childType, meta);
          _parse(child, meta);
          endCollection(childType, meta);
        } else {
          valueNode = _parse(child, meta);
          meta.value = child;
          meta.valueNode = valueNode;
          addPair(childType, keyNode, valueNode, meta);
        }
        break;
      case 'array':
        if (child.length > 0) {
          startCollection(childType, meta);
          _parse(child, meta);
          endCollection(childType, meta);
        } else {
          valueNode = _parse(child, meta);
          meta.value = child;
          meta.valueNode = valueNode;
          addPair(childType, keyNode, valueNode, meta);
        }
        break;
      default:
        valueNode = _parse(child, meta);
        meta.value = child;
        meta.valueNode = valueNode;
        addPair(childType, keyNode, valueNode, meta);
        break;
    }
  }

  var rootType = getType(obj);
  startRoot(rootType);
  var meta = {
    isLast: true,
    isRoot: true,
    parent: null,
    type: rootType + 'root',
    key: null,
    keyNode: null,
    value: obj,
    valueNode: null
  };
  _parse(obj, meta);
  endRoot(rootType);

  return elements.join('');
}

var humanable = {
  parseJSON: parseJSON
};

if (typeof window !== 'undefined') { window.humanable = humanable; }
module.exports = humanable;