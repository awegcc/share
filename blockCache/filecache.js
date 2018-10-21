#!/usr/bin/env node

// require node modules
var fs = require("fs");
var path = require("path");
var stream = require("stream");

// require npm modules
var rimraf = require("rimraf");
var mkdirp = require("mkdirp");
var queue = require("queue");
var dur = require("dur");

const DEFAULT_OPTS = {
	dir: 'cache',
	max: false,
	size: false,
	age: false,
	check: false,
	persist: false,
	cluster: false
}

class FileCache {
	constructor(opts = {}) {
		this.opts = Object.assign({}, DEFAULT_OPTS, opts);
		this.filemeta = {};

		// write operations since last save
		this.wrops = 0;
		this.lastwrite = 0;
		this.lastclean = 0;
		this.usedspace = 0;
		this.numfiles = 0;
		this.oldest = Infinity;

		//
		if (this.opts.dir === undefined) {
			if (process.pkg && process.pkg.entrypoint) {
				this.dir = path.join(path.dirname(process.execPath), DEFAULT_OPTS.dir);
			} else {
				this.dir = path.join(process.cwd(), DEFAULT_OPTS.dir);
			}
		} else {
			this.dir = opts.dir;
		}
		if (!fs.existsSync(this.dir)) {
			fs.mkdirSync(this.dir);
		}

		this.logger = this.opts.logger;
		if (!this.logger) {
			this.logger = console;
		}
		// initialize
		this.initMetadata((err) => {
			if (err) {
				this.logger.error("initMetadata error: ", err);
			}
		});

		return this;

	};

	// initialize file cache
	initMetadata(fn) {
		var self = this;

		let files = null;
		try {
			files = fs.readdirSync(self.opts.dir);
		} catch {
			return;
		}

		self.numfiles = files.length;
		files.forEach(function (f) {
			self.filemeta[f.file] = [f.atime, f.size];
			self.usedspace += f.size;
		});

		// check if saved metadata file exists
		if (fs.existsSync(path.resolve(self.opts.dir, ".filecache.json"))) {
			let content = fs.readFileSync(path.resolve(self.opts.dir, ".filecache.json"))

			try {
				var metadata = JSON.parse(content.toString());
			} catch (err) {
				return;
			}

			metadata.forEach(function (record) {
				// set atime to time from metadata cache, if cached atime is greater than fs atime (because fs atime is unreliable)
				if (self.filemeta.hasOwnProperty(record[0]) && self.filemeta[record[0]].atime < record[1]) self.filemeta[record[0]].atime = record[1];
			});

			// determine oldest file if need be
			if (self.opts.age) {
				self.oldest = Infinity;
				Object.keys(self.filemeta).forEach(function (k) { self.oldest = Math.min(self.oldest, self.filemeta[k].atime); });
			}


		};

		// setup cleanup timer
		if (self.opts.check && (self.opts.files || self.opts.size || self.opts.age)) {
			setInterval(() => {
				// execute cleanup if need be
				if (self.opts.files && self.opts.files < self.numfiles) {
					return self.clean();
				}
				if (self.opts.size && self.opts.size < self.usedspace) {
					return self.clean();
				}
				if (self.opts.age && (Date.now() - (self.opts.age + 3600000)) > self.oldest) {
					return self.clean();
				}
				self.logger.debug("noting to cleanup");

			}, self.opts.check).unref();
		}

		// setup metadata save timer
		if (self.opts.persist) {
			setInterval(() => {
				// check if 1000 write operations have happened or last save is older than 5 minutes
				if (self.wrops < 1000 && self.lastwrite + 300000 < Date.now()) return;

				self.save(function (err) {
					self.wrops = 0;
					if (err) {
						self.logger.debug("could not save metadata file");
					}
					if (!err) {
						self.logger.debug("saved metadata file");
					}
				});

			}, self.opts.persist).unref();
		}

		return this;
	};

	// check if a file exists
	check(file, fn) {
		var self = this;
		fs.exists(path.resolve(self.opts.dir, self.sanitize(file)), fn);
		return this;
	};

