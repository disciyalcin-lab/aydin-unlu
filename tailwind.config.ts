/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        shop: {
          50: '#f3f8ff',
          100: '#e7f0ff',
          500: '#2563eb',
          600: '#1d4ed8',
          900: '#0f172a'
        },
        accent: {
          500: '#f59e0b'
        },
        success: '#10b981',
        alert: '#ef4444',
        warning: '#f59e0b',
        muted: '#64748b'
      },
      boxShadow: {
        soft: '0 10px 25px -10px rgba(15, 23, 42, 0.2)'
      }
    }
  },
  plugins: [],
};
