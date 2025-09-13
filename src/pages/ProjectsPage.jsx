// src/pages/ProjectsPage.jsx

import React, { useState, useEffect } from 'react';
// ✨ 변경된 내용: 기존 axios 대신 새로 만든 api 인스턴스를 가져옵니다.
import api from '../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';
import './ProjectsPage.css';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      // AccessToken 확인 로직은 인터셉터가 처리하므로 여기서 제거해도 됩니다.
      try {
        // ✨ 변경된 내용: axios.get -> api.get
        const response = await api.get('project/');
        setProjects(response.data.results);
      } catch (err) {
        console.error('프로젝트 목록을 불러오는데 실패했습니다:', err);
        // 인터셉터가 401 에러를 처리하므로, 여기서는 일반적인 에러 메시지만 표시합니다.
        // navigate('/login') 로직은 인터셉터에서 처리됩니다.
        setError('프로젝트 목록을 불러오는데 실패했습니다. 다시 시도해주세요.');
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
        <Link to="/projects/create" className="create-project-button">
          + 새 프로젝트 생성
        </Link>
      </div>

      {/* ✨ 변경된 내용: 카드 레이아웃을 테이블 레이아웃으로 변경 */}
      <div className="project-table-container">
        {projects.length > 0 ? (
          <table className="project-table">
            <thead>
              <tr>
                <th>프로젝트 이름</th>
                <th>설명</th>
                <th>생성일</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => (
                <tr key={project.id} onClick={() => navigate(`/project/${project.id}`)} className="project-row">
                  <td>{project.name}</td>
                  <td>{project.description}</td>
                  <td>{new Date(project.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-projects-message">아직 생성된 프로젝트가 없습니다. 새 프로젝트를 만들어보세요!</p>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
