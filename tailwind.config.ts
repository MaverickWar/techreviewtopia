
import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  darkMode: ["class"],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100%',
            color: 'var(--tw-prose-body)',
            '[class~="lead"]': {
              color: 'var(--tw-prose-lead)',
            },
            a: {
              color: 'var(--tw-prose-links)',
              textDecoration: 'underline',
              fontWeight: '500',
            },
            strong: {
              color: 'var(--tw-prose-bold)',
              fontWeight: '600',
            },
            'a strong': {
              color: 'inherit',
            },
            'blockquote strong': {
              color: 'inherit',
            },
            'thead strong': {
              color: 'inherit',
            },
            table: {
              width: '100%',
              borderCollapse: 'collapse',
              borderSpacing: 0,
              marginTop: '2em',
              marginBottom: '2em',
            },
            'thead th': {
              backgroundColor: 'var(--tw-prose-th-backgrounds)',
              borderBottom: '1px solid var(--tw-prose-th-borders)',
              borderColor: 'inherit',
              padding: '0.5em',
              textAlign: 'left',
            },
            'thead th:first-child': {
              paddingLeft: '0',
            },
            'thead th:last-child': {
              paddingRight: '0',
            },
            'tbody td, tfoot td': {
              borderBottom: '1px solid var(--tw-prose-td-borders)',
              borderColor: 'inherit',
              padding: '0.5em',
            },
            'tbody td:first-child, tfoot td:first-child': {
              paddingLeft: '0',
            },
            'tbody td:last-child, tfoot td:last-child': {
              paddingRight: '0',
            },
            'figure img': {
              margin: '0',
            },
            'figure figcaption': {
              color: 'var(--tw-prose-captions)',
              fontSize: '0.875em',
              lineHeight: '1.4285714',
              marginTop: '0.8571429em',
            },
            code: {
              backgroundColor: 'var(--tw-prose-code-bg)',
              borderRadius: '0.25rem',
              padding: '0.25rem 0.4rem',
              fontWeight: '600',
            },
            pre: {
              backgroundColor: 'var(--tw-prose-pre-bg)',
              borderRadius: '0.375rem',
              overflowX: 'auto',
              padding: '0.75rem 1rem',
            },
            'pre code': {
              backgroundColor: 'transparent',
              borderWidth: '0',
              borderRadius: '0',
              padding: '0',
              fontWeight: 'inherit',
              color: 'inherit',
              fontSize: 'inherit',
              fontFamily: 'inherit',
              lineHeight: 'inherit',
            },
            img: {
              marginTop: '2em',
              marginBottom: '2em',
              borderRadius: '0.375rem',
            },
            video: {
              marginTop: '2em',
              marginBottom: '2em',
            },
            figure: {
              marginTop: '2em',
              marginBottom: '2em',
            },
            h1: {
              color: 'var(--tw-prose-headings)',
              fontWeight: '800',
              fontSize: '2.25em',
              marginTop: '0',
              marginBottom: '0.8888889em',
              lineHeight: '1.1111111',
            },
            h2: {
              color: 'var(--tw-prose-headings)',
              fontWeight: '700',
              fontSize: '1.5em',
              marginTop: '2em',
              marginBottom: '1em',
              lineHeight: '1.3333333',
            },
            h3: {
              color: 'var(--tw-prose-headings)',
              fontWeight: '600',
              fontSize: '1.25em',
              marginTop: '1.6em',
              marginBottom: '0.6em',
              lineHeight: '1.6',
            },
            h4: {
              color: 'var(--tw-prose-headings)',
              fontWeight: '600',
              marginTop: '1.5em',
              marginBottom: '0.5em',
              lineHeight: '1.5',
            },
            h5: {
              color: 'var(--tw-prose-headings)',
              fontWeight: '600',
              fontSize: '0.875em',
              marginTop: '1.7142857em',
              marginBottom: '0.5em',
              lineHeight: '1.4285714',
            },
            h6: {
              color: 'var(--tw-prose-headings)',
              fontWeight: '600',
              fontSize: '0.875em',
              marginTop: '1.7142857em',
              marginBottom: '0.5em',
              lineHeight: '1.4285714',
            },
            'ul, ol': {
              paddingLeft: '1.25em',
            },
            'ul ul, ul ol, ol ul, ol ol': {
              marginTop: '0.75em',
              marginBottom: '0.75em',
            },
            blockquote: {
              fontWeight: '500',
              fontStyle: 'italic',
              color: 'var(--tw-prose-quotes)',
              borderLeftWidth: '0.25rem',
              borderLeftColor: 'var(--tw-prose-quote-borders)',
              quotes: '"\\201C""\\201D""\\2018""\\2019"',
              marginTop: '1.6em',
              marginBottom: '1.6em',
              paddingLeft: '1em',
            },
          },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/typography'),
  ],
} satisfies Config
