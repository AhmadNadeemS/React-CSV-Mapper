# React CSV Mapper

[![npm version](https://img.shields.io/npm/v/react-csv-mapper.svg)](https://www.npmjs.com/package/react-csv-mapper)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A powerful, production-ready React CSV import component with intelligent column mapping, real-time validation, and a beautiful, themeable UI.

## 🎬 Demo

### Large File Upload with Pagination
![CSV Mapper Demo - Large File Upload with Pagination](https://github.com/AhmadNadeemS/react-csv-mapper/raw/main/assets/demo-1.gif)

*Seamlessly handle large CSV files with web worker-based parsing and built-in pagination*

### Simple Workflow (Small Files)
![CSV Mapper Demo - Complete Workflow](https://github.com/AhmadNadeemS/react-csv-mapper/raw/main/assets/demo.gif)

*Quick import workflow for smaller CSV files (no pagination needed)*

## ✨ Features

### 🚀 Performance & Scalability
- **Web Worker Processing** - Handle large files (100k+ rows) without blocking the UI
- **Streaming Parser** - Memory-efficient chunk-based parsing
- **Real-time Progress** - Live progress updates with row count and percentage
- **Cancellable Operations** - Abort long-running imports at any time

### 🎨 Theming & Customization
- **18 Built-in Themes** - Choose from blue, indigo, purple, pink, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, slate, gray, zinc, neutral, stone
- **Custom Themes** - Pass any hex color for instant theming
- **Custom Trigger** - Use your own button or component to trigger the mapper

### 📊 Data Handling
- **Smart Auto-mapping** - Automatically matches CSV columns to your fields
- **Flexible Field Selection** - Define default fields and let users add more
- **Inline Editing** - Edit cell values directly in the validation step
- **Row Management** - Add or remove rows before import
- **Duplicate Detection** - Automatically identifies duplicate rows
- **Export Options** - Export validated data as JSON or CSV

### ✅ Validation & Quality
- **Real-time Validation** - Instant feedback as users map and edit data
- **Custom Validators** - Define your own validation rules per field
- **Required Fields** - Mark fields as required with visual indicators
- **Error Filtering** - Toggle between all rows and error rows only
- **Validation Summary** - Clear overview of errors and warnings

### 🎯 Developer Experience
- **React Component** - Drop-in `<CsvMapper />` component
- **React Hook** - `useCsvMapper()` hook for custom implementations
- **TypeScript Support** - Full type definitions included
- **Zero Configuration** - Works out of the box with sensible defaults

## 📦 Installation

```bash
npm install react-csv-mapper
```

## 🚀 Quick Start

### Basic Usage

```tsx
import { CsvMapper } from 'react-csv-mapper';

function App() {
  return (
    <CsvMapper
      columns={[
        { key: 'name', label: 'Full Name', required: true, default: true },
        { key: 'email', label: 'Email', required: true, default: true },
        { key: 'phone', label: 'Phone Number' }
      ]}
      onSubmit={(data) => {
        console.log('Imported data:', data);
      }}
      theme="indigo" // Optional: Choose from 18 themes or use hex color
    />
  );
}
```

### With Custom Theme

```tsx
<CsvMapper
  columns={[...]}
  onSubmit={(data) => console.log(data)}
  theme="emerald" // Named theme
  // OR
  theme="#0066ff" // Custom hex color
/>
```

### With Custom Trigger Button

```tsx
<CsvMapper
  columns={[...]}
  onSubmit={(data) => console.log(data)}
  theme="blue"
  trigger={
    <button className="my-custom-button">
      📊 Import CSV
    </button>
  }
/>
```

## 🎨 Theming

The component supports 18 built-in color themes with TypeScript autocomplete:

```tsx
type ThemeColor =
  | 'blue' | 'indigo' | 'purple' | 'pink'
  | 'red' | 'orange' | 'amber' | 'yellow'
  | 'lime' | 'green' | 'emerald' | 'teal'
  | 'cyan' | 'sky' | 'slate' | 'gray'
  | 'zinc' | 'neutral' | 'stone';

<CsvMapper theme="indigo" ... />
```

Or use any custom hex color:

```tsx
<CsvMapper theme="#7c3aed" ... />
```

The theme automatically applies to:
- Primary buttons (Next, Submit)
- Links and interactive text
- Selected header rows
- Radio buttons and checkboxes
- Progress bars
- Borders on focus
- Active pagination buttons

### 🌙 Dark Mode Support

The component comes with built-in dark mode support. You can control it in two ways:

1. **System Preference**: By default, it automatically respects the user's system preference (`prefers-color-scheme: dark`).
2. **Manual Control**: Use the `isDark` prop to force a specific theme.

```tsx
<CsvMapper
  columns={columns}
  onSubmit={handleSubmit}
  isDark={true} // Force dark mode
  theme="indigo"
/>
```

When in dark mode, you can still use the `theme` prop to control the primary accent color.

## 📖 API Reference

### `<CsvMapper />` Component

| Prop        | Type                                       | Required | Description                             |
| ----------- | ------------------------------------------ | -------- | --------------------------------------- |
| `columns`   | `CsvColumn[]`                              | ✅ Yes    | Array of column definitions             |
| `onSubmit`  | `(data: Record<string, string>[]) => void` | ✅ Yes    | Callback when data is submitted         |
| `theme`     | `ThemeColor \| string`                     | ❌ No     | Theme color (named or hex)              |
| `trigger`   | `React.ReactElement`                       | ❌ No     | Custom trigger button                   |
| `container` | `string`                                   | ❌ No     | Container selector (default: 'body')    |
| `isDark`    | `boolean`                                  | ❌ No     | Enable dark mode (default: system pref) |

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

### `useCsvMapper()` Hook

```tsx
import { useCsvMapper } from 'react-csv-mapper';

const { init, destroy } = useCsvMapper({
  columns: [...],
  onSubmit: (data) => console.log(data)
});

// Open mapper
<button onClick={init}>Import CSV</button>
```

## 💡 Advanced Examples

### Custom Validation

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
    await fetch('/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }}
  theme="purple"
/>
```

### Dynamic Field Selection

```tsx
// Define all possible fields
const allFields = [
  { key: 'firstName', label: 'First Name', default: true },
  { key: 'lastName', label: 'Last Name', default: true },
  { key: 'email', label: 'Email', required: true, default: true },
  { key: 'phone', label: 'Phone' },
  { key: 'company', label: 'Company' },
  { key: 'title', label: 'Job Title' },
  { key: 'address', label: 'Address' },
  { key: 'city', label: 'City' },
  { key: 'country', label: 'Country' }
];

// Users can select which fields to import
<CsvMapper
  columns={allFields}
  onSubmit={(data) => console.log(data)}
  theme="teal"
/>
```

### TypeScript Usage

```tsx
import { CsvMapper, CsvColumn, ThemeColor } from 'react-csv-mapper';

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

const theme: ThemeColor = 'indigo';

function ImportUsers() {
  const handleSubmit = (data: Record<string, string>[]) => {
    const users: UserData[] = data.map(row => ({
      name: row.name,
      email: row.email,
      phone: row.phone || ''
    }));

    console.log(users);
  };

  return <CsvMapper columns={columns} onSubmit={handleSubmit} theme={theme} />;
}
```

## 🔧 How It Works

1. **Upload** - Drag & drop or paste CSV data
2. **Select Header** - Choose which row contains column headers (with pagination for large files)
3. **Map Columns** - Auto-mapped or manually map CSV columns to your fields
4. **Validate & Edit** - Review data, fix errors, add/remove rows (paginated view)
5. **Submit** - Clean, validated data ready for your API

## 🌐 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

Requires Web Worker support for large file processing.

## 📄 License

MIT © Ahmad Nadeem

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

## ⭐ Show your support

Give a ⭐️ if this project helped you!
