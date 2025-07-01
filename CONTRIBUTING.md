# Contributing to DocMosaic

We love your input! We want to make contributing to DocMosaic as easy and transparent as possible, whether it's:

-   Reporting a bug
-   Discussing the current state of the code
-   Submitting a fix
-   Proposing new features
-   Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Local Development Setup

1. Clone the repository

```bash
git clone https://github.com/yourusername/doc-mosaic.git
cd doc-mosaic
```

2. Install dependencies

```bash
npm install
# or
yarn
```

3. Start the development server

```bash
npm run dev
# or
yarn dev
```

## Project Structure

```
doc-mosaic/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   │   ├── pdf-editor/   # PDF editor components
│   │   └── ui/          # Shared UI components
│   └── lib/             # Utilities and helpers
├── public/              # Static files
└── tests/              # Test files
```

## Coding Style

-   Use TypeScript for type safety
-   Follow the existing code style
-   Use functional components with hooks
-   Write meaningful commit messages following conventional commits
-   Document complex logic with comments
-   Use meaningful variable and function names

## Testing

-   Write unit tests for utilities and components
-   Add integration tests for complex features
-   Test edge cases and error scenarios
-   Ensure accessibility compliance

## Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the documentation with details of any new features
3. The PR will be merged once you have the sign-off of maintainers

## Any Questions?

Feel free to file an issue with your question or reach out to the maintainers directly.

## License

By contributing, you agree that your contributions will be licensed under its MIT License.
