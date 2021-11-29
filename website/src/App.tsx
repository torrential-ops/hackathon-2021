import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Routes, Route} from "react-router-dom";
import Home from './pages/Home';
import Account from './pages/Account';

function App() {
  return (
  <Routes>
    <Route path='/' element={<Home />} />
    <Route path='/Account' element={<Account />} />
  </Routes>
  );
}

export default App;

