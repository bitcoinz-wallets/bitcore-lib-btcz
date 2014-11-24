'use strict';

var should = require('chai').should();
var bitcore = require('..');
var Point = bitcore.crypto.Point;
var BN = bitcore.crypto.BN;
var Pubkey = bitcore.Pubkey;
var Privkey = bitcore.Privkey;

describe('Pubkey', function() {

  it('should error because of missing data', function() {
    (function() {
      var pk = new Pubkey();
    }).should.throw('First argument is required, please include public key data.');
  });
  
  it('should error because of an invalid point', function() {
    (function() {
      var pk = new Pubkey(Point());
    }).should.throw('Point cannot be equal to 0, 0');
  });

  it('should error because of an invalid public key point, not on the secp256k1 curve', function() {
    (function() {
      var pk = new Pubkey(Point(1000, 1000));
    }).should.throw('Invalid y value of public key');
  });

  it('should error because of an unrecognized data type', function() {
    (function() {
      var pk = new Pubkey(new Error());
    }).should.throw('First argument is an unrecognized data format.');
  });

  it('should instantiate from a private key', function() {
    var privhex = '906977a061af29276e40bf377042ffbde414e496ae2260bbf1fa9d085637bfff';
    var pubhex = '02a1633cafcc01ebfb6d78e39f687a1f0995c62fc95f51ead10a02ee0be551b5dc';
    var privkey = new Privkey(BN(new Buffer(privhex, 'hex')));
    var pk = new Pubkey(privkey);
    pk.toString().should.equal(pubhex);
  });

  it('should instantiate from a hex encoded DER string', function() {
    var pk = new Pubkey('041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
    should.exist(pk.point);
    pk.point.getX().toString(16).should.equal('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
  });

  it('should instantiate from a hex encoded DER buffer', function() {
    var pk = new Pubkey(new Buffer('041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341', 'hex'));
    should.exist(pk.point);
    pk.point.getX().toString(16).should.equal('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
  });

  it('should create a public key with a point', function() {
    var p = Point('86a80a5a2bfc48dddde2b0bd88bd56b0b6ddc4e6811445b175b90268924d7d48',
                  '3b402dfc89712cfe50963e670a0598e6b152b3cd94735001cdac6794975d3afd');
    var a = new Pubkey(p);
    should.exist(a.point);
    a.point.toString().should.equal(p.toString());
    var c = Pubkey(p);
    should.exist(c.point);
    c.point.toString().should.equal(p.toString());
  });

  describe('#getValidationError', function(){
    it('should recieve an error message', function() {
      var error = Pubkey.getValidationError(Point());
      should.exist(error);
    });

    it('should recieve a boolean as false', function() {
      var valid = Pubkey.isValid(Point());
      valid.should.equal(false);
    });

    it('should recieve a boolean as true', function() {
      var valid = Pubkey.isValid('041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
      valid.should.equal(true);
    });

  });

  describe('#fromPoint', function() {

    it('should instantiate from a point', function() {
      var p = Point('86a80a5a2bfc48dddde2b0bd88bd56b0b6ddc4e6811445b175b90268924d7d48',
                    '3b402dfc89712cfe50963e670a0598e6b152b3cd94735001cdac6794975d3afd');
      var b = Pubkey.fromPoint(p);
      should.exist(b.point);
      b.point.toString().should.equal(p.toString());
    });

    it('should error because paramater is not a point', function() {
      (function() {
        Pubkey.fromPoint(new Error());
      }).should.throw('First argument must be an instance of Point.');
    });
  });

  describe('#fromJSON', function() {
    
    it('should input this public key', function() {
      var pk = Pubkey.fromJSON('041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
      pk.point.getX().toString(16).should.equal('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
      pk.point.getY().toString(16).should.equal('7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
    });

  });

  describe('#toJSON', function() {

    it('should output this pubkey', function() {
      var hex = '041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341';
      var pk = Pubkey.fromJSON(hex);
      pk.toJSON().should.equal(hex);
    });

  });

  describe('#fromPrivkey', function() {
    
    it('should make a public key from a privkey', function() {
      should.exist(Pubkey.fromPrivkey(Privkey.fromRandom()));
    });

    it('should error because not an instance of privkey', function() {
      (function() {
        Pubkey.fromPrivkey(new Error());
      }).should.throw('Must be an instance of Privkey');
    });

  });

  describe('#fromBuffer', function() {
    
    it('should parse this uncompressed public key', function() {
      var pk = Pubkey.fromBuffer(new Buffer('041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341', 'hex'));
      pk.point.getX().toString(16).should.equal('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
      pk.point.getY().toString(16).should.equal('7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
    });

    it('should parse this compressed public key', function() {
      var pk = Pubkey.fromBuffer(new Buffer('031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex'));
      pk.point.getX().toString(16).should.equal('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
      pk.point.getY().toString(16).should.equal('7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
    });

    it('should throw an error on this invalid public key', function() {
      (function() {
        Pubkey.fromBuffer(new Buffer('091ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex'));
      }).should.throw();
    });

    it('should throw error because not a buffer', function() {
      (function() {
        Pubkey.fromBuffer('091ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
      }).should.throw('Must be a hex buffer of DER encoded public key');
    });

    it('should throw error because buffer is the incorrect length', function() {
      (function() {
        Pubkey.fromBuffer(new Buffer('041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a34112', 'hex'));
      }).should.throw('Length of x and y must be 32 bytes');
    });

  });

  describe('#fromDER', function() {
    
    it('should parse this uncompressed public key', function() {
      var pk = Pubkey.fromDER(new Buffer('041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341', 'hex'));
      pk.point.getX().toString(16).should.equal('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
      pk.point.getY().toString(16).should.equal('7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
    });

    it('should parse this compressed public key', function() {
      var pk = Pubkey.fromDER(new Buffer('031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex'));
      pk.point.getX().toString(16).should.equal('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
      pk.point.getY().toString(16).should.equal('7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
    });

    it('should throw an error on this invalid public key', function() {
      (function() {
        Pubkey.fromDER(new Buffer('091ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex'));
      }).should.throw();
    });

  });

  describe('#fromString', function() {

    it('should parse this known valid public key', function() {
      var pk = Pubkey.fromString('041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
      pk.point.getX().toString(16).should.equal('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
      pk.point.getY().toString(16).should.equal('7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
    });

  });

  describe('#fromX', function() {
    
    it('should create this known public key', function() {
      var x = BN.fromBuffer(new Buffer('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex'));
      var pk = Pubkey.fromX(true, x);
      pk.point.getX().toString(16).should.equal('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
      pk.point.getY().toString(16).should.equal('7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
    });


    it('should error because odd was not included as a param', function() {
      var x = BN.fromBuffer(new Buffer('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex'));
      (function() {
        var pk = Pubkey.fromX(null, x);
      }).should.throw('Must specify whether y is odd or not (true or false)');
    });

  });

  describe('#toBuffer', function() {

    it('should return this compressed DER format', function() {
      var x = BN.fromBuffer(new Buffer('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex'));
      var pk = Pubkey.fromX(true, x);
      pk.toBuffer().toString('hex').should.equal('031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
    });

  });

  describe('#toDER', function() {

    it('should return this compressed DER format', function() {
      var x = BN.fromBuffer(new Buffer('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex'));
      var pk = Pubkey.fromX(true, x);
      pk.toDER(true).toString('hex').should.equal('031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
    });

    it('should return this uncompressed DER format', function() {
      var x = BN.fromBuffer(new Buffer('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex'));
      var pk = Pubkey.fromX(true, x);
      pk.toDER(false).toString('hex').should.equal('041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
    });

    it('should error because compressed param is invalid', function() {
      var x = BN.fromBuffer(new Buffer('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex'));
      var pk = Pubkey.fromX(true, x);
      (function() {
        pk.toDER('false'); //string not boolean
      }).should.throw('Must specify whether the public key is compressed or not (true or false)');
    });

  });

  describe('#toString', function() {
    
    it('should print this known public key', function() {
      var hex = '031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a';
      var pk = Pubkey.fromString(hex);
      pk.toString().should.equal(hex);
    });

  });

  describe('#inspect', function() {
    it('should output known uncompressed pubkey for console', function() {
      var pubkey = Pubkey.fromString('041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
      pubkey.inspect().should.equal('<Pubkey: 041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341, compressed: false>');
    });

    it('should output known compressed pubkey for console', function() {
      var pubkey = Pubkey.fromString('031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
      pubkey.inspect().should.equal('<Pubkey: 031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a, compressed: true>');
    });

  });

  describe('#validate', function() {

    it('should not have an error if pubkey is valid', function() {
      var hex = '031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a';
      var pk = Pubkey.fromString(hex);
    });
    
    it('should throw an error if pubkey is invalid', function() {
      var hex = '041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a0000000000000000000000000000000000000000000000000000000000000000';
      (function() {
        var pk = Pubkey.fromString(hex);
      }).should.throw('Invalid y value of public key');
    });
    
    it('should throw an error if pubkey is infinity', function() {
      (function() {
        var pk = new Pubkey(Point.getG().mul(Point.getN()));
      }).should.throw('Point cannot be equal to Infinity');
    });
    
  });

});
