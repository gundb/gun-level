# gun-level

LevelDB is awesome. It's awesomer with gun.

This driver let's you use level as your persistence layer for gun.

## usage

Just `npm install gun-level` and replace `require('gun')` with `require('gun-level')`. Now tell gun you want to save to level by setting the `level` option to true, like so:

```
var Gun = require('gun-level');

var gun = new Gun({
  level: true
})
```

Yay! You're now levelDB compatible! Now by default, your data will be saved into `./level/`. You can change it by providing a path to your folder...

```
new Gun({
  level: {
    folder: 'fabulous/folder/path/'
  }
})
```

Magical. As much as I enjoy a good long read, that really is all there is to it. If you find any problems, go ahead and submit an issue or a pull request.

Thanks for checking out gun-level!
