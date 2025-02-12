# Doc Mosaic - Simple PDF Document Creator

A web-based tool for creating PDF documents with images. Perfect for arranging ID documents, receipts, photo collages, and more.

## Features

- Drag and drop interface for image placement
- Resizable image sections
- Real-time preview
- A4 page format support
- One-click PDF generation
- Responsive design

## Getting Started

### Prerequisites

- Node.js 18+ or Bun 1.0+
- npm or bun package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd doc-mosaic
```

2. Install dependencies:

```bash
bun install
# or
npm install
```

3. Start the development server:

```bash
bun dev
# or
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Click "Create PDF" on the landing page
2. Add sections to your document using the "Add Section" button
3. Upload images to sections by dragging and dropping or clicking to browse
4. Adjust section positions and sizes as needed
5. Click "Download PDF" to generate and download your document

## Tech Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- React PDF
- React Draggable

## License

MIT License - feel free to use this project for any purpose.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
