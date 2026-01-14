import React from 'react';

interface HeaderSelectionStepProps {
  data: string[][];
  selectedRowIndex: number;
  onRowSelected: (index: number) => void;
  rowsPerPage: number;
}

export const HeaderSelectionStep: React.FC<HeaderSelectionStepProps> = ({
  data,
  selectedRowIndex,
  onRowSelected,
  rowsPerPage,
}) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const totalPages = Math.ceil(data.length / rowsPerPage);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = data.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <div>
      <div className="csv-preview-table-container">
        <table className="csv-table">
          <tbody>
            {currentRows.map((row, i) => {
              const absoluteIndex = startIndex + i;
              return (
                <tr key={absoluteIndex} className={absoluteIndex === selectedRowIndex ? 'csv-header-row' : ''}>
                  <td className="csv-row-select">
                    <div>
                      <input
                        type="radio"
                        name="header-row"
                        value={absoluteIndex}
                        checked={absoluteIndex === selectedRowIndex}
                        onChange={() => onRowSelected(absoluteIndex)}
                      />
                    </div>
                  </td>
                  <td className="csv-row-index" data-index={absoluteIndex + 1}></td>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="csv-simple-pagination">
          <button
            className="csv-btn csv-btn-secondary csv-pagination-nav-btn"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="csv-simple-pagination-text">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="csv-btn csv-btn-secondary csv-pagination-nav-btn"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
