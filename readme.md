# ratsorat

[![build status](https://circleci.com/gh/ohjames/ratsorat.png)](https://circleci.com/gh/ohjames/ratsorat)

Recursive dependency tracking with support for asynchronous functions and detection of cyclic dependencies.

```javascript
import {compile} from 'ratsorat'
const modules = { a: 'a', b: 'b', c: 'c' }
const compiled = compile(modules, (runDependency, val, arg) => {
  if (val === 'a')
    return runDependency('b', arg).then(result => result + 10 + arg)
  else if (val === 'b')
    return 30
  else
    throw Error('invalid call')
})

compiled('a', 2)
.then(result => {
  result.should.equal(22)
  compiled.results.should.have.property('a', 42)
  compiled.results.should.have.property('b', 30)
})
```

The compile function modifies the passed callback:
 * It adds a first argument which is equivalent to calling the compiled function itself.
 * The first argument is looked up in the list of modules that was provided when the function was compiled and the looked up value is provided as the second argument of the callback.
 * Remaining arguments are forwarded.
 * A `results` object is attached to the compiled function which contains the result the callback returned (with promises being resolved).

The library also detects dependency cycles:

```javascript
const modules = { a: 'a', b: 'b' }
const compiled = compile(modules, (runDependency, val) => {
  if (val === 'a')
    return runDependency('b').thenReturn(10)
  else if (val === 'b')
    return runDependency('a').thenReturn(20)
})

return compiled('a').catch(err => {
  err.should.have.property('message', 'dependency cycle: a -> b -> a')
})
```
