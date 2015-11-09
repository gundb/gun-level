# gun-level

LevelDB is awesome. It's awesomer with gun.

This driver let's you save your gundb data onto Level in just a few lines of code. Really!

## usage

After downloading this driver, `require('gun-level')` in your app and instantiate your instance with these options:

```
var gun = require('gun')({
  level: {
    folder: 'folder-name/'
  }
})
```

And we'll save your data into that folder. If no path is specified, we'll send it into a new folder named `level/`.

As much as I enjoy a good long read, that really is all there is to it. If you find any problems, please submit an issue or a pull request. Feedback is always awesome!
