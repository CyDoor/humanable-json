/* jshint expr:true */

'use strict';
var humanable = require('./humanable-json');
var expect = require('chai').expect;

var JSON_TESTS = {
  basic: {
    json: {
      basic: 'basic'
    },
    expected: {
      table: '' +
        '<table class=\"table table-bordered\" data-type=\"root\">\n' +
        '    <tbody>\n' +
        '        <tr>\n' +
        '            <th data-parent-type=\"object\">basic</th>\n' +
        '            <td><span data-type=\"string\">basic</span></td>\n' +
        '        </tr>\n' +
        '    </tbody>\n' +
        '</table>\n' +
        ''
    }

  }
};


describe('Unit: humanable-json', function () {

  describe('humanable API', function () {
    it('should be able require(\'humanable\') in Node', function (done) {
      expect(humanable).to.be.ok;
      expect(humanable.parseJSON).to.be.ok;
      done();
    });
    it('should have have expected APIs', function (done) {
      expect(humanable.parseJSON).to.be.ok;
      done();
    });
  });
  describe('humanable.parseJSON', function () {
    describe('opts (default or undefined)', function () {
      it('should be able return something with default opts', function (done) {
        expect(humanable.parseJSON(JSON_TESTS.basic.json)).to.be.ok;
        expect(humanable.parseJSON(JSON_TESTS.basic.json)).to.be.equal(JSON_TESTS.basic.expected.table);
        done();
      });
    });

  });
});
