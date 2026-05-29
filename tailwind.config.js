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
                black: '#0B0B0B',
                slate: colors.slate,
                // AvoCloud brand v1.0.0 — mono-first + coral accent.
                // `primary-*` utilities resolve to the coral ramp (500 = #FF6B4A,
                // the dark-mode primary used across the panel's dark UI).
                primary: {
                    50: '#FFF1ED',
                    100: '#FFE0D6',
                    200: '#FFC2AE',
                    300: '#FF9379',
                    400: '#FF7A5C',
                    500: '#FF6B4A',
                    600: '#ED5333',
                    700: '#C73D20',
                    800: '#A32E18',
                    900: '#7D2614',
                    950: '#45110A',
                },
                neutral: colors.slate,
                cyan: colors.cyan,
                zinc: colors.zinc,
                avo: {
                    coral: '#FF6B4A',
                    'coral-soft': '#FF9379',
                    'coral-deep': '#C73D20',
                    bg: '#0B0B0B',
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
