import Promise from 'bluebird'
import {compile, resolveAll} from './index'

require('source-map-support').install()

var chai = require('chai')
chai.use(require('chai-spies'))
chai.should()

describe('ratsorat', () => {
  it('compile should resolve single dependency', () => {
    const modules = { a: 1, b: 2, c: 3 }
    const compiled = compile(modules, (runDependency, val, arg) => {
      return Promise.resolve(val * arg)
    })

    return compiled('b', 10)
    .then(result => {
      result.should.equal(20)
      compiled.results.should.have.property('b', 20)
    })
  })

  it('compiled function should support a recursive dependency call', () => {
    const modules = { a: 'a', b: 'b', c: 'c' }
    const compiled = compile(modules, (runDependency, val, arg) => {
      if (val === 'a')
        return runDependency('b', arg).thenReturn(20 + arg)
      else if (val === 'b')
        return 30 + arg
      else
        throw Error('invalid call')
    })

    return compiled('a', 2)
    .then(result => {
      result.should.equal(22)
      compiled.results.should.have.property('a', 22)
      compiled.results.should.have.property('b', 32)
    })
  })

  it('compiled function should detect cyclic dependency', () => {
    const modules = { a: 'a', b: 'b' }
    const compiled = compile(modules, (runDependency, val) => {
      if (val === 'a')
        return runDependency('b')
      else if (val === 'b')
        return runDependency('a')
    })

    const handleError = chai.spy(err => {
      err.should.have.property('message', 'dependency cycle: a -> b -> a')
    })

    return compiled('a').catch(handleError).then(() => {
      handleError.should.have.been.called.once
    })
  })
})
