'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

require('colors');

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _db = require('./db');

var _db2 = _interopRequireDefault(_db);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MigrationModel = void 0;

_bluebird2.default.config({
  warnings: false
});

var es6Template = '\n/**\n * Make any changes you need to make to the database here\n */\nexport async function up () {\n  // Write migration here\n}\n\n/**\n * Make any changes that UNDO the up function side effects here (if possible)\n */\nexport async function down () {\n  // Write migration here\n}\n';

var es5Template = '\'use strict\';\n\n/**\n * Make any changes you need to make to the database here\n */\nexports.up = function up (done) {\n  done();\n};\n\n/**\n * Make any changes that UNDO the up function side effects here (if possible)\n */\nexports.down = function down(done) {\n  done();\n};\n';

var Migrator = function () {
  function Migrator(_ref) {
    var templatePath = _ref.templatePath,
        _ref$migrationsPath = _ref.migrationsPath,
        migrationsPath = _ref$migrationsPath === undefined ? './migrations' : _ref$migrationsPath,
        dbConnectionUri = _ref.dbConnectionUri,
        _ref$es6Templates = _ref.es6Templates,
        es6Templates = _ref$es6Templates === undefined ? false : _ref$es6Templates,
        _ref$collectionName = _ref.collectionName,
        collectionName = _ref$collectionName === undefined ? 'migrations' : _ref$collectionName,
        _ref$autosync = _ref.autosync,
        autosync = _ref$autosync === undefined ? false : _ref$autosync,
        _ref$cli = _ref.cli,
        cli = _ref$cli === undefined ? false : _ref$cli;
    (0, _classCallCheck3.default)(this, Migrator);

    var defaultTemplate = es6Templates ? es6Template : es5Template;
    this.template = templatePath ? _fs2.default.readFileSync(templatePath, 'utf-8') : defaultTemplate;
    this.migrationPath = _path2.default.resolve(migrationsPath);
    this.connection = _mongoose2.default.createConnection(dbConnectionUri);
    this.es6 = es6Templates;
    this.collection = collectionName;
    this.autosync = autosync;
    this.cli = cli;
    MigrationModel = (0, _db2.default)(collectionName, this.connection);
  }

  (0, _createClass3.default)(Migrator, [{
    key: 'log',
    value: function log(logString) {
      var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (force || this.cli) {
        console.log(logString);
      }
    }
  }, {
    key: 'close',
    value: function close() {
      return this.connection ? this.connection.close() : null;
    }
  }, {
    key: 'create',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(migrationName) {
        var existingMigration, now, newMigrationFile, migrationCreated;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return MigrationModel.findOne({ name: migrationName });

              case 3:
                existingMigration = _context.sent;

                if (!existingMigration) {
                  _context.next = 6;
                  break;
                }

                throw new Error(('There is already a migration with name \'' + migrationName + '\' in the database').red);

              case 6:
                _context.next = 8;
                return this.sync();

              case 8:
                now = Date.now();
                newMigrationFile = now + '-' + migrationName + '.js';

                _mkdirp2.default.sync(this.migrationPath);
                _fs2.default.writeFileSync(_path2.default.join(this.migrationPath, newMigrationFile), this.template);
                // create instance in db
                _context.next = 14;
                return this.connection;

              case 14:
                _context.next = 16;
                return MigrationModel.create({
                  name: migrationName,
                  createdAt: now
                });

              case 16:
                migrationCreated = _context.sent;

                this.log('Created migration ' + migrationName + ' in ' + this.migrationPath + '.');
                return _context.abrupt('return', migrationCreated);

              case 21:
                _context.prev = 21;
                _context.t0 = _context['catch'](0);

                this.log(_context.t0.stack);
                fileRequired(_context.t0);

              case 25:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 21]]);
      }));

      function create(_x2) {
        return _ref2.apply(this, arguments);
      }

      return create;
    }()

    /**
     * Runs migrations up to or down to a given migration name
     *
     * @param migrationName
     * @param direction
     */

  }, {
    key: 'run',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
        var _this = this;

        var direction = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'up';
        var migrationName = arguments[1];

        var untilMigration, query, sortDirection, migrationsToRun, self, numMigrationsRan, migrationsRan, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _loop, _iterator, _step;

        return _regenerator2.default.wrap(function _callee2$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.sync();

              case 2:
                if (!migrationName) {
                  _context3.next = 8;
                  break;
                }

                _context3.next = 5;
                return MigrationModel.findOne({ name: migrationName });

              case 5:
                _context3.t0 = _context3.sent;
                _context3.next = 11;
                break;

              case 8:
                _context3.next = 10;
                return MigrationModel.findOne().sort({ createdAt: -1 });

              case 10:
                _context3.t0 = _context3.sent;

              case 11:
                untilMigration = _context3.t0;

                if (untilMigration) {
                  _context3.next = 18;
                  break;
                }

                if (!migrationName) {
                  _context3.next = 17;
                  break;
                }

                throw new ReferenceError("Could not find that migration in the database");

              case 17:
                throw new Error("There are no pending migrations.");

              case 18:
                query = {
                  createdAt: { $lte: untilMigration.createdAt },
                  state: 'down'
                };


                if (direction == 'down') {
                  query = {
                    createdAt: { $gte: untilMigration.createdAt },
                    state: 'up'
                  };
                }

                sortDirection = direction == 'up' ? 1 : -1;
                _context3.next = 23;
                return MigrationModel.find(query).sort({ createdAt: sortDirection });

              case 23:
                migrationsToRun = _context3.sent;

                if (migrationsToRun.length) {
                  _context3.next = 31;
                  break;
                }

                if (!this.cli) {
                  _context3.next = 30;
                  break;
                }

                this.log('There are no migrations to run'.yellow);
                this.log('Current Migrations\' Statuses: ');
                _context3.next = 30;
                return this.list();

              case 30:
                throw new Error('There are no migrations to run');

              case 31:
                self = this;
                numMigrationsRan = 0;
                migrationsRan = [];
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context3.prev = 37;
                _loop = _regenerator2.default.mark(function _loop() {
                  var migration, migrationFilePath, modulesPath, code, migrationFunctions;
                  return _regenerator2.default.wrap(function _loop$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          migration = _step.value;
                          migrationFilePath = _path2.default.join(self.migrationPath, migration.filename);
                          modulesPath = _path2.default.resolve(__dirname, '../', 'node_modules');
                          code = _fs2.default.readFileSync(migrationFilePath);

                          if (_this.es6) {
                            require('babel-register')({
                              "presets": [require("babel-preset-latest")],
                              "plugins": [require("babel-plugin-transform-runtime")]
                            });

                            require('babel-polyfill');
                          }

                          migrationFunctions = void 0;
                          _context2.prev = 6;

                          migrationFunctions = require(migrationFilePath);
                          _context2.next = 14;
                          break;

                        case 10:
                          _context2.prev = 10;
                          _context2.t0 = _context2['catch'](6);

                          _context2.t0.message = _context2.t0.message && /Unexpected token/.test(_context2.t0.message) ? 'Unexpected Token when parsing migration. If you are using an ES6 migration file, use option --es6' : _context2.t0.message;
                          throw _context2.t0;

                        case 14:
                          if (migrationFunctions[direction]) {
                            _context2.next = 16;
                            break;
                          }

                          throw new Error(('The ' + direction + ' export is not defined in ' + migration.filename + '.').red);

                        case 16:
                          _context2.prev = 16;
                          _context2.next = 19;
                          return new _bluebird2.default(function (resolve, reject) {
                            var callPromise = migrationFunctions[direction].call(_this.connection.model.bind(_this.connection), function callback(err) {
                              if (err) return reject(err);
                              resolve();
                            });

                            if (callPromise && typeof callPromise.then === 'function') {
                              callPromise.then(resolve).catch(reject);
                            }
                          });

                        case 19:

                          _this.log((direction.toUpperCase() + ':   ')[direction == 'up' ? 'green' : 'red'] + (' ' + migration.filename + ' '));

                          _context2.next = 22;
                          return MigrationModel.where({ name: migration.name }).update({ $set: { state: direction } });

                        case 22:
                          migrationsRan.push(migration.toJSON());
                          numMigrationsRan++;
                          _context2.next = 31;
                          break;

                        case 26:
                          _context2.prev = 26;
                          _context2.t1 = _context2['catch'](16);

                          _this.log(('Failed to run migration ' + migration.name + ' due to an error.').red);
                          _this.log('Not continuing. Make sure your data is in consistent state'.red);
                          throw _context2.t1 instanceof Error ? _context2.t1 : new Error(_context2.t1);

                        case 31:
                        case 'end':
                          return _context2.stop();
                      }
                    }
                  }, _loop, _this, [[6, 10], [16, 26]]);
                });
                _iterator = (0, _getIterator3.default)(migrationsToRun);

              case 40:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context3.next = 45;
                  break;
                }

                return _context3.delegateYield(_loop(), 't1', 42);

              case 42:
                _iteratorNormalCompletion = true;
                _context3.next = 40;
                break;

              case 45:
                _context3.next = 51;
                break;

              case 47:
                _context3.prev = 47;
                _context3.t2 = _context3['catch'](37);
                _didIteratorError = true;
                _iteratorError = _context3.t2;

              case 51:
                _context3.prev = 51;
                _context3.prev = 52;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 54:
                _context3.prev = 54;

                if (!_didIteratorError) {
                  _context3.next = 57;
                  break;
                }

                throw _iteratorError;

              case 57:
                return _context3.finish(54);

              case 58:
                return _context3.finish(51);

              case 59:

                if (migrationsToRun.length == numMigrationsRan) this.log('All migrations finished successfully.'.green);
                return _context3.abrupt('return', migrationsRan);

              case 61:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee2, this, [[37, 47, 51, 59], [52,, 54, 58]]);
      }));

      function run() {
        return _ref3.apply(this, arguments);
      }

      return run;
    }()

    /**
     * Looks at the file system migrations and imports any migrations that are
     * on the file system but missing in the database into the database
     *
     * This functionality is opposite of prune()
     */

  }, {
    key: 'sync',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
        var _this2 = this;

        var filesInMigrationFolder, migrationsInDatabase, migrationsInFolder, filesNotInDb, migrationsToImport, answers;
        return _regenerator2.default.wrap(function _callee3$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.prev = 0;
                filesInMigrationFolder = _fs2.default.readdirSync(this.migrationPath);
                _context4.next = 4;
                return MigrationModel.find({});

              case 4:
                migrationsInDatabase = _context4.sent;

                // Go over migrations in folder and delete any files not in DB
                migrationsInFolder = _lodash2.default.filter(filesInMigrationFolder, function (file) {
                  return (/\d{13,}\-.+.js$/.test(file)
                  );
                }).map(function (filename) {
                  var fileCreatedAt = parseInt(filename.split('-')[0]);
                  var existsInDatabase = migrationsInDatabase.some(function (m) {
                    return filename == m.createdAt.getTime() + '-' + m.name + '.js';
                  });
                  return { createdAt: fileCreatedAt, filename: filename, existsInDatabase: existsInDatabase };
                });
                filesNotInDb = _lodash2.default.filter(migrationsInFolder, { existsInDatabase: false }).map(function (f) {
                  return f.filename;
                });
                migrationsToImport = filesNotInDb;

                this.log('Synchronizing database with file system migrations...');

                if (!(!this.autosync && migrationsToImport.length)) {
                  _context4.next = 14;
                  break;
                }

                _context4.next = 12;
                return new _bluebird2.default(function (resolve) {
                  _inquirer2.default.prompt({
                    type: 'checkbox',
                    message: 'The following migrations exist in the migrations folder but not in the database. Select the ones you want to import into the database',
                    name: 'migrationsToImport',
                    choices: filesNotInDb
                  }, function (answers) {
                    resolve(answers);
                  });
                });

              case 12:
                answers = _context4.sent;


                migrationsToImport = answers.migrationsToImport;

              case 14:
                return _context4.abrupt('return', _bluebird2.default.map(migrationsToImport, function (migrationToImport) {
                  var filePath = _path2.default.join(_this2.migrationPath, migrationToImport),
                      timestampSeparatorIndex = migrationToImport.indexOf('-'),
                      timestamp = migrationToImport.slice(0, timestampSeparatorIndex),
                      migrationName = migrationToImport.slice(timestampSeparatorIndex + 1, migrationToImport.lastIndexOf('.'));

                  _this2.log('Adding migration ' + filePath + ' into database from file system. State is ' + 'DOWN'.red);
                  return MigrationModel.create({
                    name: migrationName,
                    createdAt: timestamp
                  }).then(function (createdMigration) {
                    return createdMigration.toJSON();
                  });
                }));

              case 17:
                _context4.prev = 17;
                _context4.t0 = _context4['catch'](0);

                this.log('Could not synchronise migrations in the migrations folder up to the database.'.red);
                throw _context4.t0;

              case 21:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee3, this, [[0, 17]]);
      }));

      function sync() {
        return _ref4.apply(this, arguments);
      }

      return sync;
    }()

    /**
     * Opposite of sync().
     * Removes files in migration directory which don't exist in database.
     */

  }, {
    key: 'prune',
    value: function () {
      var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
        var filesInMigrationFolder, migrationsInDatabase, migrationsInFolder, dbMigrationsNotOnFs, migrationsToDelete, answers, migrationsToDeleteDocs;
        return _regenerator2.default.wrap(function _callee4$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.prev = 0;
                filesInMigrationFolder = _fs2.default.readdirSync(this.migrationPath);
                _context5.next = 4;
                return MigrationModel.find({}).lean();

              case 4:
                migrationsInDatabase = _context5.sent;

                // Go over migrations in folder and delete any files not in DB
                migrationsInFolder = _lodash2.default.filter(filesInMigrationFolder, function (file) {
                  return (/\d{13,}\-.+.js/.test(file)
                  );
                }).map(function (filename) {
                  var fileCreatedAt = parseInt(filename.split('-')[0]);
                  var existsInDatabase = !!_lodash2.default.find(migrationsInDatabase, { createdAt: new Date(fileCreatedAt) });
                  return { createdAt: fileCreatedAt, filename: filename, existsInDatabase: existsInDatabase };
                });
                dbMigrationsNotOnFs = _lodash2.default.filter(migrationsInDatabase, function (m) {
                  return !_lodash2.default.find(migrationsInFolder, { filename: m.filename });
                });
                migrationsToDelete = dbMigrationsNotOnFs.map(function (m) {
                  return m.name;
                });

                if (!(!this.autosync && !!migrationsToDelete.length)) {
                  _context5.next = 13;
                  break;
                }

                _context5.next = 11;
                return new _bluebird2.default(function (resolve) {
                  _inquirer2.default.prompt({
                    type: 'checkbox',
                    message: 'The following migrations exist in the database but not in the migrations folder. Select the ones you want to remove from the file system.',
                    name: 'migrationsToDelete',
                    choices: migrationsToDelete
                  }, function (answers) {
                    resolve(answers);
                  });
                });

              case 11:
                answers = _context5.sent;


                migrationsToDelete = answers.migrationsToDelete;

              case 13:
                _context5.next = 15;
                return MigrationModel.find({
                  name: { $in: migrationsToDelete }
                }).lean();

              case 15:
                migrationsToDeleteDocs = _context5.sent;

                if (!migrationsToDelete.length) {
                  _context5.next = 20;
                  break;
                }

                this.log('Removing migration(s) ', ('' + migrationsToDelete.join(', ')).cyan, ' from database');
                _context5.next = 20;
                return MigrationModel.remove({
                  name: { $in: migrationsToDelete }
                });

              case 20:
                return _context5.abrupt('return', migrationsToDeleteDocs);

              case 23:
                _context5.prev = 23;
                _context5.t0 = _context5['catch'](0);

                this.log('Could not prune extraneous migrations from database.'.red);
                throw _context5.t0;

              case 27:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee4, this, [[0, 23]]);
      }));

      function prune() {
        return _ref5.apply(this, arguments);
      }

      return prune;
    }()

    /**
     * Lists the current migrations and their statuses
     * @returns {Promise<Array<Object>>}
     * @example
     *   [
     *    { name: 'my-migration', filename: '149213223424_my-migration.js', state: 'up' },
     *    { name: 'add-cows', filename: '149213223453_add-cows.js', state: 'down' }
     *   ]
     */

  }, {
    key: 'list',
    value: function () {
      var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
        var _this3 = this;

        var migrations;
        return _regenerator2.default.wrap(function _callee5$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return this.sync();

              case 2:
                _context6.next = 4;
                return MigrationModel.find().sort({ createdAt: 1 });

              case 4:
                migrations = _context6.sent;

                if (!migrations.length) this.log('There are no migrations to list.'.yellow);
                return _context6.abrupt('return', migrations.map(function (m) {
                  _this3.log(('' + (m.state == 'up' ? 'UP:  \t' : 'DOWN:\t'))[m.state == 'up' ? 'green' : 'red'] + (' ' + m.filename));
                  return m.toJSON();
                }));

              case 7:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee5, this);
      }));

      function list() {
        return _ref6.apply(this, arguments);
      }

      return list;
    }()
  }]);
  return Migrator;
}();

