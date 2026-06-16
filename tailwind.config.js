import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            animation: {
                'spin-slow': 'spin 8s linear infinite',
                'fade-in-up': 'fadeInUp 0.3s ease-out forwards',
                'hero-fade-in': 'heroFadeIn 0.5s ease-out forwards',
                'lightning-1': 'lightning1 3s ease-in-out infinite',
                'lightning-2': 'lightning2 4s ease-in-out 1s infinite',
                'lightning-3': 'lightning3 3.5s ease-in-out 0.5s infinite',
                'lightning-4': 'lightning4 2.8s ease-in-out 1.5s infinite',
            },
            keyframes: {
                heroFadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(12px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(8px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                lightning1: {
                    '0%, 100%': { opacity: '0' },
                    '4%': { opacity: '1' },
                    '6%': { opacity: '0' },
                    '8%': { opacity: '0.8' },
                    '10%': { opacity: '0' },
                    '50%': { opacity: '0' },
                    '52%': { opacity: '0.6' },
                    '53%': { opacity: '0' },
                },
                lightning2: {
                    '0%, 100%': { opacity: '0' },
                    '20%': { opacity: '0' },
                    '21%': { opacity: '1' },
                    '23%': { opacity: '0' },
                    '25%': { opacity: '0.7' },
                    '26%': { opacity: '0' },
                    '70%': { opacity: '0' },
                    '71%': { opacity: '0.5' },
                    '72%': { opacity: '0' },
                },
                lightning3: {
                    '0%, 100%': { opacity: '0' },
                    '35%': { opacity: '0' },
                    '36%': { opacity: '0.9' },
                    '37%': { opacity: '0' },
                    '39%': { opacity: '0.6' },
                    '40%': { opacity: '0' },
                },
                lightning4: {
                    '0%, 100%': { opacity: '0' },
                    '60%': { opacity: '0' },
                    '61%': { opacity: '1' },
                    '62%': { opacity: '0' },
                    '63%': { opacity: '0.8' },
                    '64%': { opacity: '0' },
                    '90%': { opacity: '0' },
                    '91%': { opacity: '0.4' },
                    '92%': { opacity: '0' },
                },
            },
        },
    },

    plugins: [forms],
};
