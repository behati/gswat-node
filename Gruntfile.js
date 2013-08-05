var fs = require('fs');

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		less: {
			dist: {
				options: {
					paths: 'less',
					compress: true,
					yuicompress: true
				},
				files: {
					'public/css/structure.css': 'less/structure.less'
				}
			},
			dev: {
				options:{
					paths: 'less',
					relativeUrls: true,
					dumpLineNumbers: 'comments'
				},
				files: {
					'public/css/structure.css': 'less/structure.less'
				}
			}
		},
		jade: {
			compile: {
				options: {
					data: function(){
						var files = {};
						files.views = fs.readdirSync('public/js/views');
						files.models = fs.readdirSync('public/js/models');
						var jade_template = '';

						for (var i in files) {
							var j = 0;

							while(j < files[i].length){
								var file = files[i][j];
								jade_template += '\'/js/' + i + '/' + file + '\'';
								j++;

								//TODO: Fix this properly, too tired
								if(files[i][j]){
									jade_template += ',';
								} else {
									if(i == 'views'){
										jade_template += ',';
									}
								}
								jade_template += '\n';
							}
						}
						return {files:jade_template};
					}
				},
				files: {
					'public/js/adminloader.js': 'views/adminloader.jade'
				}
			}
		},
		watch: {
			css: {
				files: [
					'less/**'
				],
				tasks: [
					'less:dev',
					'watch:css'
				]
			},
			template_files: {
				files: [
					'views/**',
					'views/**/**',
					'public/js/views/**',
					'public/js/models/**'
				],
				tasks: [
					'build_includes',
					'jade',
					'watch:template_files'
				]
			},
			options: {
				nospawn: true
			}
		}
	});

	grunt.loadNpmTasks('grunt-develop');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-jade');

	// Add the JADE includes
	grunt.registerTask('build_includes', 'Generates the JADE mustache template includes', function(){
		var files = fs.readdirSync('views/templates');
		var jade_template = '';
		var i = 0;
		while (i < files.length) {
			var file = files[i].replace('.jade','');
			jade_template += 'script#' + file + '(type="text/html")\n';
			jade_template += '	include templates/' + file + ' \n \n';
			i++;
		}
		fs.writeFileSync('views/templates.jade', jade_template);
		return true;
	});

	// Builds the template files and includes
	grunt.registerTask('template_files', function(){
		var tasks = [
			'build_includes',
			'jade',
			'watch:template_files'
		];

		grunt.option('force', true);
		grunt.task.run(tasks);
	});

	// Compiles the SCSS files with compass and outputs CSS
	grunt.registerTask('css', function(){
		var tasks = [
			'less:dev',
			'watch:css'
		];

		grunt.option('force', true);
		grunt.task.run(tasks);
	});

	// Production task
	grunt.registerTask('release', [
		'less:dist',
		'build_includes',
		'jade'
	]);
};