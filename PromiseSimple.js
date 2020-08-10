class PromiseSimple {
    constructor(executionFunction) {
        // this 指向PromiseSimple的实例对象
        // bind()方法返回一个新函数以PromiseSimple的实例对象作为onResolve和onReject的默认this
        this.promiseChain = [];
        this.handleError = () => { };
        this.onResolve = this.onResolve.bind(this);
        this.onReject = this.onReject.bind(this);
        executionFunction(this.onResolve, this.onReject);
    }
    then(onResolve) {
        this.promiseChain.push(onResolve);
        return this;
    }
    catch(handleError) {
        this.handleError = handleError;
        return this;
    }
    onResolve(value) {
        let storedValue = value;
        try {
            this.promiseChain.forEach((nextFunction) => {
                storedValue = nextFunction(storedValue);
            });
        } catch (error) {
            this.promiseChain = [];
            this.onReject(error);
        }
    }
    onReject(error) {
        this.handleError(error);
    }
    static all(promises) {
        const results = []
        let complete = 0
        return new PromiseSimple(function (resolve, reject) {
            for (let i = 0; i < promises.length; i++) {
                promises[i].then(val => {
                    complete++
                    results[i] = val
                    if (promises.length === complete) {
                        resolve(results);
                    }
                }).catch(e => {
                    reject(e)
                })
            }
        })
    }
}

//example
const p1=new PromiseSimple(function (resolve, reject) {
    console.log('------------');
    setTimeout(() => {
        resolve('p1')
    }, 2000)
})
const p2=new PromiseSimple(function (resolve, reject) {
    setTimeout(() => {
        resolve('p2')
    }, 3000)
})
const p3=new PromiseSimple(function (resolve, reject) {
    setTimeout(() => {
        resolve('p3')
    }, 4000)
})

PromiseSimple.all([p1, p2, p3]).then((val) => {
    console.log('success',val);
}).catch((e) => {
    console.log(e);
})

const p1=new PromiseSimple(function (resolve, reject) {
    console.log('------------');
    setTimeout(() => {
        resolve('p1')
    }, 2000)
})
const p2=new PromiseSimple(function (resolve, reject) {
    setTimeout(() => {
        resolve('p2')
    }, 3000)
})
const p3=new PromiseSimple(function (resolve, reject) {
    setTimeout(() => {
        resolve('p3')
    }, 4000)
})

PromiseSimple.all([p1, p2, p3]).then((val) => {
    console.log('success',val);
}).catch((e) => {
    console.log(e);
})
