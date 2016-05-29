import Promise from 'bluebird'

export function compile(dependencies, callback) {
  const compiled = (id, ...args) => {
    var obj = dependencies[id]
    const result = results[id]
    if (result)
      return Promise.resolve(result)

    if (stack.indexOf(id) !== -1)
      return Promise.reject(new Error('dependency cycle: ' + stack.concat([id]).join(' -> ')))

    stack.push(id)
    return Promise.try(callback.bind(null, compiled, obj, ...args))
    .then(result => {
      stack.pop()
      results[id] = result
      return result
    })
    .catch(err => {
      stack.pop()
      throw err
    })
  }

  compiled.dependencies = dependencies
  const results = compiled.results = {}
  const stack = []

  return compiled
}

export function resolveAll(compiledFunction, ...args) {
  var ids = Object.keys(compiledFunction.dependencies)

  return Promise.mapSeries(ids, id => {
    return compiledFunction(id, ...args)
  })
  .then(() => compiledFunction.results)
}
