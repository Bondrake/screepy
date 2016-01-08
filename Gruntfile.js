module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-screeps')

  grunt.initConfig({
    screeps: {
      options: {
        email: '',
        password: '',
        branch: 'new_test',
        ptr: false
      },
      dist: {
        src: ['dist/*.js']
      }
    }
  })
}
