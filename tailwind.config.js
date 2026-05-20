const colors = require('tailwindcss/colors');

module.exports = {
    content: ['./resources/scripts/**/*.{js,ts,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                header: ['"Syne"', 'system-ui', 'sans-serif'],
                sans: ['"Quicksand"', 'system-ui', 'sans-serif'],
                mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
            },
            colors: {
                black: '#0a0a0a',
                slate: colors.slate,
                // AvoCloud brand — purple primary, pink secondary, yellow accent.
                // "primary" and "neutral" are deprecated in upstream code; new code
                // should use `avo-*` aliases or Tailwind's purple/pink/yellow scales.
                primary: colors.purple,
                neutral: colors.slate,
                cyan: colors.cyan,
                zinc: colors.zinc,
                avo: {
                    purple: '#9333ea',
                    pink: '#ec4899',
                    yellow: '#eab308',
                    bg: '#0a0a0a',
                },
            },
            fontSize: {
                '2xs': '0.625rem',
            },
            transitionDuration: {
                250: '250ms',
            },
            backgroundImage: {
                'login': "url('https://images.unsplash.com/photo-1531257114315-24a694751517')",
            },
            borderColor: theme => ({
                default: theme('colors.neutral.400', 'currentColor'),
            }),
        },
    },
    plugins: [
        require('@tailwindcss/line-clamp'),
        require('@tailwindcss/forms')({
            strategy: 'class',
        }),
    ],
};
