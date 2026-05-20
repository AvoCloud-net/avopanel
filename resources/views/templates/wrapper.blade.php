<!DOCTYPE html>
<html lang="en">
    <head>
        <title>{{ config('app.name', 'Everest') }}</title>

        @section('meta')
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
            <meta name="csrf-token" content="{{ csrf_token() }}">
            <meta name="robots" content="noindex">
            <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png">
            <link rel="icon" type="image/png" href="/favicons/favicon-32x32.png" sizes="32x32">
            <link rel="icon" type="image/png" href="/favicons/favicon-16x16.png" sizes="16x16">
            <link rel="manifest" href="/favicons/manifest.json">
            <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#bc6e3c">
            <link rel="shortcut icon" href="/favicons/favicon.ico">
            <meta name="msapplication-config" content="/favicons/browserconfig.xml">
            <meta name="theme-color" content="#0a0a0a">
        @show

        @section('user-data')
            @if(!is_null(Auth::user()))
                <script>
                    window.PterodactylUser = {!! json_encode(Auth::user()->toReactObject(), JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT) !!};
                </script>
            @endif
            @if(!empty($siteConfiguration))
                <script>
                    window.SiteConfiguration = {!! json_encode($siteConfiguration, JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT) !!};
                </script>
            @endif
            @if(!empty($everestConfiguration))
                <script>
                    window.EverestConfiguration = {!! json_encode($everestConfiguration, JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT) !!};
                </script>
            @endif
            @if(!empty($themeConfiguration))
                <script>
                    window.ThemeConfiguration = {!! json_encode($themeConfiguration, JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT) !!};
                </script>
            @endif
        @show
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Quicksand:wght@300..700&family=IBM+Plex+Mono&display=swap');

            body {
                background-color: {{ $themeConfiguration['colors']['background'] }};
                font-family: 'Quicksand', system-ui, sans-serif;
            }

            /* AvoCloud gradient accent bar (top edge) */
            body::before {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, #9333ea, #ec4899, #eab308, #9333ea);
                background-size: 300% 100%;
                z-index: 9999;
                animation: avocloud-gradient 8s ease infinite;
                pointer-events: none;
            }

            @keyframes avocloud-gradient {
                0%   { background-position: 0% 50%; }
                50%  { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
        </style>

        @yield('assets')

        @include('layouts.scripts')

        @viteReactRefresh
        @vite('resources/scripts/index.tsx')
    </head>
    <body>
        @section('content')
            @yield('above-container')
            @yield('container')
            @yield('below-container')
        @show
    </body>
</html>
