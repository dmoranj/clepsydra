'use strict';

/**
 * Grunt tasks definitions
 *
 * @param {Object} grunt
 */
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkgFile: 'package.json',
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            reportTest: ['report/test'],
            reportLint: ['report/lint'],
            reportCoverage: ['report/coverage'],
            siteCoverage: ['site/coverage'],
            siteDoc: ['site/doc'],
            siteReport: ['site/report']
        },

        mkdir: {
            reportTest: {
                options: {
                    create: ['<%= clean.reportTest[0] %>']
                }
            },
            reportLint: {
                options: {
                    create: ['<%= clean.reportLint[0] %>']
                }
            },
            reportCoverage: {
                options: {
                    create: ['<%= clean.reportCoverage[0] %>']
                }
            },
            siteCoverage: {
                options: {
                    create: ['<%= clean.siteCoverage[0] %>']
                }
            },
            siteDoc: {
                options: {
                    create: ['<%= clean.siteDoc[0] %>']
                }
            },
            siteReport: {
                options: {
                    create: ['<%= clean.siteReport[0] %>']
                }
            }
        },

        jshint: {
            gruntfile: {
                src: 'Gruntfile.js',
                options: {
                    jshintrc: '.jshintrc'
                }
            },
            lib: {
                src: ['lib/**/*.js'],
                options: {
                    jshintrc: '.jshintrc'
                }
            },
            test: {
                src: ['test/**/*.js'],
                options: {
                    jshintrc: 'test/.jshintrc'
                }
            },
            reportGruntfile: {
                src: 'Gruntfile.js',
                options: {
                    reporter: 'checkstyle',
                    reporterOutput: '<%= clean.reportLint[0] %>/jshint-gruntfile.xml',
                    jshintrc: '.jshintrc'
                }
            },
            reportLib: {
                src: 'lib/**/*.js',
                options: {
                    reporter: 'checkstyle',
                    reporterOutput: '<%= clean.reportLint[0] %>/jshint-lib.xml',
                    jshintrc: '.jshintrc'
                }
            },
            reportTest: {
                src: 'test/**/*.js',
                options: {
                    reporter: 'checkstyle',
                    reporterOutput: '<%= clean.reportLint[0] %>/jshint-test.xml',
                    jshintrc: 'test/.jshintrc'
                }
            }
        },

        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            lib: {
                files: '<%= jshint.lib.src %>',
                tasks: ['jshint:lib', 'test']
            },
            test: {
                files: '<%= jshint.test.src %>',
                tasks: ['jshint:test', 'test']
            }
        },

        mochaTest: {
            unit: {
                options: {
                    ui: 'bdd',
                    reporter: 'spec'
                },
                src: [
                    'tools/mocha-globals.js',
                    '<%= jshint.test.src %>'
                ]
            },
            unitReport: {
                options: {
                    ui: 'bdd',
                    reporter: 'tap',
                    quiet: true,
                    captureFile: '<%= clean.reportTest[0] %>/unit_tests.tap'
                },
                src: [
                    'tools/mocha-globals.js',
                    '<%= jshint.test.src %>'
                ]
            }
        },

        dox: {
            options: {
                title: 'fiware-iotagent-lib documentation'
            },
            files: {
                src: ['<%= jshint.lib.src %>'],
                dest: '<%= clean.siteDoc[0] %>'
            }
        },

        exec: {
            istanbul: {
                cmd:
                'bash -c "./node_modules/.bin/istanbul cover --root lib/ --dir <%= clean.siteCoverage[0] %> -- ' +
                '\\"`npm root -g`/grunt-cli/bin/grunt\\" test && ' +
                './node_modules/.bin/istanbul report --dir <%= clean.siteCoverage[0] %> text-summary"'
            },
            istanbulCobertura: {
                cmd:
                'bash -c "./node_modules/.bin/istanbul report --dir <%= clean.siteCoverage[0] %> cobertura && ' +
                'mv <%= clean.siteCoverage[0] %>/cobertura-coverage.xml <%= clean.reportCoverage[0] %>"'
            }
        },

        plato: {
            options: {
                jshint: grunt.file.readJSON('.jshintrc')
            },
            lib: {
                files: {
                    '<%= clean.siteReport[0] %>': '<%= jshint.lib.src %>'
                }
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-plato');
    grunt.loadNpmTasks('grunt-dox');
    grunt.loadNpmTasks('grunt-mkdir');

    grunt.registerTask('test', 'Run tests', ['mochaTest:unit']);

    grunt.registerTask('test-report', 'Generate tests reports',
        ['clean:reportTest', 'mkdir:reportTest', 'mochaTest:unitReport']);

    grunt.registerTask('coverage', 'Print coverage report',
        ['clean:siteCoverage', 'exec:istanbul']);

    grunt.registerTask('coverage-report', 'Generate Cobertura report',
        ['clean:reportCoverage', 'mkdir:reportCoverage', 'coverage', 'exec:istanbulCobertura']);

    grunt.registerTask('complexity', 'Generate code complexity reports', ['plato']);

    grunt.registerTask('doc', 'Generate source code JSDoc', ['dox']);

    grunt.registerTask('lint-jshint', 'Check source code style with JsHint',
        ['jshint:gruntfile', 'jshint:lib', 'jshint:test']);

    grunt.registerTask('lint', 'Check source code style', ['lint-jshint']);

    grunt.registerTask('lint-report', 'Generate checkstyle reports',
        ['clean:reportLint', 'mkdir:reportLint', 'jshint:reportGruntfile', 'jshint:reportLib',
            'jshint:reportTest']);

    // Default task.
    grunt.registerTask('default', ['lint', 'test']);

};
