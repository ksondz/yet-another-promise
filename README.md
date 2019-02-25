# Yet Another Promise

This class mimics native JavaScript standard built-in Promise object. <br>

Implemented methods: (**then**, **catch**, **finally**, **race**, **all**, **resolve**, **reject**)

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
 