import Promise from 'bluebird'

export function compile(dependencies, callback) {
  const compiled = (id, ...args) => {
    const result = results[id]
    if (result)
      return Promise.resolve(result)

    if (stack.indexOf(id) !== -1)
      return Promise.reject(new Error('dependency cycle: ' + stack.concat([id]).join(' -> ')))

    stack.push(id)
    const obj = dependencies[id]
    if (! obj)
      return Promise.reject(new Error('could not find module: ' + id))

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
  if (ids.length === Object.keys(compiledFunction.results).length)
    return Promise.resolve(compiledFunction.results)

  return Promise.mapSeries(ids, id => {
    return compiledFunction(id, ...args)
  })
  .then(resolveAll.bind(null, compiledFunction, ...args))
}
