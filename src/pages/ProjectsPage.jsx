// src/pages/ProjectsPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // 🌟 Link import 추가
import './ProjectsPage.css';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get('https://autoreactgenerator-g8g9bge3heh0addq.koreasouth-01.azurewebsites.net/api/project/', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        setProjects(response.data.results);
      } catch (err) {
        console.error('프로젝트 목록을 불러오는데 실패했습니다:', err);
        setError('프로젝트 목록을 불러오는데 실패했습니다. 다시 로그인해주세요.');
        if (err.response && err.response.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [navigate]);

  if (loading) {
    return <div className="projects-container"><h1>로딩 중...</h1></div>;
  }

  if (error) {
    return <div className="projects-container"><h1 className="error-message">{error}</h1></div>;
  }

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h1>내 프로젝트 목록 🚀</h1>
        {/* 🌟 프로젝트 생성 페이지로 이동하는 버튼 추가 */}
        <Link to="/projects/create" className="create-project-button">
          + 새 프로젝트 생성
        </Link>
      </div>
      <div className="project-list">
        {projects.length > 0 ? (
          projects.map(project => (
            <div key={project.id} className="project-card">
              <h2>{project.name}</h2>
              <p>{project.description}</p>
              <span className="project-date">생성일: {new Date(project.created_at).toLocaleDateString()}</span>
            </div>
          ))
        ) : (
          <p>아직 생성된 프로젝트가 없습니다. 새 프로젝트를 만들어보세요!</p>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
