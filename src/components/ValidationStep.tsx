import React, { useState, useMemo, useEffect } from 'react';
import { CsvColumn } from '../types';
import { ValidationResult } from '../utils/Validator';

interface ValidationStepProps {
  validationResults: ValidationResult[];
  templateFields: CsvColumn[];
  onCellEdited: (rowIndex: number, fieldKey: string, newValue: string) => void;
  onRemoveRow: (index: number) => void;
  onExportJson: () => void;
  onExportCsv: () => void;
}

interface PageInputProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PageInput: React.FC<PageInputProps> = ({ currentPage, totalPages, onPageChange }) => {
  const [value, setValue] = useState<string | number>(currentPage);

  // Sync with external currentPage changes
  React.useEffect(() => {
    setValue(currentPage);
  }, [currentPage]);

  const handleBlur = () => {
    let page = parseInt(value.toString());
    if (isNaN(page) || page < 1) {
      page = 1;
    } else if (page > totalPages) {
      page = totalPages;
    }

    setValue(page);
    if (page !== currentPage) {
      onPageChange(page);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <input
      type="number"
      min={1}
      max={totalPages}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="csv-page-input"
    />
  );
};

export const ValidationStep: React.FC<ValidationStepProps> = ({
  validationResults,
  templateFields,
  onCellEdited,
  onRemoveRow,
  onExportJson,
  onExportCsv,
}) => {
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; fieldKey: string } | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showErrorsOnly, setShowErrorsOnly] = useState(false);

  // Calculate stats and filtered results
  const invalidCount = useMemo(() => validationResults.filter(r => !r.isValid).length, [validationResults]);

  // Auto-switch back to showing all rows if there are no errors
  useEffect(() => {
    if (invalidCount === 0 && showErrorsOnly) {
      setShowErrorsOnly(false);
    }
  }, [invalidCount, showErrorsOnly]);

  // Map results to include original index so we can edit/remove the correct row when filtered
  const rowsWithIndex = useMemo(() => {
    return validationResults.map((r, i) => ({ ...r, originalIndex: i }));
  }, [validationResults]);

  const filteredResults = useMemo(() => {
    if (showErrorsOnly) {
      return rowsWithIndex.filter(r => !r.isValid);
    }
    return rowsWithIndex;
  }, [rowsWithIndex, showErrorsOnly]);

  // Calculate pagination
  const totalRows = filteredResults.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
  const currentRows = filteredResults.slice(startIndex, endIndex);

  // Reset to page 1 when rows per page changes
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };



  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    rowIndex: number,
    fieldKey: string
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>, rowIndex: number, fieldKey: string) => {
    const newValue = e.currentTarget.textContent?.trim() || '';
    onCellEdited(rowIndex, fieldKey, newValue);
    setEditingCell(null);
  };

  return (
    <div>
      <div className="csv-validation-header">
        <div className="csv-validation-actions">
          <button className="csv-btn csv-btn-secondary" id="csv-export-json" onClick={onExportJson}>
            Export JSON
          </button>
          <button className="csv-btn csv-btn-secondary" id="csv-export-csv" onClick={onExportCsv}>
            Export CSV
          </button>
        </div>

        {/* Error Summary and Filter Toggle */}
        <div className="csv-validation-summary">
          {invalidCount > 0 ? (
            <span className="csv-error-count">
              Found {invalidCount} invalid row{invalidCount !== 1 ? 's' : ''}.
              <button
                onClick={() => {
                  setShowErrorsOnly(!showErrorsOnly);
                  setCurrentPage(1); // Reset to first page when toggling
                }}
                className="csv-toggle-errors-btn"
              >
                {showErrorsOnly ? 'Show all rows' : 'Show only errors'}
              </button>
            </span>
          ) : (
            <span>All rows are valid</span>
          )}
        </div>
      </div>
      <div className="csv-preview-table-container">
        <table className="csv-table csv-validation-table">
          <thead>
            <tr>
              <th>#</th>
              {templateFields.map((f) => (
                <th key={f.key}>{f.label}</th>
              ))}
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map((row, i) => {
              // row is now { ...ValidationResult, originalIndex: number }
              const displayIndex = startIndex + i;
              return (
                <tr key={row.originalIndex}>
                  <td>{displayIndex + 1}</td>
                  {templateFields.map((f) => {
                    const value = row.transformed[f.key] || '';
                    const error = row.errors[f.key];
                    return (
                      <td
                        key={f.key}
                        className={error ? 'error' : ''}
                        data-row-index={row.originalIndex}
                        data-field-key={f.key}
                      >
                        <div
                          className="csv-cell-content"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleBlur(e, row.originalIndex, f.key)}
                          onKeyDown={(e) => handleKeyDown(e, row.originalIndex, f.key)}
                        >
                          {value}
                        </div>
                        {error && <div className="csv-error-tooltip">{error}</div>}
                      </td>
                    );
                  })}
                  <td
                    className="csv-remove-row"
                    data-index={row.originalIndex}
                    onClick={() => onRemoveRow(row.originalIndex)}
                  >
                    X
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="csv-pagination-container">

          {/* Left: Rows Per Page */}
          <div className="csv-rows-per-page-wrapper">
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
              className="csv-rows-per-page-select"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Center: Pagination Controls */}
          <div className="csv-pagination-controls-wrapper">
            <button
              className="csv-btn csv-btn-secondary csv-pagination-nav-btn"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              title="First Page"
            >
              &laquo;
            </button>
            <button
              className="csv-btn csv-btn-secondary csv-pagination-nav-btn"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              title="Previous Page"
            >
              &lsaquo;
            </button>

            <div className="csv-page-jumper">
              <span>Page</span>
              <PageInput
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
              <span>of {totalPages.toLocaleString()}</span>
            </div>

            <button
              className="csv-btn csv-btn-secondary csv-pagination-nav-btn"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              title="Next Page"
            >
              &rsaquo;
            </button>
            <button
              className="csv-btn csv-btn-secondary csv-pagination-nav-btn"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              title="Last Page"
            >
              &raquo;
            </button>
          </div>

          {/* Right: Info */}
          <div className="csv-pagination-info-text">
            {startIndex + 1}-{endIndex} of {totalRows} rows
          </div>
        </div>
      )}
    </div>
  );
};
