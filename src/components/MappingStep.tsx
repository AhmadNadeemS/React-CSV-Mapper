import React, { useState, useEffect, useRef } from 'react';
import { CsvColumn } from '../types';

interface MappingStepProps {
  templateFields: CsvColumn[];
  availableFields: CsvColumn[];
  headers: string[];
  mapping: Record<string, number>;
  onMappingChange: (key: string, columnIndex: number) => void;
  onToggleField: (key: string, enabled: boolean) => void;
}

export const MappingStep: React.FC<MappingStepProps> = ({
  templateFields,
  availableFields,
  headers,
  mapping,
  onMappingChange,
  onToggleField,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const activeKeys = new Set(templateFields.map((f) => f.key));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <div className="csv-field-selector-dropdown">
          <button
            ref={btnRef}
            className="csv-btn csv-btn-secondary"
            id="csv-field-selector-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            + Add/Remove Fields
          </button>
          <div
            ref={menuRef}
            className={`csv-field-selector-menu ${isMenuOpen ? '' : 'hidden'}`}
            id="csv-field-selector-menu"
          >
            <div style={{ padding: '8px', borderBottom: '1px solid #eee', fontWeight: 600 }}>
              Select Fields
            </div>
            {availableFields.map((field) => (
              <label key={field.key} className="csv-field-checkbox-item">
                <input
                  type="checkbox"
                  value={field.key}
                  checked={activeKeys.has(field.key)}
                  onChange={(e) => onToggleField(field.key, e.target.checked)}
                />
                <span>
                  {field.label}
                  {field.required ? ' *' : ''}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <div
        className="csv-mapping-row"
        style={{ background: '#f5f5f5', fontWeight: 600, padding: '12px' }}
      >
        <div className="csv-mapping-label">Template Fields</div>
        <div className="csv-mapping-select">Columns in your File</div>
      </div>
      <div id="csv-mapping-rows">
        {templateFields.map((field, idx) => (
          <div key={field.key} className="csv-mapping-row" data-field-index={idx}>
            <div className="csv-mapping-label">
              {field.label}
              {field.required ? <span className="csv-required-star">*</span> : ''}
            </div>
            <div className="csv-mapping-select">
              <select
                className="csv-select"
                data-key={field.key}
                value={mapping[field.key] !== undefined ? mapping[field.key] : ''}
                onChange={(e) =>
                  onMappingChange(
                    field.key,
                    e.target.value !== '' ? parseInt(e.target.value) : -1
                  )
                }
              >
                <option value="">Select a column</option>
                {(headers || []).map((header, index) => (
                  <option key={`${field.key}-${index}`} value={index}>
                    {header}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