exports.default = Migrator;


function fileRequired(error) {
  if (error && error.code == 'ENOENT') {
    throw new ReferenceError('Could not find any files at path \'' + error.path + '\'');
  }
}

module.exports = Migrator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9saWIuanMiXSwibmFtZXMiOlsiTWlncmF0aW9uTW9kZWwiLCJjb25maWciLCJ3YXJuaW5ncyIsImVzNlRlbXBsYXRlIiwiZXM1VGVtcGxhdGUiLCJNaWdyYXRvciIsInRlbXBsYXRlUGF0aCIsIm1pZ3JhdGlvbnNQYXRoIiwiZGJDb25uZWN0aW9uVXJpIiwiZXM2VGVtcGxhdGVzIiwiY29sbGVjdGlvbk5hbWUiLCJhdXRvc3luYyIsImNsaSIsImRlZmF1bHRUZW1wbGF0ZSIsInRlbXBsYXRlIiwicmVhZEZpbGVTeW5jIiwibWlncmF0aW9uUGF0aCIsInJlc29sdmUiLCJjb25uZWN0aW9uIiwiY3JlYXRlQ29ubmVjdGlvbiIsImVzNiIsImNvbGxlY3Rpb24iLCJsb2dTdHJpbmciLCJmb3JjZSIsImNvbnNvbGUiLCJsb2ciLCJjbG9zZSIsIm1pZ3JhdGlvbk5hbWUiLCJmaW5kT25lIiwibmFtZSIsImV4aXN0aW5nTWlncmF0aW9uIiwiRXJyb3IiLCJyZWQiLCJzeW5jIiwibm93IiwiRGF0ZSIsIm5ld01pZ3JhdGlvbkZpbGUiLCJ3cml0ZUZpbGVTeW5jIiwiam9pbiIsImNyZWF0ZSIsImNyZWF0ZWRBdCIsIm1pZ3JhdGlvbkNyZWF0ZWQiLCJzdGFjayIsImZpbGVSZXF1aXJlZCIsImRpcmVjdGlvbiIsInNvcnQiLCJ1bnRpbE1pZ3JhdGlvbiIsIlJlZmVyZW5jZUVycm9yIiwicXVlcnkiLCIkbHRlIiwic3RhdGUiLCIkZ3RlIiwic29ydERpcmVjdGlvbiIsImZpbmQiLCJtaWdyYXRpb25zVG9SdW4iLCJsZW5ndGgiLCJ5ZWxsb3ciLCJsaXN0Iiwic2VsZiIsIm51bU1pZ3JhdGlvbnNSYW4iLCJtaWdyYXRpb25zUmFuIiwibWlncmF0aW9uIiwibWlncmF0aW9uRmlsZVBhdGgiLCJmaWxlbmFtZSIsIm1vZHVsZXNQYXRoIiwiX19kaXJuYW1lIiwiY29kZSIsInJlcXVpcmUiLCJtaWdyYXRpb25GdW5jdGlvbnMiLCJtZXNzYWdlIiwidGVzdCIsInJlamVjdCIsImNhbGxQcm9taXNlIiwiY2FsbCIsIm1vZGVsIiwiYmluZCIsImNhbGxiYWNrIiwiZXJyIiwidGhlbiIsImNhdGNoIiwidG9VcHBlckNhc2UiLCJ3aGVyZSIsInVwZGF0ZSIsIiRzZXQiLCJwdXNoIiwidG9KU09OIiwiZ3JlZW4iLCJmaWxlc0luTWlncmF0aW9uRm9sZGVyIiwicmVhZGRpclN5bmMiLCJtaWdyYXRpb25zSW5EYXRhYmFzZSIsIm1pZ3JhdGlvbnNJbkZvbGRlciIsImZpbHRlciIsImZpbGUiLCJtYXAiLCJmaWxlQ3JlYXRlZEF0IiwicGFyc2VJbnQiLCJzcGxpdCIsImV4aXN0c0luRGF0YWJhc2UiLCJzb21lIiwibSIsImdldFRpbWUiLCJmaWxlc05vdEluRGIiLCJmIiwibWlncmF0aW9uc1RvSW1wb3J0IiwicHJvbXB0IiwidHlwZSIsImNob2ljZXMiLCJhbnN3ZXJzIiwibWlncmF0aW9uVG9JbXBvcnQiLCJmaWxlUGF0aCIsInRpbWVzdGFtcFNlcGFyYXRvckluZGV4IiwiaW5kZXhPZiIsInRpbWVzdGFtcCIsInNsaWNlIiwibGFzdEluZGV4T2YiLCJjcmVhdGVkTWlncmF0aW9uIiwibGVhbiIsImRiTWlncmF0aW9uc05vdE9uRnMiLCJtaWdyYXRpb25zVG9EZWxldGUiLCIkaW4iLCJtaWdyYXRpb25zVG9EZWxldGVEb2NzIiwiY3lhbiIsInJlbW92ZSIsIm1pZ3JhdGlvbnMiLCJlcnJvciIsInBhdGgiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBRUE7Ozs7OztBQUNBLElBQUlBLHVCQUFKOztBQUVBLG1CQUFRQyxNQUFSLENBQWU7QUFDYkMsWUFBVTtBQURHLENBQWY7O0FBSUEsSUFBTUMsOFNBQU47O0FBaUJBLElBQU1DLDBTQUFOOztJQW1CcUJDLFE7QUFDbkIsMEJBUUc7QUFBQSxRQVBEQyxZ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LENBQWUsVUFBQ00sQ0FBRCxFQUFPO0FBQzNCLHlCQUFLMUUsR0FBTCxDQUNFLE9BQUcwRSxFQUFFakQsS0FBRixJQUFXLElBQVgsR0FBa0IsU0FBbEIsR0FBOEIsU0FBakMsR0FBNkNpRCxFQUFFakQsS0FBRixJQUFXLElBQVgsR0FBaUIsT0FBakIsR0FBMkIsS0FBeEUsV0FDSWlELEVBQUVwQyxRQUROLENBREY7QUFJQSx5QkFBT29DLEVBQUVkLE1BQUYsRUFBUDtBQUNELGlCQU5NLEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2tCQWhTVWhGLFE7OztBQTRTckIsU0FBU3NDLFlBQVQsQ0FBc0JpRixLQUF0QixFQUE2QjtBQUMzQixNQUFJQSxTQUFTQSxNQUFNMUQsSUFBTixJQUFjLFFBQTNCLEVBQXFDO0FBQ25DLFVBQU0sSUFBSW5CLGNBQUoseUNBQXdENkUsTUFBTUMsSUFBOUQsUUFBTjtBQUNEO0FBQ0Y7O0FBR0RDLE9BQU9DLE9BQVAsR0FBaUIxSCxRQUFqQiIsImZpbGUiOiJsaWIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgbWtkaXJwIGZyb20gJ21rZGlycCc7XG5pbXBvcnQgUHJvbWlzZSBmcm9tICdibHVlYmlyZCc7XG5pbXBvcnQgJ2NvbG9ycyc7XG5pbXBvcnQgbW9uZ29vc2UgZnJvbSAnbW9uZ29vc2UnO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBhc2sgZnJvbSAnaW5xdWlyZXInO1xuXG5pbXBvcnQgTWlncmF0aW9uTW9kZWxGYWN0b3J5IGZyb20gJy4vZGInO1xubGV0IE1pZ3JhdGlvbk1vZGVsO1xuXG5Qcm9taXNlLmNvbmZpZyh7XG4gIHdhcm5pbmdzOiBmYWxzZVxufSk7XG5cbmNvbnN0IGVzNlRlbXBsYXRlID1cbmBcbi8qKlxuICogTWFrZSBhbnkgY2hhbmdlcyB5b3UgbmVlZCB0byBtYWtlIHRvIHRoZSBkYXRhYmFzZSBoZXJlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cCAoKSB7XG4gIC8vIFdyaXRlIG1pZ3JhdGlvbiBoZXJlXG59XG5cbi8qKlxuICogTWFrZSBhbnkgY2hhbmdlcyB0aGF0IFVORE8gdGhlIHVwIGZ1bmN0aW9uIHNpZGUgZWZmZWN0cyBoZXJlIChpZiBwb3NzaWJsZSlcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRvd24gKCkge1xuICAvLyBXcml0ZSBtaWdyYXRpb24gaGVyZVxufVxuYDtcblxuY29uc3QgZXM1VGVtcGxhdGUgPVxuYCd1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBNYWtlIGFueSBjaGFuZ2VzIHlvdSBuZWVkIHRvIG1ha2UgdG8gdGhlIGRhdGFiYXNlIGhlcmVcbiAqL1xuZXhwb3J0cy51cCA9IGZ1bmN0aW9uIHVwIChkb25lKSB7XG4gIGRvbmUoKTtcbn07XG5cbi8qKlxuICogTWFrZSBhbnkgY2hhbmdlcyB0aGF0IFVORE8gdGhlIHVwIGZ1bmN0aW9uIHNpZGUgZWZmZWN0cyBoZXJlIChpZiBwb3NzaWJsZSlcbiAqL1xuZXhwb3J0cy5kb3duID0gZnVuY3Rpb24gZG93bihkb25lKSB7XG4gIGRvbmUoKTtcbn07XG5gO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1pZ3JhdG9yIHtcbiAgY29uc3RydWN0b3Ioe1xuICAgIHRlbXBsYXRlUGF0aCxcbiAgICBtaWdyYXRpb25zUGF0aCA9ICcuL21pZ3JhdGlvbnMnLFxuICAgIGRiQ29ubmVjdGlvblVyaSxcbiAgICBlczZUZW1wbGF0ZXMgPSBmYWxzZSxcbiAgICBjb2xsZWN0aW9uTmFtZSA9ICdtaWdyYXRpb25zJyxcbiAgICBhdXRvc3luYyA9IGZhbHNlLFxuICAgIGNsaSA9IGZhbHNlXG4gIH0pIHtcbiAgICBjb25zdCBkZWZhdWx0VGVtcGxhdGUgPSBlczZUZW1wbGF0ZXMgPyAgZXM2VGVtcGxhdGUgOiBlczVUZW1wbGF0ZTtcbiAgICB0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGVQYXRoID8gZnMucmVhZEZpbGVTeW5jKHRlbXBsYXRlUGF0aCwgJ3V0Zi04JykgOiBkZWZhdWx0VGVtcGxhdGU7XG4gICAgdGhpcy5taWdyYXRpb25QYXRoID0gcGF0aC5yZXNvbHZlKG1pZ3JhdGlvbnNQYXRoKTtcbiAgICB0aGlzLmNvbm5lY3Rpb24gPSBtb25nb29zZS5jcmVhdGVDb25uZWN0aW9uKGRiQ29ubmVjdGlvblVyaSk7XG4gICAgdGhpcy5lczYgPSBlczZUZW1wbGF0ZXM7XG4gICAgdGhpcy5jb2xsZWN0aW9uID0gY29sbGVjdGlvbk5hbWU7XG4gICAgdGhpcy5hdXRvc3luYyA9IGF1dG9zeW5jO1xuICAgIHRoaXMuY2xpID0gY2xpO1xuICAgIE1pZ3JhdGlvbk1vZGVsID0gTWlncmF0aW9uTW9kZWxGYWN0b3J5KGNvbGxlY3Rpb25OYW1lLCB0aGlzLmNvbm5lY3Rpb24pO1xuICB9XG5cbiAgbG9nIChsb2dTdHJpbmcsIGZvcmNlID0gZmFsc2UpIHtcbiAgICBpZiAoZm9yY2UgfHwgdGhpcy5jbGkpIHtcbiAgICAgIGNvbnNvbGUubG9nKGxvZ1N0cmluZyk7XG4gICAgfVxuICB9XG5cbiAgY2xvc2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29ubmVjdGlvbiA/IHRoaXMuY29ubmVjdGlvbi5jbG9zZSgpIDogbnVsbDtcbiAgfVxuXG4gIGFzeW5jIGNyZWF0ZShtaWdyYXRpb25OYW1lKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGV4aXN0aW5nTWlncmF0aW9uID0gYXdhaXQgTWlncmF0aW9uTW9kZWwuZmluZE9uZSh7IG5hbWU6IG1pZ3JhdGlvbk5hbWUgfSk7XG4gICAgICBpZiAoISFleGlzdGluZ01pZ3JhdGlvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZXJlIGlzIGFscmVhZHkgYSBtaWdyYXRpb24gd2l0aCBuYW1lICcke21pZ3JhdGlvbk5hbWV9JyBpbiB0aGUgZGF0YWJhc2VgLnJlZCk7XG4gICAgICB9XG5cbiAgICAgIGF3YWl0IHRoaXMuc3luYygpO1xuICAgICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgICAgIGNvbnN0IG5ld01pZ3JhdGlvbkZpbGUgPSBgJHtub3d9LSR7bWlncmF0aW9uTmFtZX0uanNgO1xuICAgICAgbWtkaXJwLnN5bmModGhpcy5taWdyYXRpb25QYXRoKTtcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMocGF0aC5qb2luKHRoaXMubWlncmF0aW9uUGF0aCwgbmV3TWlncmF0aW9uRmlsZSksIHRoaXMudGVtcGxhdGUpO1xuICAgICAgLy8gY3JlYXRlIGluc3RhbmNlIGluIGRiXG4gICAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb247XG4gICAgICBjb25zdCBtaWdyYXRpb25DcmVhdGVkID0gYXdhaXQgTWlncmF0aW9uTW9kZWwuY3JlYXRlKHtcbiAgICAgICAgbmFtZTogbWlncmF0aW9uTmFtZSxcbiAgICAgICAgY3JlYXRlZEF0OiBub3dcbiAgICAgIH0pO1xuICAgICAgdGhpcy5sb2coYENyZWF0ZWQgbWlncmF0aW9uICR7bWlncmF0aW9uTmFtZX0gaW4gJHt0aGlzLm1pZ3JhdGlvblBhdGh9LmApO1xuICAgICAgcmV0dXJuIG1pZ3JhdGlvbkNyZWF0ZWQ7XG4gICAgfSBjYXRjaChlcnJvcil7XG4gICAgICB0aGlzLmxvZyhlcnJvci5zdGFjayk7XG4gICAgICBmaWxlUmVxdWlyZWQoZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIG1pZ3JhdGlvbnMgdXAgdG8gb3IgZG93biB0byBhIGdpdmVuIG1pZ3JhdGlvbiBuYW1lXG4gICAqXG4gICAqIEBwYXJhbSBtaWdyYXRpb25OYW1lXG4gICAqIEBwYXJhbSBkaXJlY3Rpb25cbiAgICovXG4gIGFzeW5jIHJ1bihkaXJlY3Rpb24gPSAndXAnLCBtaWdyYXRpb25OYW1lKSB7XG4gICAgYXdhaXQgdGhpcy5zeW5jKCk7XG5cbiAgICBjb25zdCB1bnRpbE1pZ3JhdGlvbiA9IG1pZ3JhdGlvbk5hbWUgP1xuICAgICAgYXdhaXQgTWlncmF0aW9uTW9kZWwuZmluZE9uZSh7bmFtZTogbWlncmF0aW9uTmFtZX0pIDpcbiAgICAgIGF3YWl0IE1pZ3JhdGlvbk1vZGVsLmZpbmRPbmUoKS5zb3J0KHtjcmVhdGVkQXQ6IC0xfSk7XG5cbiAgICBpZiAoIXVudGlsTWlncmF0aW9uKSB7XG4gICAgICBpZiAobWlncmF0aW9uTmFtZSkgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwiQ291bGQgbm90IGZpbmQgdGhhdCBtaWdyYXRpb24gaW4gdGhlIGRhdGFiYXNlXCIpO1xuICAgICAgZWxzZSB0aHJvdyBuZXcgRXJyb3IoXCJUaGVyZSBhcmUgbm8gcGVuZGluZyBtaWdyYXRpb25zLlwiKTtcbiAgICB9XG5cbiAgICBsZXQgcXVlcnkgPSB7XG4gICAgICBjcmVhdGVkQXQ6IHskbHRlOiB1bnRpbE1pZ3JhdGlvbi5jcmVhdGVkQXR9LFxuICAgICAgc3RhdGU6ICdkb3duJ1xuICAgIH07XG5cbiAgICBpZiAoZGlyZWN0aW9uID09ICdkb3duJykge1xuICAgICAgcXVlcnkgPSB7XG4gICAgICAgIGNyZWF0ZWRBdDogeyRndGU6IHVudGlsTWlncmF0aW9uLmNyZWF0ZWRBdH0sXG4gICAgICAgIHN0YXRlOiAndXAnXG4gICAgICB9O1xuICAgIH1cblxuXG4gICAgY29uc3Qgc29ydERpcmVjdGlvbiA9IGRpcmVjdGlvbiA9PSAndXAnID8gMSA6IC0xO1xuICAgIGNvbnN0IG1pZ3JhdGlvbnNUb1J1biA9IGF3YWl0IE1pZ3JhdGlvbk1vZGVsLmZpbmQocXVlcnkpXG4gICAgICAuc29ydCh7Y3JlYXRlZEF0OiBzb3J0RGlyZWN0aW9ufSk7XG5cbiAgICBpZiAoIW1pZ3JhdGlvbnNUb1J1bi5sZW5ndGgpIHtcbiAgICAgIGlmICh0aGlzLmNsaSkge1xuICAgICAgICB0aGlzLmxvZygnVGhlcmUgYXJlIG5vIG1pZ3JhdGlvbnMgdG8gcnVuJy55ZWxsb3cpO1xuICAgICAgICB0aGlzLmxvZyhgQ3VycmVudCBNaWdyYXRpb25zJyBTdGF0dXNlczogYCk7XG4gICAgICAgIGF3YWl0IHRoaXMubGlzdCgpO1xuICAgICAgfVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGVyZSBhcmUgbm8gbWlncmF0aW9ucyB0byBydW4nKTtcbiAgICB9XG5cbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgbGV0IG51bU1pZ3JhdGlvbnNSYW4gPSAwO1xuICAgIGxldCBtaWdyYXRpb25zUmFuID0gW107XG5cbiAgICBmb3IgKGNvbnN0IG1pZ3JhdGlvbiBvZiBtaWdyYXRpb25zVG9SdW4pIHtcbiAgICAgIGNvbnN0IG1pZ3JhdGlvbkZpbGVQYXRoID0gcGF0aC5qb2luKHNlbGYubWlncmF0aW9uUGF0aCwgbWlncmF0aW9uLmZpbGVuYW1lKTtcbiAgICAgIGNvbnN0IG1vZHVsZXNQYXRoID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLycsICdub2RlX21vZHVsZXMnKTtcbiAgICAgIGxldCBjb2RlID0gZnMucmVhZEZpbGVTeW5jKG1pZ3JhdGlvbkZpbGVQYXRoKTtcbiAgICAgIGlmICh0aGlzLmVzNikge1xuICAgICAgICByZXF1aXJlKCdiYWJlbC1yZWdpc3RlcicpKHtcbiAgICAgICAgICBcInByZXNldHNcIjogW3JlcXVpcmUoXCJiYWJlbC1wcmVzZXQtbGF0ZXN0XCIpXSxcbiAgICAgICAgICBcInBsdWdpbnNcIjogW3JlcXVpcmUoXCJiYWJlbC1wbHVnaW4tdHJhbnNmb3JtLXJ1bnRpbWVcIildXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJlcXVpcmUoJ2JhYmVsLXBvbHlmaWxsJyk7XG4gICAgICB9XG5cbiAgICAgIGxldCBtaWdyYXRpb25GdW5jdGlvbnM7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIG1pZ3JhdGlvbkZ1bmN0aW9ucyA9IHJlcXVpcmUobWlncmF0aW9uRmlsZVBhdGgpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGVyci5tZXNzYWdlID0gZXJyLm1lc3NhZ2UgJiYgL1VuZXhwZWN0ZWQgdG9rZW4vLnRlc3QoZXJyLm1lc3NhZ2UpID9cbiAgICAgICAgICAnVW5leHBlY3RlZCBUb2tlbiB3aGVuIHBhcnNpbmcgbWlncmF0aW9uLiBJZiB5b3UgYXJlIHVzaW5nIGFuIEVTNiBtaWdyYXRpb24gZmlsZSwgdXNlIG9wdGlvbiAtLWVzNicgOlxuICAgICAgICAgIGVyci5tZXNzYWdlO1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG5cbiAgICAgIGlmICghbWlncmF0aW9uRnVuY3Rpb25zW2RpcmVjdGlvbl0pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIChgVGhlICR7ZGlyZWN0aW9ufSBleHBvcnQgaXMgbm90IGRlZmluZWQgaW4gJHttaWdyYXRpb24uZmlsZW5hbWV9LmAucmVkKTtcbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBjb25zdCBjYWxsUHJvbWlzZSA9ICBtaWdyYXRpb25GdW5jdGlvbnNbZGlyZWN0aW9uXS5jYWxsKFxuICAgICAgICAgICAgdGhpcy5jb25uZWN0aW9uLm1vZGVsLmJpbmQodGhpcy5jb25uZWN0aW9uKSxcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNhbGxiYWNrKGVycikge1xuICAgICAgICAgICAgICBpZiAoZXJyKSByZXR1cm4gcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuXG4gICAgICAgICAgaWYgKGNhbGxQcm9taXNlICYmIHR5cGVvZiBjYWxsUHJvbWlzZS50aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsUHJvbWlzZS50aGVuKHJlc29sdmUpLmNhdGNoKHJlamVjdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmxvZyhgJHtkaXJlY3Rpb24udG9VcHBlckNhc2UoKX06ICAgYFtkaXJlY3Rpb24gPT0gJ3VwJz8gJ2dyZWVuJyA6ICdyZWQnXSArIGAgJHttaWdyYXRpb24uZmlsZW5hbWV9IGApO1xuXG4gICAgICAgIGF3YWl0IE1pZ3JhdGlvbk1vZGVsLndoZXJlKHtuYW1lOiBtaWdyYXRpb24ubmFtZX0pLnVwZGF0ZSh7JHNldDoge3N0YXRlOiBkaXJlY3Rpb259fSk7XG4gICAgICAgIG1pZ3JhdGlvbnNSYW4ucHVzaChtaWdyYXRpb24udG9KU09OKCkpO1xuICAgICAgICBudW1NaWdyYXRpb25zUmFuKys7XG4gICAgICB9IGNhdGNoKGVycikge1xuICAgICAgICB0aGlzLmxvZyhgRmFpbGVkIHRvIHJ1biBtaWdyYXRpb24gJHttaWdyYXRpb24ubmFtZX0gZHVlIHRvIGFuIGVycm9yLmAucmVkKTtcbiAgICAgICAgdGhpcy5sb2coYE5vdCBjb250aW51aW5nLiBNYWtlIHN1cmUgeW91ciBkYXRhIGlzIGluIGNvbnNpc3RlbnQgc3RhdGVgLnJlZCk7XG4gICAgICAgIHRocm93IGVyciBpbnN0YW5jZW9mKEVycm9yKSA/IGVyciA6IG5ldyBFcnJvcihlcnIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChtaWdyYXRpb25zVG9SdW4ubGVuZ3RoID09IG51bU1pZ3JhdGlvbnNSYW4pIHRoaXMubG9nKCdBbGwgbWlncmF0aW9ucyBmaW5pc2hlZCBzdWNjZXNzZnVsbHkuJy5ncmVlbik7XG4gICAgcmV0dXJuIG1pZ3JhdGlvbnNSYW47XG4gIH1cblxuICAvKipcbiAgICogTG9va3MgYXQgdGhlIGZpbGUgc3lzdGVtIG1pZ3JhdGlvbnMgYW5kIGltcG9ydHMgYW55IG1pZ3JhdGlvbnMgdGhhdCBhcmVcbiAgICogb24gdGhlIGZpbGUgc3lzdGVtIGJ1dCBtaXNzaW5nIGluIHRoZSBkYXRhYmFzZSBpbnRvIHRoZSBkYXRhYmFzZVxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uYWxpdHkgaXMgb3Bwb3NpdGUgb2YgcHJ1bmUoKVxuICAgKi9cbiAgYXN5bmMgc3luYygpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZmlsZXNJbk1pZ3JhdGlvbkZvbGRlciA9IGZzLnJlYWRkaXJTeW5jKHRoaXMubWlncmF0aW9uUGF0aCk7XG4gICAgICBjb25zdCBtaWdyYXRpb25zSW5EYXRhYmFzZSA9IGF3YWl0IE1pZ3JhdGlvbk1vZGVsLmZpbmQoe30pO1xuICAgICAgLy8gR28gb3ZlciBtaWdyYXRpb25zIGluIGZvbGRlciBhbmQgZGVsZXRlIGFueSBmaWxlcyBub3QgaW4gREJcbiAgICAgIGNvbnN0IG1pZ3JhdGlvbnNJbkZvbGRlciA9IF8uZmlsdGVyKGZpbGVzSW5NaWdyYXRpb25Gb2xkZXIsIGZpbGUgPT4gL1xcZHsxMyx9XFwtLisuanMkLy50ZXN0KGZpbGUpKVxuICAgICAgICAubWFwKGZpbGVuYW1lID0+IHtcbiAgICAgICAgICBjb25zdCBmaWxlQ3JlYXRlZEF0ID0gcGFyc2VJbnQoZmlsZW5hbWUuc3BsaXQoJy0nKVswXSk7XG4gICAgICAgICAgY29uc3QgZXhpc3RzSW5EYXRhYmFzZSA9IG1pZ3JhdGlvbnNJbkRhdGFiYXNlLnNvbWUobSA9PiBmaWxlbmFtZSA9PSBgJHttLmNyZWF0ZWRBdC5nZXRUaW1lKCl9LSR7bS5uYW1lfS5qc2ApO1xuICAgICAgICAgIHJldHVybiB7Y3JlYXRlZEF0OiBmaWxlQ3JlYXRlZEF0LCBmaWxlbmFtZSwgZXhpc3RzSW5EYXRhYmFzZX07XG4gICAgICAgIH0pO1xuXG4gICAgICBjb25zdCBmaWxlc05vdEluRGIgPSBfLmZpbHRlcihtaWdyYXRpb25zSW5Gb2xkZXIsIHtleGlzdHNJbkRhdGFiYXNlOiBmYWxzZX0pLm1hcChmID0+IGYuZmlsZW5hbWUpO1xuICAgICAgbGV0IG1pZ3JhdGlvbnNUb0ltcG9ydCA9IGZpbGVzTm90SW5EYjtcbiAgICAgIHRoaXMubG9nKCdTeW5jaHJvbml6aW5nIGRhdGFiYXNlIHdpdGggZmlsZSBzeXN0ZW0gbWlncmF0aW9ucy4uLicpO1xuICAgICAgaWYgKCF0aGlzLmF1dG9zeW5jICYmIG1pZ3JhdGlvbnNUb0ltcG9ydC5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgYW5zd2VycyA9IGF3YWl0IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgICAgICAgYXNrLnByb21wdCh7XG4gICAgICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICAgICAgbWVzc2FnZTogJ1RoZSBmb2xsb3dpbmcgbWlncmF0aW9ucyBleGlzdCBpbiB0aGUgbWlncmF0aW9ucyBmb2xkZXIgYnV0IG5vdCBpbiB0aGUgZGF0YWJhc2UuIFNlbGVjdCB0aGUgb25lcyB5b3Ugd2FudCB0byBpbXBvcnQgaW50byB0aGUgZGF0YWJhc2UnLFxuICAgICAgICAgICAgbmFtZTogJ21pZ3JhdGlvbnNUb0ltcG9ydCcsXG4gICAgICAgICAgICBjaG9pY2VzOiBmaWxlc05vdEluRGJcbiAgICAgICAgICB9LCAoYW5zd2VycykgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZShhbnN3ZXJzKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbWlncmF0aW9uc1RvSW1wb3J0ID0gYW5zd2Vycy5taWdyYXRpb25zVG9JbXBvcnQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBQcm9taXNlLm1hcChtaWdyYXRpb25zVG9JbXBvcnQsIChtaWdyYXRpb25Ub0ltcG9ydCkgPT4ge1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IHBhdGguam9pbih0aGlzLm1pZ3JhdGlvblBhdGgsIG1pZ3JhdGlvblRvSW1wb3J0KSxcbiAgICAgICAgICB0aW1lc3RhbXBTZXBhcmF0b3JJbmRleCA9IG1pZ3JhdGlvblRvSW1wb3J0LmluZGV4T2YoJy0nKSxcbiAgICAgICAgICB0aW1lc3RhbXAgPSBtaWdyYXRpb25Ub0ltcG9ydC5zbGljZSgwLCB0aW1lc3RhbXBTZXBhcmF0b3JJbmRleCksXG4gICAgICAgICAgbWlncmF0aW9uTmFtZSA9IG1pZ3JhdGlvblRvSW1wb3J0LnNsaWNlKHRpbWVzdGFtcFNlcGFyYXRvckluZGV4ICsgMSwgbWlncmF0aW9uVG9JbXBvcnQubGFzdEluZGV4T2YoJy4nKSk7XG5cbiAgICAgICAgdGhpcy5sb2coYEFkZGluZyBtaWdyYXRpb24gJHtmaWxlUGF0aH0gaW50byBkYXRhYmFzZSBmcm9tIGZpbGUgc3lzdGVtLiBTdGF0ZSBpcyBgICsgYERPV05gLnJlZCk7XG4gICAgICAgIHJldHVybiBNaWdyYXRpb25Nb2RlbC5jcmVhdGUoe1xuICAgICAgICAgIG5hbWU6IG1pZ3JhdGlvbk5hbWUsXG4gICAgICAgICAgY3JlYXRlZEF0OiB0aW1lc3RhbXBcbiAgICAgICAgfSkudGhlbihjcmVhdGVkTWlncmF0aW9uID0+IGNyZWF0ZWRNaWdyYXRpb24udG9KU09OKCkpO1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRoaXMubG9nKGBDb3VsZCBub3Qgc3luY2hyb25pc2UgbWlncmF0aW9ucyBpbiB0aGUgbWlncmF0aW9ucyBmb2xkZXIgdXAgdG8gdGhlIGRhdGFiYXNlLmAucmVkKTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPcHBvc2l0ZSBvZiBzeW5jKCkuXG4gICAqIFJlbW92ZXMgZmlsZXMgaW4gbWlncmF0aW9uIGRpcmVjdG9yeSB3aGljaCBkb24ndCBleGlzdCBpbiBkYXRhYmFzZS5cbiAgICovXG4gIGFzeW5jIHBydW5lKCkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBmaWxlc0luTWlncmF0aW9uRm9sZGVyID0gZnMucmVhZGRpclN5bmModGhpcy5taWdyYXRpb25QYXRoKTtcbiAgICAgIGNvbnN0IG1pZ3JhdGlvbnNJbkRhdGFiYXNlID0gYXdhaXQgTWlncmF0aW9uTW9kZWwuZmluZCh7fSkubGVhbigpO1xuICAgICAgLy8gR28gb3ZlciBtaWdyYXRpb25zIGluIGZvbGRlciBhbmQgZGVsZXRlIGFueSBmaWxlcyBub3QgaW4gREJcbiAgICAgIGNvbnN0IG1pZ3JhdGlvbnNJbkZvbGRlciA9IF8uZmlsdGVyKGZpbGVzSW5NaWdyYXRpb25Gb2xkZXIsIGZpbGUgPT4gL1xcZHsxMyx9XFwtLisuanMvLnRlc3QoZmlsZSkgKVxuICAgICAgICAubWFwKGZpbGVuYW1lID0+IHtcbiAgICAgICAgICBjb25zdCBmaWxlQ3JlYXRlZEF0ID0gcGFyc2VJbnQoZmlsZW5hbWUuc3BsaXQoJy0nKVswXSk7XG4gICAgICAgICAgY29uc3QgZXhpc3RzSW5EYXRhYmFzZSA9ICEhXy5maW5kKG1pZ3JhdGlvbnNJbkRhdGFiYXNlLCB7IGNyZWF0ZWRBdDogbmV3IERhdGUoZmlsZUNyZWF0ZWRBdCkgfSk7XG4gICAgICAgICAgcmV0dXJuIHsgY3JlYXRlZEF0OiBmaWxlQ3JlYXRlZEF0LCBmaWxlbmFtZSwgIGV4aXN0c0luRGF0YWJhc2UgfTtcbiAgICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGRiTWlncmF0aW9uc05vdE9uRnMgPSBfLmZpbHRlcihtaWdyYXRpb25zSW5EYXRhYmFzZSwgbSA9PiB7XG4gICAgICAgIHJldHVybiAhXy5maW5kKG1pZ3JhdGlvbnNJbkZvbGRlciwgeyBmaWxlbmFtZTogbS5maWxlbmFtZSB9KVxuICAgICAgfSk7XG5cblxuICAgICAgbGV0IG1pZ3JhdGlvbnNUb0RlbGV0ZSA9IGRiTWlncmF0aW9uc05vdE9uRnMubWFwKCBtID0+IG0ubmFtZSApO1xuXG4gICAgICBpZiAoIXRoaXMuYXV0b3N5bmMgJiYgISFtaWdyYXRpb25zVG9EZWxldGUubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IGFuc3dlcnMgPSBhd2FpdCBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgICAgICAgIGFzay5wcm9tcHQoe1xuICAgICAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdUaGUgZm9sbG93aW5nIG1pZ3JhdGlvbnMgZXhpc3QgaW4gdGhlIGRhdGFiYXNlIGJ1dCBub3QgaW4gdGhlIG1pZ3JhdGlvbnMgZm9sZGVyLiBTZWxlY3QgdGhlIG9uZXMgeW91IHdhbnQgdG8gcmVtb3ZlIGZyb20gdGhlIGZpbGUgc3lzdGVtLicsXG4gICAgICAgICAgICBuYW1lOiAnbWlncmF0aW9uc1RvRGVsZXRlJyxcbiAgICAgICAgICAgIGNob2ljZXM6IG1pZ3JhdGlvbnNUb0RlbGV0ZVxuICAgICAgICAgIH0sIChhbnN3ZXJzKSA9PiB7XG4gICAgICAgICAgICByZXNvbHZlKGFuc3dlcnMpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBtaWdyYXRpb25zVG9EZWxldGUgPSBhbnN3ZXJzLm1pZ3JhdGlvbnNUb0RlbGV0ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbWlncmF0aW9uc1RvRGVsZXRlRG9jcyA9IGF3YWl0IE1pZ3JhdGlvbk1vZGVsXG4gICAgICAgIC5maW5kKHtcbiAgICAgICAgICBuYW1lOiB7ICRpbjogbWlncmF0aW9uc1RvRGVsZXRlIH1cbiAgICAgICAgfSkubGVhbigpO1xuXG4gICAgICBpZiAobWlncmF0aW9uc1RvRGVsZXRlLmxlbmd0aCkge1xuICAgICAgICB0aGlzLmxvZyhgUmVtb3ZpbmcgbWlncmF0aW9uKHMpIGAsIGAke21pZ3JhdGlvbnNUb0RlbGV0ZS5qb2luKCcsICcpfWAuY3lhbiwgYCBmcm9tIGRhdGFiYXNlYCk7XG4gICAgICAgIGF3YWl0IE1pZ3JhdGlvbk1vZGVsLnJlbW92ZSh7XG4gICAgICAgICAgbmFtZTogeyAkaW46IG1pZ3JhdGlvbnNUb0RlbGV0ZSB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbWlncmF0aW9uc1RvRGVsZXRlRG9jcztcbiAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICB0aGlzLmxvZyhgQ291bGQgbm90IHBydW5lIGV4dHJhbmVvdXMgbWlncmF0aW9ucyBmcm9tIGRhdGFiYXNlLmAucmVkKTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBMaXN0cyB0aGUgY3VycmVudCBtaWdyYXRpb25zIGFuZCB0aGVpciBzdGF0dXNlc1xuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxBcnJheTxPYmplY3Q+Pn1cbiAgICogQGV4YW1wbGVcbiAgICogICBbXG4gICAqICAgIHsgbmFtZTogJ215LW1pZ3JhdGlvbicsIGZpbGVuYW1lOiAnMTQ5MjEzMjIzNDI0X215LW1pZ3JhdGlvbi5qcycsIHN0YXRlOiAndXAnIH0sXG4gICAqICAgIHsgbmFtZTogJ2FkZC1jb3dzJywgZmlsZW5hbWU6ICcxNDkyMTMyMjM0NTNfYWRkLWNvd3MuanMnLCBzdGF0ZTogJ2Rvd24nIH1cbiAgICogICBdXG4gICAqL1xuICBhc3luYyBsaXN0KCkge1xuICAgIGF3YWl0IHRoaXMuc3luYygpO1xuICAgIGNvbnN0IG1pZ3JhdGlvbnMgPSBhd2FpdCBNaWdyYXRpb25Nb2RlbC5maW5kKCkuc29ydCh7IGNyZWF0ZWRBdDogMSB9KTtcbiAgICBpZiAoIW1pZ3JhdGlvbnMubGVuZ3RoKSB0aGlzLmxvZygnVGhlcmUgYXJlIG5vIG1pZ3JhdGlvbnMgdG8gbGlzdC4nLnllbGxvdyk7XG4gICAgcmV0dXJuIG1pZ3JhdGlvbnMubWFwKChtKSA9PiB7XG4gICAgICB0aGlzLmxvZyhcbiAgICAgICAgYCR7bS5zdGF0ZSA9PSAndXAnID8gJ1VQOiAgXFx0JyA6ICdET1dOOlxcdCd9YFttLnN0YXRlID09ICd1cCc/ICdncmVlbicgOiAncmVkJ10gK1xuICAgICAgICBgICR7bS5maWxlbmFtZX1gXG4gICAgICApO1xuICAgICAgcmV0dXJuIG0udG9KU09OKCk7XG4gICAgfSk7XG4gIH1cbn1cblxuXG5cbmZ1bmN0aW9uIGZpbGVSZXF1aXJlZChlcnJvcikge1xuICBpZiAoZXJyb3IgJiYgZXJyb3IuY29kZSA9PSAnRU5PRU5UJykge1xuICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgQ291bGQgbm90IGZpbmQgYW55IGZpbGVzIGF0IHBhdGggJyR7ZXJyb3IucGF0aH0nYCk7XG4gIH1cbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IE1pZ3JhdG9yO1xuXG4iXX0=