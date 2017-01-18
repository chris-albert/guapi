import { module, test } from 'ember-qunit';
import config from '../../helpers/condensed-config';

module('Unit | Helper | condensed-config');

test('should correctly concat foo', function(assert) {
  const inObj = {
    a: 'b'
  };
  config.process(inObj)
    .then(json => {
      assert(json,inObj);
    });
});
