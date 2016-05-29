var glob, pipeline, babel, merge, write, mocha

module.exports = function(pipelines) {
  var babelOpts = {
    presets: ['es2015-loose', 'stage-1'],
    plugins: ['transform-es2015-modules-commonjs'],
  }

  pipelines['source:js'] = [
    glob({ basePath: 'src' }, 'index.js'),
    babel(babelOpts),
    write('lib')
  ]

  pipelines['test:js'] = [
    glob({ basePath: 'src' }, 'index.spec.js'),
    babel(babelOpts),
    write('lib')
  ]

  pipelines.alias.build = ['test:js', 'source:js']

  pipelines['tests:run'] = [
    merge(
      { collectInitial: true },
      pipeline('source:js'),
      pipeline('test:js')
    ),
    pipeline({ activate: true }, 'mocha')
  ]

  pipelines.explicit.mocha = [ mocha({ files: 'lib/index.spec.js' }) ]
}