	// add a file
	add(file, data, fn) {
		var self = this;

		var file = path.resolve(this.opts.dir, self.sanitize(file));

		// if no callback given, create a default callback with error logging
		if (typeof fn !== "function") var fn = function (err) {
			self.logger.debug("[add] error: %s", err);
		};

		// make sure the direcotry exists
		mkdirp(path.dirname(file), function (err) {
			if (err) return fn(err);

			(function (done) {

				if ((data instanceof stream) || (data instanceof stream.Readable) || (data.readable === true)) {

					// pipe stream to file
					data.pipe(fs.createWriteStream(file).on("finish", function () {
						done(null, file);
					}).on("error", function (err) {
						done(err);
					}));

				} else if (data instanceof Buffer) {

					// write buffer to file
					fs.writeFile(file, data, function (err) {
						if (err) return done(err);
						done(null, file);
					});

				} else if (typeof data === "object") {

					// serialize object and write to file
					try {
						fs.writeFile(file, JSON.stringify(data), function (err) {
							if (err) return done(err);
							done(null, file);
						});
					} catch (err) {
						return done(err);
					};

				} else {

					// write to file
					fs.writeFile(file, data, function (err) {
						if (err) return done(err);
						done(null, file);
					});

				};

			})(function (err, file) {
				if (err) {
					return self.logger.debug("error saving file '%s': %s", file, err) || fn(err, file);
				}

				// get stat and add to filemeta
				fs.stat(file, function (err, stats) {
					if (err) {
						return self.logger.debug("error getting stats for file %s: %s", file, err);
					}

					// substract file size if file is known
					if (self.filemeta.hasOwnProperty(file)) {
						self.usedspace -= self.filemeta[file].size;
						self.numfiles--;
					}

					// add file to result
					self.filemeta[file] = { file: file, size: stats.size, atime: Date.now() };

					// update stats
					self.wrops++;
					self.numfiles++;
					self.usedspace += self.filemeta[file].size;
					self.oldest = Math.min(self.oldest, self.filemeta[file].atime);

					fn(null, file);

				});

			});

		});

		return this;
	};

	// remove file from cache
	remove(file, fn) {
		var self = this;

		var file = path.resolve(this.opts.dir, self.sanitize(file));

		fs.exists(file, function (x) {
			if (!x) {
				return self.logger.debug("remove: file '%s' does not exist", file) || fn(null);
			}

			fs.unlink(file, function (err) {
				if (err) {
					return self.logger.debug("remove: could not unlink file '%s': %s", file, err) || fn(err);
				}

				// update filemeta
				self.usedspace -= self.filemeta[file].size;
				self.numfiles--;
				self.wrops++;
				delete self.filemeta[file];

				fn(null);

			});

		});

		return this;
	};

	// update file access time
	touch(file, fn) {
		var self = this;

		var file = path.resolve(this.opts.dir, self.sanitize(file));

		if (!self.filemeta.hasOwnProperty(file)) return fn(null);
		self.filemeta[file].atime = Date.now();
		fn(null);

		return this;
	};


	// get a file as stream
	stream(file, fn) {
		var self = this;
		var file = path.resolve(this.opts.dir, self.sanitize(file));

		if (typeof fn === "function") {
			fs.exists(file, function (x) {
				if (!x) {
					return self.logger.debug("stream: file '%s' does not exist") || fn(new Error("file does not exists"));
				}
				fn(null, fs.createReadStream(file));
			});
			return this;
		} else {
			return fs.createReadStream(file);
		}
	};

	// empty the file store
	purge(fn) {
		var self = this;

		// optionalize callback
		if (typeof fn !== "function") var fn = function (err) { };

		rimraf(self.opts.dir, function (err) {
			if (err) {
				return self.logger.debug("error purging directory '%s': %s", self.opts.dir, err) || fn(err);
			}
			self.logger.debug("purged directory '%s'", self.opts.dir);

			// metadata
			self.filemeta = {};
			self.wrops = 0;
			self.lastwrite = 0;
			self.lastclean = 0;
			self.usedspace = 0;
			self.numfiles = 0;
			self.oldest = Infinity;

			fn(null);
		});
	};

	// cleanup files
	clean(fn) {
		var self = this;

		// optionalize callback
		if (typeof fn !== "function") var fn = function (err, num) {
			if (err) {
				return self.logger.debug("cleanup error: %s", err);
			}
			self.logger.debug("cleanup: %d files thrown away", num);
		};

		// 
		var files = [];
		var remove = [];
		var size = 0;
		var rems = 0;

		// collect files
		var minatime = (Date.now() - self.opts.age);
		Object.keys(self.filemeta).forEach(function (k) {

			// check for age violation
			if (self.opts.age && minatime > self.filemeta[k].atime) {
				rems += self.filemeta[k].size;
				remove.push(self.filemeta[k]);
			} else {
				size += self.filemeta[k].size;
				files.push(self.filemeta[k]);
			}

		});

		// sort by atime
		files = files.sort(function (a, b) {
			return a.atime - b.atime; // FIXME: is this sort right?
		});

		// check for filecount violation
		if (self.opts.files) while (files.length > self.opts.files) {
			size -= files[0].size;
			rems += files[0].size;
			remove.push(files.shift());
		};

		// check for filesize violations
		if (self.opts.size) while (self.opts.size < size) {
			size -= files[0].size;
			rems += files[0].size;
			remove.push(files.shift());
		};

		// check if there are removable files
		if (remove.length === 0) return fn(null);

		// remove files
		var remove_files = remove.filter(function (v) { return v.file; });

		self.unlink(remove_files, function (err, failed) {
			if (err) return fn(err);
			if (failed.length > 0) {
				debug("cleanup: failed to remove %d files");
				failed.forEach(function (f) {
					// readd to files
					files.push(self.filemeta[k]);
					size += self.filemeta[k].size;
					rems -= self.filemeta[k].size;
				});
			}

			// show stats
			self.logger.debug("cleanup: removed %d files, freed %s of space", (remove_files.length - failed.length), self.rfilesize(rems));

			// set filemeta and stats, find oldest
			self.filemeta = {};
			var oldest = Infinity;
			files.forEach(function (f) {
				self.filemeta[f.file] = f;
				oldest = Math.min(oldest, f.atime);
			});
			self.lastclean = Date.now();
			self.usedspace = size;
			self.numfiles = files.length;
			self.oldest = oldest;

			// save filemeta
			self.save(fn);

		});

		return this;
	};

