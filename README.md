# gun-level

[![Travis](https://img.shields.io/travis/PsychoLlama/gun-level.svg?style=flat-square)](https://travis-ci.org/PsychoLlama/gun-level)
[![npm](https://img.shields.io/npm/dt/gun-level.svg?style=flat-square)](https://www.npmjs.com/package/gun-level)
[![Gitter](https://img.shields.io/gitter/room/amark/gun.svg?style=flat-square)](https://gitter.im/amark/gun)

LevelDB is awesome. It's awesomer with gun.

This driver let's you use level as your persistence layer for gun.

## usage

To begin, `npm install gun-level` and change `require('gun')` to `require('gun-level')`. Boom, you're done! The rest is optional tweaking to meet your needs. By default, all your gun instances will persist to a folder named `level/` in the same directory as your code. Let's take a look at the ways you can customize gun-level:

- `blaze`
- `path`
- `share`
- `up`
- `down`
- `db`

Passing those options into the `Gun` constructor will modify the behavior of your gun instance.

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

### blaze: `String/Boolean`

When working with the file system, you can "blaze" a path to your resource. If the path doesn't already exist, it will be built recursively. For example, if we wanted to drop our data into a file at `db/chat/messages.json`, we could say `blaze: 'db/chat/messages.json'` and if any part of the path doesn't exist, it will be built.

### path: `String`

If you're not pointing to the file system or want to avoid blazing a path (such is the case with a URL), you can use `path`. Unless you switch blaze on, no files or folders will be created.

### share: `Boolean`

Some implementations (I'm looking at you, levelDown) can't have more than one instance pointing to the same database. By setting the `share` option, you can reuse any instance already open at that path.

> **Note:** you can only share a database if both (or more) parties have opted into sharing.

### up: `Function`

Setting this option allows you to exchange the level interface for another. This is useful when you're running gun-level in the browser through a build step like [webpack](https://github.com/webpack/webpack) or [browserify](https://github.com/substack/node-browserify), and want a level interface that was designed for the browser.

> **Note:** I am actively working to help gun become friendlier to build steps. Right now it's a tad sketchy.

### down: `Function`

This is the most powerful option - it lets you exchange the driver for any API compatible levelDown module. To see why this is amazingly super cool, check out this [list of modules](https://github.com/Level/levelup/wiki/Modules#storage).

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

Now, as fun as json is, it's not terribly impressive. Mongo would be impressive. Here's the code you'd need to write to save into mongo:

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

### db: `Object`

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

If you simply want to share an existing level instance with gun, that's how it's done.

## finishing words

If you're not yet familiar with gun, you can learn more about it on their [wiki page](https://github.com/amark/gun/wiki/JS-API).

That pretty much covers it! If you have any questions or issues, post an issue or submit a pull request. Thanks for checking out gun-level!