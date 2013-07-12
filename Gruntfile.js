module.exports = function(grunt) {

    grunt.initConfig({
        pkg : grunt.file.readJSON('package.json'),
        concat : {
            js : {
                src: ['src/meaudio.js', 'src/meplayer.js'],
                dest: 'dest/mePlayer.js'
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

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-css');

    grunt.registerTask('default', ['concat', 'uglify', 'cssmin']);
}; 