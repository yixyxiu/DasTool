/*
import React from 'react';
import ReactDOM from 'react-dom';
import 'babel-polyfill';
import 'react-app-polyfill/ie11';
import 'antd/dist/antd.css';
import './index.css';
import Page from './Page';
import './mock';
import * as serviceWorker from './serviceWorker';
require('es6-symbol/implement');
ReactDOM.render(
    <Page />,
  document.getElementById('root')
);
*/



import React from "react"
import ReactDOM from "react-dom"

import { BrowserRouter as Router } from "react-router-dom";

import 'antd/dist/antd.css';
import './index.css';
//component
import Index from "./views/Index"

//stylesheet
//import "./functionBased/App.css"

//<Router basename={process.env.PUBLIC_URL}>
ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Index />
    </Router>  
  </React.StrictMode>, 
  document.getElementById("root")
);


//serviceWorker.unregister();