/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    'ember-bootstrap': {
      'importBootstrapTheme': true
    },
    'ember-power-select': {
      theme: 'bootstrap'
    }
  });

  //doesn't work with bootstrap
  app.import('app/styles/select2.css');
  app.import('bower_components/select2/dist/js/select2.min.js');
  //Adding bootstrap-switch
  app.import('bower_components/bootstrap-switch/dist/js/bootstrap-switch.min.js');
  app.import('bower_components/bootstrap-switch/dist/css/bootstrap3/bootstrap-switch.min.css');
  //app.import('bower_components/ember/ember-template-compiler.js');

  return app.toTree();
};
