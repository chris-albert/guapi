import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    submit(action) {
      this.get('onSubmit')();
    },
    actionClick(action) {
      this.get('onActionClick')();
    },
    formChange() {
      this.get('onFormChange')();
    }
  }
});
