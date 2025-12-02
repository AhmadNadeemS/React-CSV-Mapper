# CSV Column Mapper

[![npm version](https://img.shields.io/npm/v/react-csv-mapper.svg)](https://www.npmjs.com/package/react-csv-mapper)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

React wrapper for [csv-column-mapper](https://www.npmjs.com/package/csv-column-mapper) - A powerful CSV import component with column mapping, validation, and a beautiful UI.

## ✨ Features

- 🎯 **React Component** - Drop-in `<CsvMapper />` component
- 🪝 **React Hook** - `useCsvMapper()` hook for custom implementations
- 📘 **TypeScript Support** - Full type definitions included
- 🎨 **Customizable** - Use your own trigger buttons
- ✅ **All Core Features** - Inherits all features from csv-column-mapper:
  - Drag & drop upload
  - Smart auto-mapping
  - Inline editing
  - Real-time validation
  - Duplicate detection
  - Export options

## 📦 Installation

```bash
npm install react-csv-mapper
```

## 🚀 Quick Start

### Using the Component

```tsx
import { CsvMapper } from 'react-csv-mapper';

function App() {
  return (
    <CsvMapper
      columns={[
        { key: 'name', label: 'Full Name', required: true, default: true },
        { key: 'email', label: 'Email', required: true, default: true },
        { key: 'phone', label: 'Phone Number' } // Optional, not selected by default
      ]}
      onSubmit={(data) => {
        console.log('Imported data:', data);
        // Send to your API
      }}
    />
  );
}
```

### Using the Hook

```tsx
import { useCsvMapper } from 'react-csv-mapper';

function App() {
  const { init } = useCsvMapper({
    columns: [
      { key: 'name', label: 'Full Name', required: true, default: true },
      { key: 'email', label: 'Email', required: true, default: true }
    ],
    onSubmit: (data) => {
      console.log('Imported data:', data);
    }
  });

  return <button onClick={init}>Import CSV</button>;
}
```

## 📖 API Reference

### `<CsvMapper />` Component

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `columns` | `CsvColumn[]` | ✅ Yes | Array of column definitions |
| `onSubmit` | `(data: Record<string, string>[]) => void` | ✅ Yes | Callback when data is submitted |
| `trigger` | `React.ReactElement` | ❌ No | Custom trigger button |
| `container` | `string` | ❌ No | Container selector (default: 'body') |
| `availableFields` | `CsvColumn[]` | ❌ No | Pool of fields for dynamic selection |

### `useCsvMapper()` Hook

**Parameters:**
```typescript
{
  columns: CsvColumn[];
  onSubmit: (data: Record<string, string>[]) => void;
  availableFields?: CsvColumn[];
}
```

**Returns:**
```typescript
{
  init: () => void;      // Open the CSV mapper
  destroy: () => void;   // Cleanup the mapper
}
```

### Column Definition

```typescript
interface CsvColumn {
  key: string;                              // Unique identifier
  label: string;                            // Display label
  required?: boolean;                       // Is required?
  default?: boolean;                        // Is selected by default?
  validate?: (value: string) => true | string;  // Custom validation
}
```

## 💡 Examples

### With Custom Trigger Button

```tsx
<CsvMapper
  columns={[...]}
  onSubmit={(data) => console.log(data)}
  trigger={
    <button className="my-custom-button">
      📊 Import Data
    </button>
  }
/>
```

### With Custom Validation

```tsx
<CsvMapper
  columns={[
    {
      key: 'email',
      label: 'Email Address',
      required: true,
      validate: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? true : 'Invalid email format';
      }
    },
    {
      key: 'age',
      label: 'Age',
      validate: (value) => {
        if (!value) return true;
        const age = parseInt(value);
        return (age >= 0 && age <= 120) ? true : 'Age must be 0-120';
      }
    }
  ]}
  onSubmit={async (data) => {
    // Send to API
    const response = await fetch('/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      alert('Data imported successfully!');
    }
  }}
/>
```

### TypeScript Usage

```tsx
import { CsvMapper, CsvColumn } from 'react-csv-mapper';

interface UserData {
  name: string;
  email: string;
  phone: string;
}

const columns: CsvColumn[] = [
  { key: 'name', label: 'Full Name', required: true, default: true },
  { key: 'email', label: 'Email', required: true, default: true },
  { key: 'phone', label: 'Phone Number' }
];

function ImportUsers() {
  const handleSubmit = (data: Record<string, string>[]) => {
    // TypeScript knows the structure
    const users: UserData[] = data.map(row => ({
      name: row.name,
      email: row.email,
      phone: row.phone || ''
    }));

    console.log(users);
  };

  return <CsvMapper columns={columns} onSubmit={handleSubmit} />;
}
```

### Advanced: Using the Hook with State

```tsx
import { useState } from 'react';
import { useCsvMapper } from 'react-csv-mapper';

function AdvancedImport() {
  const [importedData, setImportedData] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  const { init } = useCsvMapper({
    columns: [
      { key: 'name', label: 'Name', required: true, default: true },
      { key: 'email', label: 'Email', required: true, default: true }
    ],
    onSubmit: async (data) => {
      setIsImporting(true);
      try {
        // Process data
        await processImport(data);
        setImportedData(data);
      } finally {
        setIsImporting(false);
      }
    }
  });

  return (
    <div>
      <button onClick={init} disabled={isImporting}>
        {isImporting ? 'Importing...' : 'Import CSV'}
      </button>

      {importedData.length > 0 && (
        <p>Imported {importedData.length} records</p>
      )}
    </div>
  );
}
```



## 🌐 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## 📄 License

MIT © Ahmad Nadeem

## 🔗 Related Packages

- [csv-column-mapper](https://www.npmjs.com/package/csv-column-mapper) - Core vanilla JS library

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

## ⭐ Show your support

Give a ⭐️ if this project helped you!
