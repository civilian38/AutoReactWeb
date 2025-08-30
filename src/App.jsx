// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MainPage from './pages/MainPage'; // 1. MainPage 컴포넌트 import
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 2. 기존 Navigate를 MainPage 컴포넌트로 변경 */}
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;