import { CsvMapper, CsvColumn } from '../src';

export default function App() {
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
    // Handle the imported data here
    // e.g. send to API, update state, etc.
  };

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      maxWidth: '800px',
      margin: '40px auto',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#333', marginBottom: '30px' }}>
        React CSV Mapper
      </h1>

      <div style={{
        padding: '40px',
        border: '1px solid #eee',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
      }}>
        <p style={{ marginBottom: '24px', color: '#666' }}>
          Upload a CSV file to map columns to the required fields.
        </p>

        <CsvMapper
          columns={allFields}
          onSubmit={handleSubmit}
          theme="indigo"
          trigger={
            <button
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 600,
                color: '#fff',
                background: '#0066ff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#0052cc'}
              onMouseOut={(e) => e.currentTarget.style.background = '#0066ff'}
            >
              Upload CSV
            </button>
          }
        />
      </div>
    </div>
  );
}
