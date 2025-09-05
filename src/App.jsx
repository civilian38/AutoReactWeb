// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MainPage from './pages/MainPage';
import ProjectsPage from './pages/ProjectsPage'; // 🌟 ProjectsPage 컴포넌트 import
import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/projects" element={<ProjectsPage />} /> {/* 🌟 /projects 경로 추가 */}
                </Routes>
            </div>
        </Router>
    );
}

export default App;