	// save file meta
	save(fn) {
		var self = this;

		// check if persistance file should be used
		if (!self.opts.persist) return fn(null);

		// if cluster, call save callback
		self.logger.log("save callback?");
		if (self.opts.cluster && (typeof self.opts.onsave === "function")) {
			self.logger.console.log("save callback!");
			self.opts.onsave();
		}

		// save file meta
		fs.writeFile(path.resolve(self.opts.dir, ".filecache.json"), JSON.stringify(self.filemeta), function (err) {
			self.lastwrite = Date.now();
			if (err) {
				return debug("save: error daving .filecache.json: %s", err) || fn(err);
			}
			self.logger.debug("saved .filecache.json");
			fn(null);
		});

		return this;
	};

	// make filename parameter safe
	sanitize(f) {
		return path.normalize(f).replace(/^\//, '');
	};

	// make human readable filesize with decimal prefixes
	rfilesize(n) {
		n = parseInt(n, 10);
		if (isNaN(n)) return "Invalid size";
		if (n < 1000) return (n).toFixed(0) + "B";
		if (n < 1000000) return (n / 1000).toFixed(2) + "KB";
		if (n < 1000000000) return (n / 1000000).toFixed(2) + "MB";
		if (n < 1000000000000) return (n / 1000000000).toFixed(2) + "GB";
		if (n < 1000000000000000) return (n / 1000000000000).toFixed(2) + "TB";
		return (n / 1000000000000000).toFixed(2) + "PB";
	};

	// read a directory recursively and call back some stats
	readdir(p, fn) {
		var self = this;
		var result = [];

		fs.readdir(p, function (err, files) {
			if (err) {
				return self.logger.debug("error reading dir '%s': %s", p, err) || fn(err, result);
			}
			if (files.length === 0) return fn(null, result)

			var q = queue();

			files.forEach(function (f) {
				var fp = path.join(p, f);
				q.push(function (next) {

					fs.stat(fp, function (err, stats) {
						if (err) return next(err);

						// add directory to queue
						if (stats.isDirectory()) q.push(function (done) {
							self.readdir(fp, function (err, res) {
								result = result.concat(res);
								done(err);
							});
						});

						// add file to result
						if (stats.isFile()) {
							result.push({ file: fp, size: stats.size, atime: stats.atime.getTime() });
						}
						next(null);
					});
				});
			});

			// run queue
			q.start(function (err) {
				return fn(err || null, result);
			});

		});
	};

	// unlink an array of files
	unlink(files, fn) {
		var self = this;

		// ensure files is an array of strings
		var files = ((files instanceof Array) ? files : [files]).filter(function (file) { return (typeof file === "string" && file !== ""); });

		// keep failed files
		var failed = [];

		// check if there is nothing to do
		if (files.length === 0) {
			return fn(null, failed);
		}

		// create queue
		var q = queue({ concurrency: 5 });

		// push delete action to queue
		files.forEach(function (file) {
			q.push(function (next) {
				fs.unlink(file, function (err) {
					if (err) {
						self.logger.debug("error unlinking file '%s': %s", file, err) || failed.push(file);
					}
					next();
				});
			});
		});

		// run queue
		q.start(function () {
			self.logger.debug("unlinked %d of %d files", (files.length + failed.length), files.length);
			return fn(null, failed);
		});

		return this;
	};

	// handle cluster messages
	handle(message) {
		var self = this;
		if (!self.opts.cluster) {
			return this;
		}

		switch (message.action) {
			case "add":
				// add item to cache
				if (self.filemeta.hasOwnProperty(message.file)) {
					self.filemeta[message.file].atime = Date.now();
				} else {
					self.filemeta[message.file] = message.data;
					self.usedspace += self.filemeta[message.file].size;
					self.numfiles++;
					self.wrops++;
				}
				break;
			case "touch":
				// update atime in cache
				self.filemeta[message.file].atime = Date.now();
				break;
			case "remove":
				// update stats and remove item from cache
				self.usedspace -= self.filemeta[message.file].size;
				self.numfiles--;
				self.wrops++;
				delete self.filemeta[message.file];
				break;
			case "save":
				// reset save timer
				self.lastwrite = Date.now();
				break;
		}

		return this;
	}

}

// export
module.exports = FileCache;