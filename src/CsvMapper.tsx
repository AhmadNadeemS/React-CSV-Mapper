import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { CsvMapperProps, CsvColumn } from './types';
import { CsvParser } from './utils/CsvParser';
import { Validator, ValidationResult } from './utils/Validator';
import { generateThemeColors } from './utils/colorUtils';
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
  theme,
  isDark: propIsDark,
  defaultRowsPerPage = 10,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [parentTheme, setParentTheme] = useState<'dark' | 'light' | null>(() => {
    if (typeof window === 'undefined') return 'light';
    const html = document.documentElement;
    const body = document.body;
    const checkAttr = (attr: string) => (html.getAttribute(attr) || body.getAttribute(attr))?.toLowerCase();
    const themeAttr = checkAttr('data-theme');
    const isDark = themeAttr === 'dark' || html.classList.contains('dark') || body.classList.contains('dark');
    return isDark ? 'dark' : 'light';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const detectTheme = () => {
      const html = document.documentElement;
      const body = document.body;

      const checkAttr = (attr: string) => (html.getAttribute(attr) || body.getAttribute(attr))?.toLowerCase();
      const themeAttr = checkAttr('data-theme');
      const isDark = themeAttr === 'dark' || html.classList.contains('dark') || body.classList.contains('dark');

      setParentTheme(isDark ? 'dark' : 'light');
    };

    // Initial detection
    detectTheme();

    // Listen for changes in attributes/classes
    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-theme'] });

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => detectTheme();
    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);

  const isDark = propIsDark !== undefined
    ? propIsDark
    : parentTheme === 'dark';

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

  const [step, setStep] = useState(1);
  const [columns, setColumns] = useState<CsvColumn[]>(activeColumns);
  const [availableFields] = useState<CsvColumn[]>(allAvailableFields);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [headerRowIndex, setHeaderRowIndex] = useState(0);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, number>>({});
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [parseProgress, setParseProgress] = useState<{ percent: number; rowsParsed: number }>({ percent: 0, rowsParsed: 0 });

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
    const controller = new AbortController();
    setAbortController(controller);
    setIsLoading(true);
    setParseProgress({ percent: 0, rowsParsed: 0 });
    const lastUpdateRef = { current: 0 };
    try {
      const rows = await parser.parse(file, {}, controller.signal, (progress) => {
        const now = Date.now();
        // Throttle updates to every 100ms or if complete
        if (now - lastUpdateRef.current > 100 || progress.percent === 100) {
          setParseProgress(progress);
          lastUpdateRef.current = now;
        }
      });
      setRawRows(rows);
      setStep(2);
      setHeaderRowIndex(0);
      setError(null);
    } catch (err: any) {
      // Don't show error if user cancelled
      if (err.name !== 'AbortError') {
        console.error('Parse error', err);
        setError('Error parsing file. Please check the file format and try again.');
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
      setParseProgress({ percent: 0, rowsParsed: 0 });
    }
  };

  const handleDataPasted = async (data: string, delimiter: string = ',') => {
    const controller = new AbortController();
    setAbortController(controller);
    setIsLoading(true);
    const lastUpdateRef = { current: 0 };
    try {
      const rows = await parser.parse(data, { delimiter }, controller.signal, (progress) => {
        const now = Date.now();
        if (now - lastUpdateRef.current > 100 || progress.percent === 100) {
          setParseProgress(progress);
          lastUpdateRef.current = now;
        }
      });
      setRawRows(rows);
      setStep(2);
      setHeaderRowIndex(0);
      setError(null);
    } catch (err: any) {
      // Don't show error if user cancelled
      if (err.name !== 'AbortError') {
        console.error('Parse error', err);
        setError('Error parsing pasted data. Please check the format and try again.');
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
      setParseProgress({ percent: 0, rowsParsed: 0 });
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
          `File has ${invalidRows.length} invalid row${invalidRows.length > 1 ? 's' : ''
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
        return <UploadStep onFileSelected={handleFileSelected} onDataPasted={handleDataPasted} isLoading={isLoading} progress={parseProgress} />;
      case 2:
        return (
          <HeaderSelectionStep
            data={rawRows}
            selectedRowIndex={headerRowIndex}
            onRowSelected={setHeaderRowIndex}
            rowsPerPage={defaultRowsPerPage}
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
            defaultRowsPerPage={defaultRowsPerPage}
          />
        );
      default:
        return null;
    }
  };

  const renderModal = () => {
    if (!isOpen) return null;

    // Generate theme colors if theme prop is provided
    const themeColors = theme ? generateThemeColors(theme) : null;
    const themeStyle = themeColors ? {
      '--csv-primary': themeColors.primary,
      '--csv-primary-hover': themeColors.primaryHover,
      '--csv-primary-light': themeColors.primaryLight,
      '--csv-primary-dark': themeColors.primaryDark,
    } as React.CSSProperties : {};

    const modalContent = (
      <div className={`csv-mapper-overlay ${isDark ? 'csv-dark-mode' : ''}`} style={themeStyle}>
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
            <span className="csv-mapper-close" onClick={() => {
              if (abortController) {
                abortController.abort();
              }
              setIsOpen(false);
            }}>
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
              {step > 1 && !isLoading && (
                <button
                  className="csv-btn csv-btn-secondary"
                  id="csv-prev-btn"
                  onClick={handlePrev}
                >
                  Prev
                </button>
              )}
              {step < 4 && step > 1 && !isLoading && (
                <button
                  className="csv-btn csv-btn-primary"
                  id="csv-next-btn"
                  onClick={handleNext}
                >
                  Next
                </button>
              )}
              {step === 4 && !isLoading && (
                <button
                  className="csv-btn csv-btn-primary"
                  id="csv-next-btn"
                  onClick={handleNext}
                >
                  Submit
                </button>
              )}
              {isLoading && abortController && (
                <button
                  className="csv-btn csv-btn-danger"
                  id="csv-cancel-btn"
                  onClick={() => {
                    abortController.abort();
                  }}
                >
                  Cancel
                </button>
              )}
              <button
                className="csv-btn csv-btn-secondary"
                id="csv-close-btn"
                onClick={() => {
                  if (abortController) {
                    abortController.abort();
                  }
                  setIsOpen(false);
                }}
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
