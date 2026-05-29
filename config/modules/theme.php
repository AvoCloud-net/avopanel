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
        // AvoCloud brand v1.0.0 — coral primary, mono near-black surfaces.
        'primary' => env('THEME_COLORS_PRIMARY', '#FF6B4A'),
        'secondary' => env('THEME_COLORS_SECONDARY', '#131313'),

        'background' => env('THEME_COLORS_BACKGROUND', '#0B0B0B'),
        'headers' => env('THEME_COLORS_HEADERS', '#131313'),
        'sidebar' => env('THEME_COLORS_SIDEBAR', '#0F0F10'),
    ],
];
