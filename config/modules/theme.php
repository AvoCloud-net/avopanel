<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Theme Configuration
    |--------------------------------------------------------------------------
    |
    | These settings allow you to set custom hex values for the Panel's theme.
    | This can be configured in the admin pages, and can also be edited here
    | for ease of use.
    |
    */
    'colors' => [
        // AvoCloud brand defaults — purple primary, near-black surfaces.
        'primary' => env('THEME_COLORS_PRIMARY', '#9333ea'),
        'secondary' => env('THEME_COLORS_SECONDARY', '#1a1a1a'),

        'background' => env('THEME_COLORS_BACKGROUND', '#0a0a0a'),
        'headers' => env('THEME_COLORS_HEADERS', '#141414'),
        'sidebar' => env('THEME_COLORS_SIDEBAR', '#0f0f10'),
    ],
];
