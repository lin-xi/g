module.exports = function(grunt) {

    grunt.initConfig({
        pkg : grunt.file.readJSON('package.json'),
       
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
            },
            all: ['src/G.js', 'src/lang/*.js']
        },

        jsdoc : {
            dist : {
                src: ['src/G.js', 'src/lang/*.js'], 
                dest: 'doc'
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
                src : 'dest/g.js',
                dest : 'dest/g.min.js'
            }
        },
		cssmin: {
            css: {
                src: 'dest/all.css',
                dest: 'dest/all-min.css'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jsdoc-plugin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-css');

    grunt.registerTask('default', ['jshint', 'jsdoc', 'concat', 'uglify', 'cssmin']);
}; 