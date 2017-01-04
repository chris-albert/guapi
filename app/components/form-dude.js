import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    submit(action) {
      //this.get('targetObject').send('submit',action);
      this.get('onSubmit')();
    },
    actionClick(action) {
      this.get('onActionClick')();
      //this.get('targetObject').send('actionClick',action);
    }
  }
});
