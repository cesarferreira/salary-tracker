# Salary Tracker

A modern salary tracking application built with Next.js that helps you monitor and compare salaries across different currencies and time periods.

## Getting Started

First, run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- 💰 Track salaries in multiple currencies
- 🔄 Real-time currency conversion
- 📊 Salary history visualization
- 💾 Local storage persistence
- 🌙 Dark/Light mode support
- 📱 Responsive design

## Prerequisites

Before you begin, ensure you have the following installed:
- [Bun](https://bun.sh) (latest version)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/salary-tracker.git
```

2. Install dependencies:
```bash
bun install
```

## Environment Variables

Create a `.env.local` file in the root directory and add the following variables:

```bash
NEXT_PUBLIC_DEFAULT_CURRENCY=USD
# Add any additional environment variables
```

## Project Structure

```
├── src/
│   ├── app/           # Next.js app router pages
│   ├── components/    # React components
│   │   ├── ui/       # Reusable UI components
│   │   └── *         # Feature-specific components
│   └── lib/          # Utility functions
├── public/           # Static assets
└── .github/         # GitHub Actions workflows
```

## Testing

Run the test suite:

```bash
bun test
```

## Deployment

This project is configured for deployment with GitHub Actions. Every push to the main branch triggers an automatic deployment.

You can also deploy manually using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Deployed with [GitHub Actions](https://github.com/features/actions)

## Contact

Project Link: [https://github.com/yourusername/salary-tracker](https://github.com/yourusername/salary-tracker)