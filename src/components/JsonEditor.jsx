// src/components/JsonEditor.jsx

import React, { useState, useEffect } from 'react';
import './JsonEditor.css';

const JsonEditor = ({ title, onJsonChange }) => {
  const [mode, setMode] = useState('form'); // 'form' or 'raw'
  const [pairs, setPairs] = useState([{ id: Date.now(), key: '', value: '' }]);
  const [rawJson, setRawJson] = useState('{}');
  const [error, setError] = useState('');

  // pairs 상태가 변경될 때마다 부모 컴포넌트로 유효한 JSON 객체 전달
  useEffect(() => {
    try {
      const jsonObject = pairs.reduce((acc, pair) => {
        if (pair.key) { // 키가 있는 경우에만 객체에 포함
          acc[pair.key] = pair.value;
        }
        return acc;
      }, {});
      onJsonChange(jsonObject);
      setError('');
    } catch (e) {
      // 이 경우는 거의 발생하지 않음
    }
  }, [pairs, onJsonChange]);

  // Raw 모드에서 Form 모드로 전환
  const switchToForm = () => {
    try {
      const parsed = JSON.parse(rawJson);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        setError('객체 형태의 JSON만 Form 모드로 변환할 수 있습니다.');
        return;
      }
      const newPairs = Object.entries(parsed).map(([key, value]) => ({
        id: Date.now() + Math.random(),
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      }));
      // 만약 빈 객체라면 기본 한 줄 추가
      setPairs(newPairs.length > 0 ? newPairs : [{ id: Date.now(), key: '', value: '' }]);
      setError('');
      setMode('form');
    } catch (e) {
      setError('JSON 형식이 올바르지 않습니다.');
    }
  };

  // Form 모드에서 Raw 모드로 전환
  const switchToRaw = () => {
    const jsonObject = pairs.reduce((acc, pair) => {
      if (pair.key) {
        try {
            // 값이 JSON 형태(객체 또는 배열)인지 확인 후 파싱
            acc[pair.key] = JSON.parse(pair.value);
        } catch (e) {
            // 파싱 실패 시 문자열로 처리
            acc[pair.key] = pair.value;
        }
      }
      return acc;
    }, {});
    setRawJson(JSON.stringify(jsonObject, null, 2));
    setMode('raw');
  };

  const handlePairChange = (id, field, value) => {
    setPairs(pairs.map(p => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const addPair = () => {
    setPairs([...pairs, { id: Date.now(), key: '', value: '' }]);
  };

  const removePair = (id) => {
    setPairs(pairs.filter(p => p.id !== id));
  };

  const handleRawJsonChange = (e) => {
    const newRawJson = e.target.value;
    setRawJson(newRawJson);
    try {
        const parsed = JSON.parse(newRawJson);
        onJsonChange(parsed); // 실시간으로 부모에게 전달
        setError('');
    } catch(e) {
        setError('JSON 형식이 올바르지 않습니다.');
    }
  }


  return (
    <div className="json-editor">
      <div className="editor-header">
        <h4>{title}</h4>
        <div className="mode-switcher">
          <button type="button" onClick={switchToForm} className={mode === 'form' ? 'active' : ''}>Form</button>
          <button type="button" onClick={switchToRaw} className={mode === 'raw' ? 'active' : ''}>Raw</button>
        </div>
      </div>
      {error && <p className="editor-error">{error}</p>}
      {mode === 'form' ? (
        <div className="form-mode">
          {pairs.map((pair, index) => (
            <div key={pair.id} className="pair-row">
              <input
                type="text"
                placeholder="Key"
                value={pair.key}
                onChange={(e) => handlePairChange(pair.id, 'key', e.target.value)}
              />
              <input
                type="text"
                placeholder="Value"
                value={pair.value}
                onChange={(e) => handlePairChange(pair.id, 'value', e.target.value)}
              />
              <button type="button" onClick={() => removePair(pair.id)} className="remove-btn">-</button>
            </div>
          ))}
          <button type="button" onClick={addPair} className="add-btn">+ 행 추가</button>
        </div>
      ) : (
        <textarea
          className="raw-mode"
          value={rawJson}
          onChange={handleRawJsonChange}
          rows="8"
        />
      )}
    </div>
  );
};

export default JsonEditor;

