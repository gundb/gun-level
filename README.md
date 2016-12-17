# gun-level

[![Travis](https://img.shields.io/travis/PsychoLlama/gun-level/master.svg?style=flat-square)](https://travis-ci.org/PsychoLlama/gun-level/branches)
[![npm](https://img.shields.io/npm/dt/gun-level.svg?style=flat-square)](https://www.npmjs.com/package/gun-level)
[![Gitter](https://img.shields.io/gitter/room/amark/gun.svg?style=flat-square)](https://gitter.im/amark/gun)

LevelDB is awesome. It's awesomer with gun.

## Overview
[GunDB](http://gun.js.org) is a graph database engine with real-time sync and offline-editing. Although gun comes with storage and sync out of the box, it's design is pluggable, so you can still use your favorite storage backend or transport layer by using an adapter.

LevelDB operates on a similar paradigm. It ships with an interface called [`LevelUP`](https://github.com/Level/levelup) that gives all the methods you'd expect from a storage engine (like `get`, `put`, `batch`, etc.) and forwards those to a lower-level database (it uses [`LevelDOWN`](https://github.com/Level/leveldown) by default).

Arguably the most valuable aspect of level is it's **ecosystem**. There are tons are plugins, backends, dashboards, and utilities made specifically for level. It's kinda like a database buffet.

Here, check out [their list of modules!](https://github.com/Level/levelup/wiki/Modules)

> If you're feeling stressed, don't worry. LevelDB comes out of the box as a quite capable database, and if you don't want to dabble with plugins and configs, there's no need.

So what happens when you combine Level with GunDB? You get the power and control of level right alongside the ease of gun.

That's what this library does.

## Usage

To get started, you'll first need to install gun-level.

> If you're unfamiliar with `npm`, you can get started [here](https://docs.npmjs.com/getting-started/what-is-npm)

```sh
$ npm install --save gun-level gun
```

Now require them from your node project.

```javascript
// Imports the `Gun` library
const Gun = require('gun')

// Imported for side effects, adds level adapters.
require('gun-level')
```

Once they're imported you can create a new database interface:

```javascript
const gun = new Gun({
	// We'll put options here in a moment.
})
```

Sweet, you're set up! However, `gun-level` won't do anything unless you pass it a levelDB instance through the constructor. For that, you'll need to download level:

```sh
$ npm install --save levelup leveldown
```

> If you get a build error at this step, replace all examples of `leveldown` with `jsondown`.

```javascript
// Import the two libraries
const levelup = require('levelup')
const leveldown = require('leveldown')

// Create a new level instance which saves
// to the `data/` folder.
const levelDB = levelup('data', {
	db: leveldown,
})
```

Now we pass our new levelDB instance to the `Gun` constructor.

```javascript
const gun = new Gun({
	level: levelDB,
	file: false,
})
```

Done! Now your gun instance is backed up to levelDB.

Let's try a few things...

```javascript
const bob = gun.get('bob').put({ name: 'Bob' })
const dave = gun.get('dave').put({ name: 'Dave' })

// Write a fun circular reference.
bob.path('friend').put(dave)
dave.path('friend').put(bob)

// Print the data!
bob.path('friend.name').val()
bob.path('friend.friend.name').val()
```

That's pretty much all there is to the `gun-level` API. If you're unfamiliar with gun's API, [here's a good reference](https://github.com/amark/gun/wiki/API-%28v0.3.x%29).

## Advanced Levelry
You've seen the basics, but it's not enough. You crave more power.

To exchange backends with level, like Riak, Mongo, IndexedDB, etc., you can find the official list of storage backends [here](https://github.com/Level/levelup/wiki/Modules#storage-back-ends). Usually it's just a matter of passing the module as the `db` option to `levelup`, like so:

```javascript
const levelup = require('levelup')
const mongoDown = require('mongodown')

const levelDB = levelup('localhost', {
	db: mongoDown,
})
```

Even if you're content with the default levelDB setup, I really recommend you scan [this list of plugins](https://github.com/Level/levelup/wiki/Modules). It's inspiring what the community has built.

> `gun-level` will try to read and write values as json. If you're having trouble getting a plugin to work, or keep seeing `"[object Object]"`, make sure it's using the `json` value encoding.

## Getting Support
If you're running into problems, feel free to either post an issue on [GitHub](https://github.com/PsychoLlama/gun-level/issues) or chat with us humans in the [Gitter](http://gitter.im/amark/gun/) channel.

## Installing from Source
Clone the repo and install the dependencies:

```sh
$ git clone https://github.com/PsychoLlama/gun-level.git
$ cd gun-level
$ npm install
```

**Running Tests**
```sh
# In directory `gun-level`
$ npm test
```

**Building**
```sh
$ npm run build
# Compiles to folder `dist/`
```

## Contributors
 - Project owner @PsychoLlama
 - Code contributor @swhgoon
 - The friendly @greenkeeperio-bot

Sponsored by the fabulous people at [GunDB](http://gun.js.org/).
