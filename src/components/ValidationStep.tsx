import React, { useState, useMemo } from 'react';
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

  // Calculate pagination
  const totalRows = validationResults.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
  const currentRows = validationResults.slice(startIndex, endIndex);

  // Reset to page 1 when rows per page changes
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
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
      <div style={{ marginBottom: '16px' }}>
        <button className="csv-btn csv-btn-secondary" id="csv-export-json" onClick={onExportJson}>
          Export JSON
        </button>
        <button className="csv-btn csv-btn-secondary" id="csv-export-csv" onClick={onExportCsv} style={{ marginLeft: '8px' }}>
          Export CSV
        </button>
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
              const actualIndex = startIndex + i;
              return (
                <tr key={actualIndex}>
                  <td>{actualIndex + 1}</td>
                  {templateFields.map((f) => {
                    const value = row.transformed[f.key] || '';
                    const error = row.errors[f.key];
                    return (
                      <td
                        key={f.key}
                        className={error ? 'error' : ''}
                        data-row-index={actualIndex}
                        data-field-key={f.key}
                      >
                        <div
                          className="csv-cell-content"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleBlur(e, actualIndex, f.key)}
                          onKeyDown={(e) => handleKeyDown(e, actualIndex, f.key)}
                        >
                          {value}
                        </div>
                        {error && <div className="csv-error-tooltip">{error}</div>}
                      </td>
                    );
                  })}
                  <td
                    className="csv-remove-row"
                    data-index={actualIndex}
                    onClick={() => onRemoveRow(actualIndex)}
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
        <div className="csv-pagination">
          <div className="csv-pagination-info">
            Showing {startIndex + 1}-{endIndex} of {totalRows} rows
          </div>
          <div className="csv-pagination-controls">
            <button
              className="csv-pagination-btn"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </button>
            <button
              className="csv-pagination-btn"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {getPageNumbers().map((page, idx) =>
              typeof page === 'number' ? (
                <button
                  key={idx}
                  className={`csv-pagination-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ) : (
                <span key={idx} className="csv-pagination-ellipsis">
                  {page}
                </span>
              )
            )}
            <button
              className="csv-pagination-btn"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
            <button
              className="csv-pagination-btn"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </button>
          </div>
          <div className="csv-rows-per-page">
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
