import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import Routes from "./components/Routes";
import 'ace-builds'
import 'ace-builds/webpack-resolver'

function App() {
  return (
    <div className="App">
      <Routes/>
    </div>
  );
}

export default App;
