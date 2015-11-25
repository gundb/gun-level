# gun-level

LevelDB is awesome. It's awesomer with gun.

This driver let's you use level as your persistence layer for gun.

## usage

To begin, `npm install gun-level` and change `require('gun')` to `require('gun-level')`. Boom, you're done! The rest is optional tweaking to meet your needs. By default, all your gun instances will persist to a folder named `level/` in the same directory as your code. Let's take a look at the ways you can modify gun-level:

- `blaze`
- `path`
- `share`
- `up`
- `down`
- `db`

Passing those options into the `Gun` constructor will customize the behavior of your gun instance.

```javascript
var options = {
	blaze: true,
	share: true,
	path: 'localhost',
	up: require('module-up'),
	down: require('module-down'),
	db: customInterface
}
new Gun({ level: options })
```

### blaze

If you're working with the file system, you can "blaze" a path to your folder. If any part of your path doesn't exist, it will create that folder and move forward. It can either be a string or a boolean.

### path

If you're passing a URL, cypher keys or something similar, you can use path. Unless blaze is set to `true`, no path will be created on your file system.

### share

Some implementations (looking at you, levelDown) can't have more than one instance pointing to the same database. By setting the `share` option, you can reuse any instance already open at that path.

> **Note:** you can only share a database if both (or more) parties have opted for sharing.

### up

Setting this option allows you to exchange the level interface for another. This is useful when you're running gun-level in the browser through a build step like [webpack](https://github.com/webpack/webpack) or [browserify](https://github.com/substack/node-browserify), and want a browser compatible level interface.

> **Note:** I am actively working to help gun become friendlier to build steps. Right now it's a tad sketchy.

### down

This is the most powerful option - it lets you exchange the driver for any API compatible levelDown module. To get an idea of why this is amazingly super cool, check out [this list of modules](https://github.com/Level/levelup/wiki/Modules#storage).

Exchanging the backend is remarkably simple:

```javascript
new Gun({
	level: {
		path: 'data.json',
		down: require('jsondown')
	}
})
```

Boom, now your persistence layer is a json file named `data.json`. Give it a shot! You can find jsondown [here](https://github.com/toolness/jsondown).

Now, as fun as json is, it's not really *practical*. Here's the difference between saving to json and saving to mongo:

```javascript
// start your mongo server

new Gun({
	level: {
		path: 'localhost',
		down: require('mongodown')
	}
})
```

Whaaaaaaat? Yeah. It's that cool. If you need more configuration, instead of passing the `require`, we can pass an object:

```javascript
new Gun({
	level: {
		path: 'localhost',
		down: {
			db: require('redisdown'),
			host: 'localhost',
			port: 6379
		}
	}
})
```

This is the configuration object passed to levelup (with defaults under the hood). If you want to override any of level's native settings, that's how it's done.

### db

Skip the middleman entirely. If you're already using a level interface, you can pass it directly to your gun instance.

```javascript
var levelUP = require('levelup')
var level = levelUP('path')

new Gun({
	level: {
		db: level
	}
})
```

If you want to use level in your app and share that instance with gun, this is what you'll use.

## finishing words

That pretty much covers it! If you have any questions or issues, submit an issue or a pull request. Thanks for checking out gun-level!