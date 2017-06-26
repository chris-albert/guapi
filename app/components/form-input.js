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
  showPopover: Ember.computed('popover.active', function() {
    if(this.get('popover.active')) {
      return true;
    }
    return false;
  }),
  submitText: Ember.computed('submit.display', function() {
    return this.get('submit.display');
  }),
  submitClass: Ember.computed('submit.type', 'submit.size', function() {
    const type = this.get('submit.type');
    const size = this.get('submit.size');
    return 'btn-' + type + ' btn-' + size;
  }),
  popoverVisibleChanged: Ember.computed('popover.visible',function() {
    console.log('popover visible changed');
  }),
  didInsertElement() {
    if(this.get('popover.active')) {
      this.$(window).click(() => {
        if(this.get('popover.visible')) {
          this.set('popover.visible',false);
        }
      })
    }
  },
  willDestroyElement() {
    this.$(window).unbind('click');
  }
});
