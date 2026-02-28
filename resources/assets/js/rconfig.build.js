({
    baseUrl: "resources/assets/js",

    mainConfigFile: "resources/assets/js/rconfig.js",

    name: "main",               // your AMD entry file
    out: "public/js/main.amd.min.js",

    optimize: "uglify2",

    preserveLicenseComments: false,
    generateSourceMaps: true,

    wrap: true,

    uglify2: {
        compress: {
            drop_console: true,
            passes: 2
        },
        output: {
            comments: false
        }
    }
})
