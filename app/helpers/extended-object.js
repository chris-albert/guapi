import Ember from 'ember';
import _ from 'lodash/lodash';

export default Ember.Mixin.create({
  invoke(key,...args) {
    const func  = this.get(key);

    //var scope = this.get(_.initial(key.split('.')).join('.'));

    var scope = this;
    const split = _.initial(key.split('.')).join('.');
    if(!_.isEmpty(split)) {
      scope = this.get(split);
    }
    if (_.isFunction(func)) {
      return func.apply(scope, args);
    }
    return undefined;
  }
});
