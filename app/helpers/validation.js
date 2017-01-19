import Ember from 'ember';
import _ from 'lodash';

export default Ember.Mixin.create({
  validate(name, keys) {
    var errors = [];
    _.each(keys, key => {
      if(_.isUndefined(this.get(key)) || _.isNull(this.get(key))) {
        errors.push(key);
      }
    });
    if(!_.isEmpty(errors)) {
      throw new Error('Error validating [' + name + '][' + this.get('name') + ']: missing properties [' + errors + ']');
    }
  }
});
