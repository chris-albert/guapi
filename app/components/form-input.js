import Ember from 'ember';

export default Ember.Component.extend(Ember.Mixins.ExtendedObject, {
  actions: {
    submit(action) {
      this.invoke('onSubmit', action);
    },
    actionClick(action) {
      this.invoke('onActionClick', action);
    },
    formChange() {
      this.invoke('onFormChange');
    }
  },
  submitText: Ember.computed('submit.display', function() {
    return this.get('submit.display');
  }),
  submitClass: Ember.computed('submit.type', 'submit.size', function() {
    const type = this.get('submit.type');
    const size = this.get('submit.size');
    return 'btn-' + type + ' btn-' + size;
  })
});
