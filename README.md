# Dive Travel Buddy

A smart travel companion application built with React and OpenAI integration to help divers plan their perfect diving trips based on seasons and conditions.

## Features

- Seasonal diving recommendations
- Interactive chat interface
- OpenAI-powered suggestions
- Material-UI based responsive design

## Setup

1. Clone the repository

```bash
git clone https://github.com/jschwellach/dive-travel-buddy.git
cd dive-travel-buddy
```

2. Install dependencies

```bash
npm install
```

3. Environment Configuration

- Copy the `.env.sample` file to `.env`:

```bash
cp .env.sample .env
```

- Update the `.env` file with your OpenAI API key and other configurations

4. Start the development server

```bash
npm run dev
```

The application will be available at http://localhost:5173

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Technologies Used

- React 18
- TypeScript
- Vite
- Material-UI
- OpenAI API
- React Markdown

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
