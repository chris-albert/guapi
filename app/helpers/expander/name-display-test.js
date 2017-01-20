import Ember from 'ember';
import _ from 'lodash';
import NameDisplayExpander from './name-display';

export default Ember.Object.extend({
  test() {
    this.testExpandString();
    this.testExpand();
  },
  testExpand() {
    this.assert(NameDisplayExpander.expand("plainString"), "plainString");

    this.assert(NameDisplayExpander.expand({
      "name": "Display Text::plainText",
      "foo": "bar"
    }), {
      "display": "Display Text",
      "name": "plainText",
      "foo": "bar"
    });
    this.assert(NameDisplayExpander.expand({
      "name": "::plainText",
      "foo": "bar"
    }), {
      "display": "Plain Text",
      "name": "plainText",
      "foo": "bar"
    });
    this.assert(NameDisplayExpander.expand({
      "name": "plainText::",
      "foo": "bar"
    }), {
      "display": "plainText",
      "name": "plainText",
      "foo": "bar"
    });

    this.assert(NameDisplayExpander.expand(["Foo::bar","::baz", "bat::"]), [
      {
        "display": "Foo",
        "name": "bar"
      },
      {
        "display": "Baz",
        "name": "baz"
      },
      {
        "display": "bat",
        "name": "bat"
      }
    ]);
  },
  testExpandString() {
    this.assert(NameDisplayExpander.expandString("plainString"), "plainString");

    this.assert(NameDisplayExpander.expandString("Nice Name::plainName"), {
      "display": "Nice Name",
      "name": "plainName"
    });

    this.assert(NameDisplayExpander.expandString("::plainName"), {
      "display": "Plain Name",
      "name": "plainName"
    });

    this.assert(NameDisplayExpander.expandString("plainName::"), {
      "display": "plainName",
      "name": "plainName"
    });
  },
  assert(a,b) {
    if(!_.isEqual(a,b)) {
      console.error(a, 'was not equal to',b);
    }
  }
}).create();
