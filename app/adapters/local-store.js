import DS from 'ember-data';

export default DS.Adapter.extend({
  findRecord() {
    return new Ember.RSVP.Promise(function (resolve, reject) {
      resolve({
        id          : 'localhost',
        baseUrl     : 'localhost',
        clientId    : 'localhost',
        clientSecret: 'localhost',
        token       : 'localhost'
      });
    });
  },
  createRecord() {

  },
  updateRecord() {

  },
  deleteRecord() {

  },
  findAll() {

  },
  query() {

  },
  shouldReloadAll() {
    return true;
  }
});
