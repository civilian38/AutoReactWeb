// src/components/JsonEditor.jsx

import React, { useState, useEffect, useCallback } from 'react';
import './JsonEditor.css';

// ✨ ADDED: 편집 모달 컴포넌트
const EditorModal = ({ pair, onSave, onClose, path }) => {
  const [modalData, setModalData] = useState(pair.value);

  const handleJsonChange = (newData) => {
    setModalData(newData);
  };
  
  const handleSave = () => {
    onSave(pair.id, modalData);
    onClose();
  };

  const isArray = Array.isArray(pair.value);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          {/* ✨ ADDED: 브레드크럼(Breadcrumbs) */}
          <div className="breadcrumbs">
            {path.join(' > ')}
          </div>
          <button type="button" onClick={onClose} className="close-btn">&times;</button>
        </div>
        <div className="modal-body">
          {/* isArray가 true이면 ArrayEditor를, 아니면 JsonEditor를 렌더링 */}
          {/* 이 예시에서는 JsonEditor 재사용으로 통일성을 높임 */}
          <JsonEditor
            isNested={true}
            initialData={modalData}
            onJsonChange={handleJsonChange}
            // 배열 편집을 위해 isArray 플래그 전달
            forceArrayMode={isArray} 
          />
        </div>
        <div className="modal-footer">
          <button type="button" onClick={handleSave} className="save-btn">저장</button>
          <button type="button" onClick={onClose} className="cancel-btn">취소</button>
        </div>
      </div>
    </div>
  );
};


