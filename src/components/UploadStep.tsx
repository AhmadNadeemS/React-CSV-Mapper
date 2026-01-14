import React, { useRef, useState } from 'react';

interface UploadStepProps {
  onFileSelected: (file: File) => void;
  onDataPasted?: (data: string, delimiter?: string) => void;
  isLoading?: boolean;
  progress?: { percent: number; rowsParsed: number };
}

export const UploadStep: React.FC<UploadStepProps> = ({ onFileSelected, onDataPasted, isLoading = false, progress }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [viewMode, setViewMode] = useState<'upload' | 'paste'>('upload');
  const [pasteData, setPasteData] = useState('');
  const [delimiter, setDelimiter] = useState(',');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0]);
    }
  };

  const handlePasteSubmit = () => {
    if (pasteData.trim() && onDataPasted) {
      onDataPasted(pasteData, delimiter);
      setPasteData('');
      setViewMode('upload');
    }
  };

  if (viewMode === 'paste') {
    return (
      <div className="csv-upload-wrapper">
        <p className="csv-paste-intro">
          Copy existing table data from a spreadsheet (like an Excel workbook or Google Sheet) and paste it in the field below.
        </p>
        <textarea
          className="csv-paste-textarea"
          placeholder=""
          value={pasteData}
          onChange={(e) => setPasteData(e.target.value)}
          autoFocus
        />
        <div className="csv-paste-controls">
          <div className="csv-delimiter-wrapper">
            <label>Select Delimiter</label>
            <select
              className="csv-delimiter-select"
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
            >
              <option value=",">Comma</option>
              <option value="\t">Tab</option>
              <option value=";">Semicolon</option>
              <option value="|">Pipe</option>
              <option value=" ">Space</option>
            </select>
          </div>
          <div className="csv-button-wrapper">
            <button
              className="csv-btn csv-btn-secondary"
              onClick={() => {
                setViewMode('upload');
                setPasteData('');
              }}
            >
              Cancel
            </button>
            <button
              className="csv-btn csv-btn-primary"
              onClick={handlePasteSubmit}
              disabled={!pasteData.trim() || isLoading}
            >
              Import Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="csv-upload-step-container">
      <div
        className={`csv-upload-area ${isDragOver ? 'dragover' : ''} ${isLoading ? 'loading' : ''}`}
        id="csv-drop-zone"
        onClick={() => !isLoading && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="csv-upload-text">Drop files here or click to upload</div>
        <div className="csv-upload-subtext">XLS, XLSX, CSV files are accepted</div>
        <input
          type="file"
          id="csv-file-input"
          accept=".csv,.xls,.xlsx"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={isLoading}
        />

        {isLoading && (
          <div className="csv-loading-overlay">
            <div className="csv-loading-spinner"></div>
            <div className="csv-loading-text">Processing your file...</div>
            {progress && progress.percent > 0 && (
              <>
                <div className="csv-progress-wrapper">
                  <div
                    className="csv-progress-fill"
                    style={{
                      width: `${progress.percent}%`
                    }}
                  ></div>
                </div>
                <div className="csv-loading-subtext">
                  {progress.percent}% • {progress.rowsParsed.toLocaleString()} rows
                </div>
              </>
            )}
            {(!progress || progress.percent === 0) && (
              <div className="csv-loading-subtext">This may take a moment for large files</div>
            )}
          </div>
        )}
      </div>

      <div className="csv-paste-data-link-container">
        <a
          href="#"
          className="csv-paste-data-link"
          onClick={(e) => {
            e.preventDefault();
            if (!isLoading) setViewMode('paste');
          }}
        >
          Or click here to copy paste table data
        </a>
      </div>
    </div>
  );
};
