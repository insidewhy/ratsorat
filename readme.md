# ratsorat

[![build status](https://circleci.com/gh/ohjames/ratsorat.png)](https://circleci.com/gh/ohjames/ratsorat)

Used to provide recursive dependency tracking with support for asynchronous functions and error tracking.


```javascript
import {compile} from 'ratsorat'
const modules = { a: 'a', b: 'b', c: 'c' }
const compiled = compile(modules, (runDependency, val, arg) => {
  if (val === 'a')
    return runDependency('b', arg).thenReturn(20 + arg)
  else if (val === 'b')
    return 30 + arg
  else
    throw Error('invalid call')
})

compiled('a', 2)
.then(result => {
  result.should.equal(22)
  compiled.results.should.have.property('a', 22)
  compiled.results.should.have.property('b', 32)
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
    return runDependency('b')
  else if (val === 'b')
    return runDependency('a')
})

return compiled('a').catch(err => {
  err.should.have.property('message', 'dependency cycle: a -> b -> a')
})
```
