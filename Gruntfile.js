module.exports = function(grunt) {

    grunt.initConfig({
        pkg : grunt.file.readJSON('package.json'),
        lint: {
            files: ['src/**/*.js','spec/**/*.js']
        },
        watch: {
            files: ['<config:jasmine.specs>','src/**/*js'],
            tasks: 'jasmine'
        },
        jasmine : {
            src   : 'src/**/*.js',
            specs : 'spec/**/*.js'
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                node: true,
                es5: true
            },
            globals: {
                jasmine : false,
                describe : false,
                beforeEach : false,
                expect : false,
                it : false,
                spyOn : false
            }
        },

        concat : {
            js : {
                src: [
                    'src/lang/lang.js',
                    'src/lang/class.js',
                    'G.js'
                ],
                dest: 'dest/g.js'
            },
			css : {
				src: ['*.css'],
                dest: 'dest/all.css'
			}
        },
        uglify : {
            options : {
                banner : '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build : {
                src : 'dest/mePlayer.js',
                dest : 'dest/mePlayer.min.js'
            }
        },
		cssmin: {
            css: {
                src: 'dest/all.css',
                dest: 'dest/all-min.css'
            }
        }
    });

    grunt.loadNpmTasks('grunt-jasmine-runner');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-css');

    grunt.registerTask('default', ['lint', 'jasmine', 'concat', 'uglify', 'cssmin']);
}; 