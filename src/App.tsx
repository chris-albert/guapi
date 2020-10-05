import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import Routes from "./components/Routes";
import 'ace-builds'
import 'ace-builds/webpack-resolver'
import "react-datepicker/dist/react-datepicker.css";

function App() {
  return (
    <div className="App">
      <Routes/>
    </div>
  );
}

export default App;
