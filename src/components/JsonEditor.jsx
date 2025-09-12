// src/components/JsonEditor.jsx

import React, { useState, useEffect, useCallback } from 'react';
import './JsonEditor.css';

const JsonEditor = ({ title, onJsonChange, isNested = false, initialData = null }) => {
  const [mode, setMode] = useState('form');
  
  // ✨ CHANGED: 초기 상태를 생성하는 함수
  const createInitialPairs = useCallback((data) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return [{ id: Date.now(), key: '', value: '', type: 'string' }];
    }
    const entries = Object.entries(data);
    if (entries.length === 0) {
      return [{ id: Date.now(), key: '', value: '', type: 'string' }];
    }
    return entries.map(([key, value]) => {
      const id = Date.now() + Math.random();
      const type = value === null ? 'null' : (typeof value === 'object' && !Array.isArray(value) ? 'object' : typeof value);
      
      let pairValue;
      if (type === 'object') {
        pairValue = value; 
      } else if (type === 'boolean') {
        pairValue = value ? 'true' : 'false';
      } else {
        pairValue = String(value);
      }
      return { id, key, value: pairValue, type };
    });
  }, []);

  const [pairs, setPairs] = useState(() => createInitialPairs(initialData));
  const [rawJson, setRawJson] = useState(() => JSON.stringify(initialData || {}, null, 2));
  const [error, setError] = useState('');
  
  // ✨ CHANGED: useEffect에서 buildJsonObject 함수를 밖으로 빼서 재사용
  const buildJsonObject = useCallback((currentPairs) => {
    return currentPairs.reduce((acc, pair) => {
      if (pair.key) {
        switch (pair.type) {
          case 'number':
            acc[pair.key] = Number(pair.value) || 0;
            break;
          case 'boolean':
            acc[pair.key] = pair.value === 'true';
            break;
          case 'null':
            acc[pair.key] = null;
            break;
          case 'object':
            acc[pair.key] = pair.value && typeof pair.value === 'object' ? pair.value : {};
            break;
          default:
            acc[pair.key] = pair.value;
        }
      }
      return acc;
    }, {});
  }, []);

  useEffect(() => {
    const jsonObject = buildJsonObject(pairs);
    onJsonChange(jsonObject);
    setError('');
  }, [pairs, onJsonChange, buildJsonObject]);


  const switchToForm = () => {
    try {
      const parsed = JSON.parse(rawJson);
      setPairs(createInitialPairs(parsed));
      setError('');
      setMode('form');
    } catch (e) {
      setError('JSON 형식이 올바르지 않습니다.');
    }
  };

  const switchToRaw = () => {
    setRawJson(JSON.stringify(buildJsonObject(pairs), null, 2));
    setMode('raw');
  };

  const handlePairChange = (id, field, newValue) => {
    setPairs(currentPairs => 
      currentPairs.map(p => {
        if (p.id !== id) return p;

        if (field === 'type') {
          const newType = newValue;
          let resetValue;
          switch (newType) {
            case 'object': resetValue = {}; break;
            case 'boolean': resetValue = 'true'; break;
            case 'null': resetValue = 'null'; break;
            default: resetValue = ''; break;
          }
          return { ...p, type: newType, value: resetValue };
        }
        return { ...p, [field]: newValue };
      })
    );
  };

  const handleNestedJsonChange = (id, nestedJson) => {
    setPairs(currentPairs => 
      currentPairs.map(p => p.id === id ? { ...p, value: nestedJson } : p)
    );
  };

  const addPair = () => {
    setPairs([...pairs, { id: Date.now(), key: '', value: '', type: 'string' }]);
  };

  const removePair = (id) => {
    setPairs(pairs.filter(p => p.id !== id));
  };
  
  const handleRawJsonChange = (e) => {
    const newRawJson = e.target.value;
    setRawJson(newRawJson);
    try {
      JSON.parse(newRawJson);
      setError('');
    } catch (e) {
      setError('JSON 형식이 올바르지 않습니다.');
    }
  };

  const renderValueInput = (pair) => {
    switch (pair.type) {
      case 'number':
        return <input type="number" placeholder="Value" value={pair.value} onChange={(e) => handlePairChange(pair.id, 'value', e.target.value)} />;
      case 'boolean':
        return (
          <select value={pair.value} onChange={(e) => handlePairChange(pair.id, 'value', e.target.value)}>
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        );
      case 'object':
        return (
          <div className="nested-editor">
            {/* ✨ CHANGED: initialData prop으로 현재 객체 값을 전달! */}
            <JsonEditor 
              isNested={true}
              initialData={pair.value} 
              onJsonChange={(nestedJson) => handleNestedJsonChange(pair.id, nestedJson)} 
            />
          </div>
        );
      case 'null':
        return <input type="text" value="null" readOnly disabled />;
      default:
        return <input type="text" placeholder="Value" value={pair.value} onChange={(e) => handlePairChange(pair.id, 'value', e.target.value)} />;
    }
  };

  return (
    <div className={`json-editor ${isNested ? 'nested' : ''}`}>
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
          {pairs.map((pair) => (
            <div key={pair.id} className="pair-row">
              <input type="text" placeholder="Key" value={pair.key} onChange={(e) => handlePairChange(pair.id, 'key', e.target.value)} />
              <select className="type-selector" value={pair.type} onChange={(e) => handlePairChange(pair.id, 'type', e.target.value)}>
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="object">Object</option>
                <option value="null">Null</option>
              </select>
              <div className="value-container">{renderValueInput(pair)}</div>
              <button type="button" onClick={() => removePair(pair.id)} className="remove-btn">-</button>
            </div>
          ))}
          <button type="button" onClick={addPair} className="add-btn">+ 행 추가</button>
        </div>
      ) : (
        <textarea className="raw-mode" value={rawJson} onChange={handleRawJsonChange} rows={isNested ? 4 : 8} />
      )}
    </div>
  );
};

export default JsonEditor;
