import React from 'react';
import { CsvMapper, CsvColumn } from '../src';

export default function App() {
  const [isDark, setIsDark] = React.useState(false);

  // Define all available fields
  const allFields: CsvColumn[] = [
    { key: 'firstName', label: 'First Name', required: true, default: true },
    { key: 'lastName', label: 'Last Name', required: true, default: true },
    {
      key: 'email',
      label: 'Email Address',
      required: true,
      default: true,
      validate: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? true : 'Invalid email format';
      }
    },
    { key: 'phone', label: 'Phone Number' },
    { key: 'department', label: 'Department' },
    { key: 'salary', label: 'Salary' }
  ];

  const handleSubmit = (data: Record<string, string>[]) => {
    console.log('Submitted data:', data);
    alert(`Imported ${data.length} rows! Check console for details.`);
  };

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      maxWidth: '100%',
      minHeight: '100vh',
      margin: 0,
      padding: '40px',
      textAlign: 'center',
      background: isDark ? '#111827' : '#f9fafb',
      color: isDark ? '#f9fafb' : '#333',
      transition: 'background 0.2s, color 0.2s'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>
            React CSV Mapper
          </h1>
          <button
            onClick={() => setIsDark(!isDark)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid currentColor',
              background: 'none',
              color: 'currentColor',
              cursor: 'pointer'
            }}
          >
            {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>

        <div style={{
          padding: '40px',
          border: isDark ? '1px solid #374151' : '1px solid #eee',
          borderRadius: '12px',
          background: isDark ? '#1f2937' : 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        }}>
          <p style={{ marginBottom: '24px', color: isDark ? '#9ca3af' : '#666' }}>
            Upload a CSV file to map columns to the required fields.
          </p>

          <CsvMapper
            columns={allFields}
            onSubmit={handleSubmit}
            isDark={isDark}
            theme={isDark ? 'indigo' : 'blue'}
            trigger={
              <button
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#fff',
                  background: isDark ? '#6366f1' : '#0066ff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = isDark ? '#4f46e5' : '#0052cc'}
                onMouseOut={(e) => e.currentTarget.style.background = isDark ? '#6366f1' : '#0066ff'}
              >
                Upload CSV
              </button>
            }
          />
        </div>
      </div>
    </div>
  );
}