const JsonEditor = ({ title, onJsonChange, isNested = false, initialData = null, forceArrayMode = false, path = ['root'] }) => {
  const [mode, setMode] = useState('form');
  
  const createInitialState = useCallback((data, isArrayMode) => {
    if (isArrayMode) {
      if (!Array.isArray(data)) return [{ id: Date.now(), key: 0, value: '', type: 'string' }];
      return data.map((item, index) => {
        const type = item === null ? 'null' : typeof item;
        return { id: Date.now() + Math.random(), key: index, value: item, type };
      });
    }

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return [{ id: Date.now(), key: '', value: '', type: 'string', keyError: null }];
    }
    const entries = Object.entries(data);
    if (entries.length === 0) {
      return [{ id: Date.now(), key: '', value: '', type: 'string', keyError: null }];
    }
    return entries.map(([key, value]) => {
      const id = Date.now() + Math.random();
      const type = value === null ? 'null' : (Array.isArray(value) ? 'array' : (typeof value === 'object' ? 'object' : typeof value));
      let pairValue = value;
      if (type === 'boolean') pairValue = value ? 'true' : 'false';
      else if (type !== 'object' && type !== 'array') pairValue = String(value);
      return { id, key, value: pairValue, type, keyError: null };
    });
  }, []);

  const [pairs, setPairs] = useState(() => createInitialState(initialData, forceArrayMode));
  const [rawJson, setRawJson] = useState(() => JSON.stringify(initialData || (forceArrayMode ? [] : {}), null, 2));
  const [error, setError] = useState('');
  // ✨ ADDED: 모달 상태 관리
  const [editingPair, setEditingPair] = useState(null);

  const buildJson = useCallback((currentPairs, isArrayMode) => {
    if (isArrayMode) {
      return currentPairs.map(pair => {
        switch (pair.type) {
          case 'number': return Number(pair.value) || 0;
          case 'boolean': return pair.value === 'true';
          case 'null': return null;
          case 'object': return pair.value && typeof pair.value === 'object' ? pair.value : {};
          case 'array': return Array.isArray(pair.value) ? pair.value : [];
          default: return pair.value;
        }
      });
    }

    return currentPairs.reduce((acc, pair) => {
      if (pair.key && !pair.keyError) {
        switch (pair.type) {
          case 'number': acc[pair.key] = Number(pair.value) || 0; break;
          case 'boolean': acc[pair.key] = pair.value === 'true'; break;
          case 'null': acc[pair.key] = null; break;
          case 'object': acc[pair.key] = pair.value && typeof pair.value === 'object' ? pair.value : {}; break;
          case 'array': acc[pair.key] = Array.isArray(pair.value) ? pair.value : []; break;
          default: acc[pair.key] = pair.value;
        }
      }
      return acc;
    }, {});
  }, []);

  useEffect(() => {
    const jsonOutput = buildJson(pairs, forceArrayMode);
    onJsonChange(jsonOutput);
    setError('');
  }, [pairs, onJsonChange, buildJson, forceArrayMode]);

  const switchToForm = () => {
    try {
      const parsed = JSON.parse(rawJson);
      setPairs(createInitialState(parsed, Array.isArray(parsed)));
      setError('');
      setMode('form');
    } catch (e) {
      setError('JSON 형식이 올바르지 않습니다.');
    }
  };

  const switchToRaw = () => {
    setRawJson(JSON.stringify(buildJson(pairs, forceArrayMode), null, 2));
    setMode('raw');
  };
  
  // ✨ CHANGED: Key 중복 검사 로직 추가
  const handlePairChange = (id, field, newValue) => {
    setPairs(currentPairs => {
      const newPairs = currentPairs.map(p => {
        if (p.id !== id) return p;
        
        if (field === 'type') {
          let resetValue;
          switch (newValue) {
            case 'object': resetValue = {}; break;
            case 'array': resetValue = []; break;
            case 'boolean': resetValue = 'true'; break;
            case 'null': resetValue = 'null'; break;
            default: resetValue = ''; break;
          }
          return { ...p, type: newValue, value: resetValue };
        }
        return { ...p, [field]: newValue };
      });

      // Key 중복 검사 (배열 모드가 아닐 때만)
      if (!forceArrayMode && field === 'key') {
        const keys = newPairs.map(p => p.key);
        return newPairs.map(p => ({
          ...p,
          keyError: p.key && keys.filter(k => k === p.key).length > 1 ? '중복된 Key입니다.' : null
        }));
      }
      return newPairs;
    });
  };

  const handleNestedJsonChange = (id, nestedJson) => {
    setPairs(currentPairs =>
      currentPairs.map(p => p.id === id ? { ...p, value: nestedJson } : p)
    );
  };
  
  const addPair = () => {
    const newPair = forceArrayMode 
      ? { id: Date.now(), key: pairs.length, value: '', type: 'string' }
      : { id: Date.now(), key: '', value: '', type: 'string', keyError: null };
    setPairs([...pairs, newPair]);
  };

  const removePair = (id) => {
    setPairs(pairs.filter(p => p.id !== id));
  };
  
  const handleRawJsonChange = (e) => {
    setRawJson(e.target.value);
    try {
      JSON.parse(e.target.value);
      setError('');
    } catch (e) {
      setError('JSON 형식이 올바르지 않습니다.');
    }
  };
  
  // ✨ CHANGED: 집중 편집 모드를 위한 렌더링 로직
  const renderValueInput = (pair) => {
    switch (pair.type) {
      case 'object':
        return <button type="button" className="edit-nested-btn" onClick={() => setEditingPair(pair)}>객체 편집 ({Object.keys(pair.value || {}).length}개)</button>;
      case 'array':
        return <button type="button" className="edit-nested-btn" onClick={() => setEditingPair(pair)}>배열 편집 ({Array.isArray(pair.value) ? pair.value.length : 0}개)</button>;
      case 'number':
        return <input type="number" placeholder="Value" value={pair.value} onChange={(e) => handlePairChange(pair.id, 'value', e.target.value)} />;
      case 'boolean':
        return (
          <select value={pair.value} onChange={(e) => handlePairChange(pair.id, 'value', e.target.value)}>
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        );
      case 'null':
        return <input type="text" value="null" readOnly disabled />;
      default:
        return <input type="text" placeholder="Value" value={pair.value} onChange={(e) => handlePairChange(pair.id, 'value', e.target.value)} />;
    }
  };

  return (
    <div className={`json-editor ${isNested ? 'nested' : ''}`}>
      {/* ✨ ADDED: 모달 렌더링 */}
      {editingPair && (
        <EditorModal
          pair={editingPair}
          onSave={handleNestedJsonChange}
          onClose={() => setEditingPair(null)}
          path={[...path, forceArrayMode ? `[${editingPair.key}]` : editingPair.key]}
        />
      )}

      {!isNested && (
        <div className="editor-header">
          <h4>{title}</h4>
          <div className="mode-switcher">
            <button type="button" onClick={switchToForm} className={mode === 'form' ? 'active' : ''}>Form</button>
            <button type="button" onClick={switchToRaw} className={mode === 'raw' ? 'active' : ''}>Raw</button>
          </div>
        </div>
      )}

      {error && <p className="editor-error">{error}</p>}
      
      {mode === 'form' ? (
        <div className="form-mode">
          {pairs.map((pair, index) => (
            <div key={pair.id} className="pair-row">
              {!forceArrayMode ? (
                <>
                  <div className="key-container">
                    <input
                      type="text"
                      placeholder="Key"
                      value={pair.key}
                      onChange={(e) => handlePairChange(pair.id, 'key', e.target.value)}
                      className={pair.keyError ? 'key-error' : ''}
                    />
                    {pair.keyError && <span className="key-error-message">{pair.keyError}</span>}
                  </div>
                </>
              ) : (
                <div className="array-index">{index}</div>
              )}
              <select className="type-selector" value={pair.type} onChange={(e) => handlePairChange(pair.id, 'type', e.target.value)}>
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="object">Object</option>
                <option value="array">Array</option>
                <option value="null">Null</option>
              </select>
              <div className="value-container">{renderValueInput(pair)}</div>
              <button type="button" onClick={() => removePair(pair.id)} className="remove-btn">-</button>
            </div>
          ))}
          <button type="button" onClick={addPair} className="add-btn">
            {forceArrayMode ? '+ 아이템 추가' : '+ 행 추가'}
          </button>
        </div>
      ) : (
        <textarea className="raw-mode" value={rawJson} onChange={handleRawJsonChange} rows={isNested ? 10 : 15} />
      )}
    </div>
  );
};

export default JsonEditor;
