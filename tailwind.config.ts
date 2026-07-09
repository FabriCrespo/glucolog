const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, '') ?? '';

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /** Vitality Intelligence — paleta principal */
        vitality: {
          primary: '#32B970',
          'primary-dark': '#2a9d5f',
          secondary: '#E8F5F1',
          tertiary: '#10B981',
          neutral: '#334155',
        },
        green: {
          50: '#32B970',
          90: '#334155',
        },
        gray: {
          10: '#EEEEEE',
          20: '#A2A2A2',
          30: '#7B7B7B',
          50: '#585858',
          90: '#141414',
        },
        orange: {
          50: '#FF814C',
        },
        blue: {
          70: '#021639',
        },
        yellow: {
          50: '#FEC601',
        },
      },
      backgroundImage: {
        'bg-img-1': `url('${basePath}/img-1.png')`,
        'bg-img-2': `url('${basePath}/img-2.png')`,
        'feature-bg': `url('${basePath}/images/backgrounds/feature-bg.png')`,
        pattern: `url('${basePath}/images/backgrounds/pattern.png')`,
        'pattern-2': `url('${basePath}/images/backgrounds/pattern-bg.png')`,
      },
      screens: {
        xs: '400px',
        '3xl': '1680px',
        '4xl': '2200px',
      },
      maxWidth: {
        '10xl': '1512px',
      },
      borderRadius: {
        '5xl': '40px',
      },
    },
  },
  plugins: [],
};
