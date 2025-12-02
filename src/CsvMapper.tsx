import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { CsvMapperProps, CsvColumn } from './types';
import { CsvParser } from './utils/CsvParser';
import { Validator, ValidationResult } from './utils/Validator';
import { UploadStep } from './components/UploadStep';
import { HeaderSelectionStep } from './components/HeaderSelectionStep';
import { MappingStep } from './components/MappingStep';
import { ValidationStep } from './components/ValidationStep';
import './styles.css';

export const CsvMapper: React.FC<CsvMapperProps> = ({
  columns: initialColumns,
  onSubmit,
  availableFields: propAvailableFields,
  trigger,
  container = 'body',
}) => {
  // Determine active columns and available fields
  const { activeColumns, allAvailableFields } = useMemo(() => {
    // If availableFields prop is provided, use legacy behavior
    if (propAvailableFields) {
      return {
        activeColumns: initialColumns,
        allAvailableFields: propAvailableFields
      };
    }

    // New behavior: Filter default columns
    const defaults = initialColumns.filter(c => c.default);
    // If no defaults specified, use all columns (legacy behavior for single array)
    const active = defaults.length > 0 ? defaults : initialColumns;

    return {
      activeColumns: active,
      allAvailableFields: initialColumns
    };
  }, [initialColumns, propAvailableFields]);

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [columns, setColumns] = useState<CsvColumn[]>(activeColumns);
  const [availableFields] = useState<CsvColumn[]>(allAvailableFields);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [headerRowIndex, setHeaderRowIndex] = useState(0);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, number>>({});
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const parser = useMemo(() => new CsvParser(), []);
  const validator = useMemo(() => new Validator(columns), [columns]);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setRawRows([]);
      setHeaderRowIndex(0);
      setHeaders([]);
      setMapping({});
      setValidationResults([]);
      setError(null);
      setColumns(activeColumns);
    }
  }, [isOpen, activeColumns]);

  const handleFileSelected = async (file: File) => {
    try {
      const rows = await parser.parse(file);
      setRawRows(rows);
      setStep(2);
      setHeaderRowIndex(0);
      setError(null);
    } catch (err) {
      console.error('Parse error', err);
      setError('Error parsing file');
    }
  };

  const handleNext = () => {
    if (step === 2) {
      // Process headers
      const selectedHeaders = rawRows[headerRowIndex];
      setHeaders(selectedHeaders || []);
      // Auto-map
      const newMapping = validator.autoMap(selectedHeaders || []);
      setMapping(newMapping);
      setStep(3);
    } else if (step === 3) {
      // Validate all fields are mapped
      const unmappedFields = columns.filter(
        (f) =>
          mapping[f.key] === undefined ||
          mapping[f.key] === -1 ||
          (mapping[f.key] as any) === ''
      );

      if (unmappedFields.length > 0) {
        const fieldNames = unmappedFields.map((f) => f.label).join(', ');
        setError(`Please map all fields before continuing. Unmapped fields: ${fieldNames}`);
        return;
      }

      setError(null);

      // Process data
      const dataRows = rawRows.slice(headerRowIndex + 1);
      const results = validator.validateAll(dataRows, mapping);
      setValidationResults(results);
      setStep(4);
    } else if (step === 4) {
      // Check if there are any errors
      const invalidRows = validationResults.filter((r) => !r.isValid);
      if (invalidRows.length > 0) {
        setError(
          `File has ${invalidRows.length} invalid row${
            invalidRows.length > 1 ? 's' : ''
          }. Please resolve the errors before uploading.`
        );
        return;
      }

      setError(null);
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
      setError(null);
    }
  };

  const handleSubmit = () => {
    const validData = validationResults
      .filter((r) => r.isValid)
      .map((r) => r.transformed);
    onSubmit(validData);
    setIsOpen(false);
  };

  const handleToggleField = (key: string, enabled: boolean) => {
    if (enabled) {
      const availableField = availableFields.find((f) => f.key === key);
      if (availableField && !columns.find((f) => f.key === key)) {
        setColumns([...columns, { ...availableField, required: true }]);
        setMapping({ ...mapping, [key]: -1 });
      }
    } else {
      const index = columns.findIndex((f) => f.key === key);
      if (index !== -1) {
        const newColumns = [...columns];
        newColumns.splice(index, 1);
        setColumns(newColumns);
        const newMapping = { ...mapping };
        delete newMapping[key];
        setMapping(newMapping);
      }
    }
  };

  const handleCellEdited = (rowIndex: number, fieldKey: string, newValue: string) => {
    const newResults = [...validationResults];
    if (newResults[rowIndex]) {
      newResults[rowIndex].transformed[fieldKey] = newValue;
      // Re-validate
      const revalidated = validator.revalidateTransformed(newResults);
      setValidationResults(revalidated);
    }
  };

  const handleRemoveRow = (index: number) => {
    const newResults = [...validationResults];
    newResults.splice(index, 1);
    // Re-validate remaining rows
    if (newResults.length > 0) {
      const revalidated = validator.revalidateTransformed(newResults);
      setValidationResults(revalidated);
    } else {
      setValidationResults([]);
    }
  };

  const handleExportJson = () => {
    const data = validationResults.map((r) => r.transformed);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, 'export.json');
  };

  const handleExportCsv = () => {
    const headers = columns.map((c) => c.label);
    const rows = validationResults.map((r) =>
      columns
        .map((c) => {
          const val = r.transformed[c.key] || '';
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    downloadBlob(blob, 'export.csv');
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <UploadStep onFileSelected={handleFileSelected} />;
      case 2:
        return (
          <HeaderSelectionStep
            data={rawRows}
            selectedRowIndex={headerRowIndex}
            onRowSelected={setHeaderRowIndex}
          />
        );
      case 3:
        return (
          <MappingStep
            templateFields={columns}
            availableFields={availableFields}
            headers={headers}
            mapping={mapping}
            onMappingChange={(key, val) => setMapping({ ...mapping, [key]: val })}
            onToggleField={handleToggleField}
          />
        );
      case 4:
        return (
          <ValidationStep
            validationResults={validationResults}
            templateFields={columns}
            onCellEdited={handleCellEdited}
            onRemoveRow={handleRemoveRow}
            onExportJson={handleExportJson}
            onExportCsv={handleExportCsv}
          />
        );
      default:
        return null;
    }
  };

  const renderModal = () => {
    if (!isOpen) return null;

    const modalContent = (
      <div className="csv-mapper-overlay">
        <div className="csv-mapper-modal">
          <div className="csv-mapper-header">
            <h2 id="csv-step-title">
              {step === 1
                ? 'CSV Upload'
                : step === 2
                ? 'Select Header Row'
                : step === 3
                ? 'Map Columns'
                : 'Verify Data'}
            </h2>
            <span className="csv-mapper-close" onClick={() => setIsOpen(false)}>
              &times;
            </span>
          </div>
          <div className="csv-mapper-body" id="csv-mapper-body">
            {renderStep()}
          </div>
          {error && <div className="csv-error-banner">{error}</div>}
          <div className="csv-mapper-footer" id="csv-mapper-footer">
            <div className="csv-footer-left">
              <span id="csv-status-text"></span>
            </div>
            <div className="csv-footer-right">
              {step > 1 && (
                <button
                  className="csv-btn csv-btn-secondary"
                  id="csv-prev-btn"
                  onClick={handlePrev}
                >
                  Prev
                </button>
              )}
              {step < 4 && step > 1 && (
                <button
                  className="csv-btn csv-btn-primary"
                  id="csv-next-btn"
                  onClick={handleNext}
                >
                  Next
                </button>
              )}
              {step === 4 && (
                <button
                  className="csv-btn csv-btn-primary"
                  id="csv-next-btn"
                  onClick={handleNext}
                >
                  Submit
                </button>
              )}
              <button
                className="csv-btn csv-btn-secondary"
                id="csv-close-btn"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );

    const containerElement = document.querySelector(container) || document.body;
    return createPortal(modalContent, containerElement);
  };

  // Trigger button logic
  const handleTriggerClick = (e: React.MouseEvent) => {
    if (trigger && trigger.props.onClick) {
      trigger.props.onClick(e);
    }
    setIsOpen(true);
  };

  const triggerElement = trigger
    ? React.cloneElement(trigger, { onClick: handleTriggerClick })
    : (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 600,
          color: '#fff',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
        }}
      >
        📊 Import CSV
      </button>
    );

  return (
    <>
      {triggerElement}
      {renderModal()}
    </>
  );
};
