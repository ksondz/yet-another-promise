# Yet Another Promise

- This class mimics native JavaScript standard built-in Promise object. <br>
- Implemented methods: (**then**, **catch**, **finally**, **race**, **all**, **resolve**, **reject**) <br>
- It is compatible with NodeJS v8.10.0

## Installation

```
$ npm install https://github.com/ksondz/yet-another-promise.git
```

## Run unit tests

```
$ npm run test
```

## Usage Guide

 - Create new promise. 

```js
const Yap = require('yet-another-promise');
const yapPromise = new Yap((resolve, reject) => {
  setTimeout(() => {
        resolve('my yap tes');
      }, 300);
});
```
 