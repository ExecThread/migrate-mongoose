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
                  var existsInDatabase = !!_lodash2.default.find(migrationsInDatabase, { createdAt: new Date(fileCreatedAt) });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9saWIuanMiXSwibmFtZXMiOlsiTWlncmF0aW9uTW9kZWwiLCJjb25maWciLCJ3YXJuaW5ncyIsImVzNlRlbXBsYXRlIiwiZXM1VGVtcGxhdGUiLCJNaWdyYXRvciIsInRlbXBsYXRlUGF0aCIsIm1pZ3JhdGlvbnNQYXRoIiwiZGJDb25uZWN0aW9uVXJpIiwiZXM2VGVtcGxhdGVzIiwiY29sbGVjdGlvbk5hbWUiLCJhdXRvc3luYyIsImNsaSIsImRlZmF1bHRUZW1wbGF0ZSIsInRlbXBsYXRlIiwicmVhZEZpbGVTeW5jIiwibWlncmF0aW9uUGF0aCIsInJlc29sdmUiLCJjb25uZWN0aW9uIiwiY3JlYXRlQ29ubmVjdGlvbiIsImVzNiIsImNvbGxlY3Rpb24iLCJsb2dTdHJpbmciLCJmb3JjZSIsImNvbnNvbGUiLCJsb2ciLCJjbG9zZSIsIm1pZ3JhdGlvbk5hbWUiLCJmaW5kT25lIiwibmFtZSIsImV4aXN0aW5nTWlncmF0aW9uIiwiRXJyb3IiLCJyZWQiLCJzeW5jIiwibm93IiwiRGF0ZSIsIm5ld01pZ3JhdGlvbkZpbGUiLCJ3cml0ZUZpbGVTeW5jIiwiam9pbiIsImNyZWF0ZSIsImNyZWF0ZWRBdCIsIm1pZ3JhdGlvbkNyZWF0ZWQiLCJzdGFjayIsImZpbGVSZXF1aXJlZCIsImRpcmVjdGlvbiIsInNvcnQiLCJ1bnRpbE1pZ3JhdGlvbiIsIlJlZmVyZW5jZUVycm9yIiwicXVlcnkiLCIkbHRlIiwic3RhdGUiLCIkZ3RlIiwic29ydERpcmVjdGlvbiIsImZpbmQiLCJtaWdyYXRpb25zVG9SdW4iLCJsZW5ndGgiLCJ5ZWxsb3ciLCJsaXN0Iiwic2VsZiIsIm51bU1pZ3JhdGlvbnNSYW4iLCJtaWdyYXRpb25zUmFuIiwibWlncmF0aW9uIiwibWlncmF0aW9uRmlsZVBhdGgiLCJmaWxlbmFtZSIsIm1vZHVsZXNQYXRoIiwiX19kaXJuYW1lIiwiY29kZSIsInJlcXVpcmUiLCJtaWdyYXRpb25GdW5jdGlvbnMiLCJtZXNzYWdlIiwidGVzdCIsInJlamVjdCIsImNhbGxQcm9taXNlIiwiY2FsbCIsIm1vZGVsIiwiYmluZCIsImNhbGxiYWNrIiwiZXJyIiwidGhlbiIsImNhdGNoIiwidG9VcHBlckNhc2UiLCJ3aGVyZSIsInVwZGF0ZSIsIiRzZXQiLCJwdXNoIiwidG9KU09OIiwiZ3JlZW4iLCJmaWxlc0luTWlncmF0aW9uRm9sZGVyIiwicmVhZGRpclN5bmMiLCJtaWdyYXRpb25zSW5EYXRhYmFzZSIsIm1pZ3JhdGlvbnNJbkZvbGRlciIsImZpbHRlciIsImZpbGUiLCJtYXAiLCJmaWxlQ3JlYXRlZEF0IiwicGFyc2VJbnQiLCJzcGxpdCIsImV4aXN0c0luRGF0YWJhc2UiLCJmaWxlc05vdEluRGIiLCJmIiwibWlncmF0aW9uc1RvSW1wb3J0IiwicHJvbXB0IiwidHlwZSIsImNob2ljZXMiLCJhbnN3ZXJzIiwibWlncmF0aW9uVG9JbXBvcnQiLCJmaWxlUGF0aCIsInRpbWVzdGFtcFNlcGFyYXRvckluZGV4IiwiaW5kZXhPZiIsInRpbWVzdGFtcCIsInNsaWNlIiwibGFzdEluZGV4T2YiLCJjcmVhdGVkTWlncmF0aW9uIiwibGVhbiIsImRiTWlncmF0aW9uc05vdE9uRnMiLCJtIiwibWlncmF0aW9uc1RvRGVsZXRlIiwiJGluIiwibWlncmF0aW9uc1RvRGVsZXRlRG9jcyIsImN5YW4iLCJyZW1vdmUiLCJtaWdyYXRpb25zIiwiZXJyb3IiLCJwYXRoIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBOzs7Ozs7QUFDQSxJQUFJQSx1QkFBSjs7QUFFQSxtQkFBUUMsTUFBUixDQUFlO0FBQ2JDLFlBQVU7QUFERyxDQUFmOztBQUlBLElBQU1DLDhTQUFOOztBQWlCQSxJQUFNQywwU0FBTjs7SUFtQnFCQyxRO0FBQ25CLDBCQVFHO0FBQUEsUUFQREMsWUFPQyxRQVBEQSxZQU9DO0FB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MUYsR0FBTCxDQUNFLE9BQUcwRixFQUFFakUsS0FBRixJQUFXLElBQVgsR0FBa0IsU0FBbEIsR0FBOEIsU0FBakMsR0FBNkNpRSxFQUFFakUsS0FBRixJQUFXLElBQVgsR0FBaUIsT0FBakIsR0FBMkIsS0FBeEUsV0FDSWlFLEVBQUVwRCxRQUROLENBREY7QUFJQSx5QkFBT29ELEVBQUU5QixNQUFGLEVBQVA7QUFDRCxpQkFOTSxDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztrQkFoU1VoRixROzs7QUE0U3JCLFNBQVNzQyxZQUFULENBQXNCK0UsS0FBdEIsRUFBNkI7QUFDM0IsTUFBSUEsU0FBU0EsTUFBTXhELElBQU4sSUFBYyxRQUEzQixFQUFxQztBQUNuQyxVQUFNLElBQUluQixjQUFKLHlDQUF3RDJFLE1BQU1DLElBQTlELFFBQU47QUFDRDtBQUNGOztBQUdEQyxPQUFPQyxPQUFQLEdBQWlCeEgsUUFBakIiLCJmaWxlIjoibGliLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IG1rZGlycCBmcm9tICdta2RpcnAnO1xuaW1wb3J0IFByb21pc2UgZnJvbSAnYmx1ZWJpcmQnO1xuaW1wb3J0ICdjb2xvcnMnO1xuaW1wb3J0IG1vbmdvb3NlIGZyb20gJ21vbmdvb3NlJztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgYXNrIGZyb20gJ2lucXVpcmVyJztcblxuaW1wb3J0IE1pZ3JhdGlvbk1vZGVsRmFjdG9yeSBmcm9tICcuL2RiJztcbmxldCBNaWdyYXRpb25Nb2RlbDtcblxuUHJvbWlzZS5jb25maWcoe1xuICB3YXJuaW5nczogZmFsc2Vcbn0pO1xuXG5jb25zdCBlczZUZW1wbGF0ZSA9XG5gXG4vKipcbiAqIE1ha2UgYW55IGNoYW5nZXMgeW91IG5lZWQgdG8gbWFrZSB0byB0aGUgZGF0YWJhc2UgaGVyZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXAgKCkge1xuICAvLyBXcml0ZSBtaWdyYXRpb24gaGVyZVxufVxuXG4vKipcbiAqIE1ha2UgYW55IGNoYW5nZXMgdGhhdCBVTkRPIHRoZSB1cCBmdW5jdGlvbiBzaWRlIGVmZmVjdHMgaGVyZSAoaWYgcG9zc2libGUpXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkb3duICgpIHtcbiAgLy8gV3JpdGUgbWlncmF0aW9uIGhlcmVcbn1cbmA7XG5cbmNvbnN0IGVzNVRlbXBsYXRlID1cbmAndXNlIHN0cmljdCc7XG5cbi8qKlxuICogTWFrZSBhbnkgY2hhbmdlcyB5b3UgbmVlZCB0byBtYWtlIHRvIHRoZSBkYXRhYmFzZSBoZXJlXG4gKi9cbmV4cG9ydHMudXAgPSBmdW5jdGlvbiB1cCAoZG9uZSkge1xuICBkb25lKCk7XG59O1xuXG4vKipcbiAqIE1ha2UgYW55IGNoYW5nZXMgdGhhdCBVTkRPIHRoZSB1cCBmdW5jdGlvbiBzaWRlIGVmZmVjdHMgaGVyZSAoaWYgcG9zc2libGUpXG4gKi9cbmV4cG9ydHMuZG93biA9IGZ1bmN0aW9uIGRvd24oZG9uZSkge1xuICBkb25lKCk7XG59O1xuYDtcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNaWdyYXRvciB7XG4gIGNvbnN0cnVjdG9yKHtcbiAgICB0ZW1wbGF0ZVBhdGgsXG4gICAgbWlncmF0aW9uc1BhdGggPSAnLi9taWdyYXRpb25zJyxcbiAgICBkYkNvbm5lY3Rpb25VcmksXG4gICAgZXM2VGVtcGxhdGVzID0gZmFsc2UsXG4gICAgY29sbGVjdGlvbk5hbWUgPSAnbWlncmF0aW9ucycsXG4gICAgYXV0b3N5bmMgPSBmYWxzZSxcbiAgICBjbGkgPSBmYWxzZVxuICB9KSB7XG4gICAgY29uc3QgZGVmYXVsdFRlbXBsYXRlID0gZXM2VGVtcGxhdGVzID8gIGVzNlRlbXBsYXRlIDogZXM1VGVtcGxhdGU7XG4gICAgdGhpcy50ZW1wbGF0ZSA9IHRlbXBsYXRlUGF0aCA/IGZzLnJlYWRGaWxlU3luYyh0ZW1wbGF0ZVBhdGgsICd1dGYtOCcpIDogZGVmYXVsdFRlbXBsYXRlO1xuICAgIHRoaXMubWlncmF0aW9uUGF0aCA9IHBhdGgucmVzb2x2ZShtaWdyYXRpb25zUGF0aCk7XG4gICAgdGhpcy5jb25uZWN0aW9uID0gbW9uZ29vc2UuY3JlYXRlQ29ubmVjdGlvbihkYkNvbm5lY3Rpb25VcmkpO1xuICAgIHRoaXMuZXM2ID0gZXM2VGVtcGxhdGVzO1xuICAgIHRoaXMuY29sbGVjdGlvbiA9IGNvbGxlY3Rpb25OYW1lO1xuICAgIHRoaXMuYXV0b3N5bmMgPSBhdXRvc3luYztcbiAgICB0aGlzLmNsaSA9IGNsaTtcbiAgICBNaWdyYXRpb25Nb2RlbCA9IE1pZ3JhdGlvbk1vZGVsRmFjdG9yeShjb2xsZWN0aW9uTmFtZSwgdGhpcy5jb25uZWN0aW9uKTtcbiAgfVxuXG4gIGxvZyAobG9nU3RyaW5nLCBmb3JjZSA9IGZhbHNlKSB7XG4gICAgaWYgKGZvcmNlIHx8IHRoaXMuY2xpKSB7XG4gICAgICBjb25zb2xlLmxvZyhsb2dTdHJpbmcpO1xuICAgIH1cbiAgfVxuXG4gIGNsb3NlKCkge1xuICAgIHJldHVybiB0aGlzLmNvbm5lY3Rpb24gPyB0aGlzLmNvbm5lY3Rpb24uY2xvc2UoKSA6IG51bGw7XG4gIH1cblxuICBhc3luYyBjcmVhdGUobWlncmF0aW9uTmFtZSkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBleGlzdGluZ01pZ3JhdGlvbiA9IGF3YWl0IE1pZ3JhdGlvbk1vZGVsLmZpbmRPbmUoeyBuYW1lOiBtaWdyYXRpb25OYW1lIH0pO1xuICAgICAgaWYgKCEhZXhpc3RpbmdNaWdyYXRpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGVyZSBpcyBhbHJlYWR5IGEgbWlncmF0aW9uIHdpdGggbmFtZSAnJHttaWdyYXRpb25OYW1lfScgaW4gdGhlIGRhdGFiYXNlYC5yZWQpO1xuICAgICAgfVxuXG4gICAgICBhd2FpdCB0aGlzLnN5bmMoKTtcbiAgICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgICBjb25zdCBuZXdNaWdyYXRpb25GaWxlID0gYCR7bm93fS0ke21pZ3JhdGlvbk5hbWV9LmpzYDtcbiAgICAgIG1rZGlycC5zeW5jKHRoaXMubWlncmF0aW9uUGF0aCk7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKHBhdGguam9pbih0aGlzLm1pZ3JhdGlvblBhdGgsIG5ld01pZ3JhdGlvbkZpbGUpLCB0aGlzLnRlbXBsYXRlKTtcbiAgICAgIC8vIGNyZWF0ZSBpbnN0YW5jZSBpbiBkYlxuICAgICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uO1xuICAgICAgY29uc3QgbWlncmF0aW9uQ3JlYXRlZCA9IGF3YWl0IE1pZ3JhdGlvbk1vZGVsLmNyZWF0ZSh7XG4gICAgICAgIG5hbWU6IG1pZ3JhdGlvbk5hbWUsXG4gICAgICAgIGNyZWF0ZWRBdDogbm93XG4gICAgICB9KTtcbiAgICAgIHRoaXMubG9nKGBDcmVhdGVkIG1pZ3JhdGlvbiAke21pZ3JhdGlvbk5hbWV9IGluICR7dGhpcy5taWdyYXRpb25QYXRofS5gKTtcbiAgICAgIHJldHVybiBtaWdyYXRpb25DcmVhdGVkO1xuICAgIH0gY2F0Y2goZXJyb3Ipe1xuICAgICAgdGhpcy5sb2coZXJyb3Iuc3RhY2spO1xuICAgICAgZmlsZVJlcXVpcmVkKGVycm9yKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUnVucyBtaWdyYXRpb25zIHVwIHRvIG9yIGRvd24gdG8gYSBnaXZlbiBtaWdyYXRpb24gbmFtZVxuICAgKlxuICAgKiBAcGFyYW0gbWlncmF0aW9uTmFtZVxuICAgKiBAcGFyYW0gZGlyZWN0aW9uXG4gICAqL1xuICBhc3luYyBydW4oZGlyZWN0aW9uID0gJ3VwJywgbWlncmF0aW9uTmFtZSkge1xuICAgIGF3YWl0IHRoaXMuc3luYygpO1xuXG4gICAgY29uc3QgdW50aWxNaWdyYXRpb24gPSBtaWdyYXRpb25OYW1lID9cbiAgICAgIGF3YWl0IE1pZ3JhdGlvbk1vZGVsLmZpbmRPbmUoe25hbWU6IG1pZ3JhdGlvbk5hbWV9KSA6XG4gICAgICBhd2FpdCBNaWdyYXRpb25Nb2RlbC5maW5kT25lKCkuc29ydCh7Y3JlYXRlZEF0OiAtMX0pO1xuXG4gICAgaWYgKCF1bnRpbE1pZ3JhdGlvbikge1xuICAgICAgaWYgKG1pZ3JhdGlvbk5hbWUpIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcIkNvdWxkIG5vdCBmaW5kIHRoYXQgbWlncmF0aW9uIGluIHRoZSBkYXRhYmFzZVwiKTtcbiAgICAgIGVsc2UgdGhyb3cgbmV3IEVycm9yKFwiVGhlcmUgYXJlIG5vIHBlbmRpbmcgbWlncmF0aW9ucy5cIik7XG4gICAgfVxuXG4gICAgbGV0IHF1ZXJ5ID0ge1xuICAgICAgY3JlYXRlZEF0OiB7JGx0ZTogdW50aWxNaWdyYXRpb24uY3JlYXRlZEF0fSxcbiAgICAgIHN0YXRlOiAnZG93bidcbiAgICB9O1xuXG4gICAgaWYgKGRpcmVjdGlvbiA9PSAnZG93bicpIHtcbiAgICAgIHF1ZXJ5ID0ge1xuICAgICAgICBjcmVhdGVkQXQ6IHskZ3RlOiB1bnRpbE1pZ3JhdGlvbi5jcmVhdGVkQXR9LFxuICAgICAgICBzdGF0ZTogJ3VwJ1xuICAgICAgfTtcbiAgICB9XG5cblxuICAgIGNvbnN0IHNvcnREaXJlY3Rpb24gPSBkaXJlY3Rpb24gPT0gJ3VwJyA/IDEgOiAtMTtcbiAgICBjb25zdCBtaWdyYXRpb25zVG9SdW4gPSBhd2FpdCBNaWdyYXRpb25Nb2RlbC5maW5kKHF1ZXJ5KVxuICAgICAgLnNvcnQoe2NyZWF0ZWRBdDogc29ydERpcmVjdGlvbn0pO1xuXG4gICAgaWYgKCFtaWdyYXRpb25zVG9SdW4ubGVuZ3RoKSB7XG4gICAgICBpZiAodGhpcy5jbGkpIHtcbiAgICAgICAgdGhpcy5sb2coJ1RoZXJlIGFyZSBubyBtaWdyYXRpb25zIHRvIHJ1bicueWVsbG93KTtcbiAgICAgICAgdGhpcy5sb2coYEN1cnJlbnQgTWlncmF0aW9ucycgU3RhdHVzZXM6IGApO1xuICAgICAgICBhd2FpdCB0aGlzLmxpc3QoKTtcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhlcmUgYXJlIG5vIG1pZ3JhdGlvbnMgdG8gcnVuJyk7XG4gICAgfVxuXG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIGxldCBudW1NaWdyYXRpb25zUmFuID0gMDtcbiAgICBsZXQgbWlncmF0aW9uc1JhbiA9IFtdO1xuXG4gICAgZm9yIChjb25zdCBtaWdyYXRpb24gb2YgbWlncmF0aW9uc1RvUnVuKSB7XG4gICAgICBjb25zdCBtaWdyYXRpb25GaWxlUGF0aCA9IHBhdGguam9pbihzZWxmLm1pZ3JhdGlvblBhdGgsIG1pZ3JhdGlvbi5maWxlbmFtZSk7XG4gICAgICBjb25zdCBtb2R1bGVzUGF0aCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8nLCAnbm9kZV9tb2R1bGVzJyk7XG4gICAgICBsZXQgY29kZSA9IGZzLnJlYWRGaWxlU3luYyhtaWdyYXRpb25GaWxlUGF0aCk7XG4gICAgICBpZiAodGhpcy5lczYpIHtcbiAgICAgICAgcmVxdWlyZSgnYmFiZWwtcmVnaXN0ZXInKSh7XG4gICAgICAgICAgXCJwcmVzZXRzXCI6IFtyZXF1aXJlKFwiYmFiZWwtcHJlc2V0LWxhdGVzdFwiKV0sXG4gICAgICAgICAgXCJwbHVnaW5zXCI6IFtyZXF1aXJlKFwiYmFiZWwtcGx1Z2luLXRyYW5zZm9ybS1ydW50aW1lXCIpXVxuICAgICAgICB9KTtcblxuICAgICAgICByZXF1aXJlKCdiYWJlbC1wb2x5ZmlsbCcpO1xuICAgICAgfVxuXG4gICAgICBsZXQgbWlncmF0aW9uRnVuY3Rpb25zO1xuXG4gICAgICB0cnkge1xuICAgICAgICBtaWdyYXRpb25GdW5jdGlvbnMgPSByZXF1aXJlKG1pZ3JhdGlvbkZpbGVQYXRoKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBlcnIubWVzc2FnZSA9IGVyci5tZXNzYWdlICYmIC9VbmV4cGVjdGVkIHRva2VuLy50ZXN0KGVyci5tZXNzYWdlKSA/XG4gICAgICAgICAgJ1VuZXhwZWN0ZWQgVG9rZW4gd2hlbiBwYXJzaW5nIG1pZ3JhdGlvbi4gSWYgeW91IGFyZSB1c2luZyBhbiBFUzYgbWlncmF0aW9uIGZpbGUsIHVzZSBvcHRpb24gLS1lczYnIDpcbiAgICAgICAgICBlcnIubWVzc2FnZTtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuXG4gICAgICBpZiAoIW1pZ3JhdGlvbkZ1bmN0aW9uc1tkaXJlY3Rpb25dKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvciAoYFRoZSAke2RpcmVjdGlvbn0gZXhwb3J0IGlzIG5vdCBkZWZpbmVkIGluICR7bWlncmF0aW9uLmZpbGVuYW1lfS5gLnJlZCk7XG4gICAgICB9XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKCAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgY29uc3QgY2FsbFByb21pc2UgPSAgbWlncmF0aW9uRnVuY3Rpb25zW2RpcmVjdGlvbl0uY2FsbChcbiAgICAgICAgICAgIHRoaXMuY29ubmVjdGlvbi5tb2RlbC5iaW5kKHRoaXMuY29ubmVjdGlvbiksXG4gICAgICAgICAgICBmdW5jdGlvbiBjYWxsYmFjayhlcnIpIHtcbiAgICAgICAgICAgICAgaWYgKGVycikgcmV0dXJuIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcblxuICAgICAgICAgIGlmIChjYWxsUHJvbWlzZSAmJiB0eXBlb2YgY2FsbFByb21pc2UudGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbFByb21pc2UudGhlbihyZXNvbHZlKS5jYXRjaChyZWplY3QpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5sb2coYCR7ZGlyZWN0aW9uLnRvVXBwZXJDYXNlKCl9OiAgIGBbZGlyZWN0aW9uID09ICd1cCc/ICdncmVlbicgOiAncmVkJ10gKyBgICR7bWlncmF0aW9uLmZpbGVuYW1lfSBgKTtcblxuICAgICAgICBhd2FpdCBNaWdyYXRpb25Nb2RlbC53aGVyZSh7bmFtZTogbWlncmF0aW9uLm5hbWV9KS51cGRhdGUoeyRzZXQ6IHtzdGF0ZTogZGlyZWN0aW9ufX0pO1xuICAgICAgICBtaWdyYXRpb25zUmFuLnB1c2gobWlncmF0aW9uLnRvSlNPTigpKTtcbiAgICAgICAgbnVtTWlncmF0aW9uc1JhbisrO1xuICAgICAgfSBjYXRjaChlcnIpIHtcbiAgICAgICAgdGhpcy5sb2coYEZhaWxlZCB0byBydW4gbWlncmF0aW9uICR7bWlncmF0aW9uLm5hbWV9IGR1ZSB0byBhbiBlcnJvci5gLnJlZCk7XG4gICAgICAgIHRoaXMubG9nKGBOb3QgY29udGludWluZy4gTWFrZSBzdXJlIHlvdXIgZGF0YSBpcyBpbiBjb25zaXN0ZW50IHN0YXRlYC5yZWQpO1xuICAgICAgICB0aHJvdyBlcnIgaW5zdGFuY2VvZihFcnJvcikgPyBlcnIgOiBuZXcgRXJyb3IoZXJyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobWlncmF0aW9uc1RvUnVuLmxlbmd0aCA9PSBudW1NaWdyYXRpb25zUmFuKSB0aGlzLmxvZygnQWxsIG1pZ3JhdGlvbnMgZmluaXNoZWQgc3VjY2Vzc2Z1bGx5LicuZ3JlZW4pO1xuICAgIHJldHVybiBtaWdyYXRpb25zUmFuO1xuICB9XG5cbiAgLyoqXG4gICAqIExvb2tzIGF0IHRoZSBmaWxlIHN5c3RlbSBtaWdyYXRpb25zIGFuZCBpbXBvcnRzIGFueSBtaWdyYXRpb25zIHRoYXQgYXJlXG4gICAqIG9uIHRoZSBmaWxlIHN5c3RlbSBidXQgbWlzc2luZyBpbiB0aGUgZGF0YWJhc2UgaW50byB0aGUgZGF0YWJhc2VcbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbmFsaXR5IGlzIG9wcG9zaXRlIG9mIHBydW5lKClcbiAgICovXG4gIGFzeW5jIHN5bmMoKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGZpbGVzSW5NaWdyYXRpb25Gb2xkZXIgPSBmcy5yZWFkZGlyU3luYyh0aGlzLm1pZ3JhdGlvblBhdGgpO1xuICAgICAgY29uc3QgbWlncmF0aW9uc0luRGF0YWJhc2UgPSBhd2FpdCBNaWdyYXRpb25Nb2RlbC5maW5kKHt9KTtcbiAgICAgIC8vIEdvIG92ZXIgbWlncmF0aW9ucyBpbiBmb2xkZXIgYW5kIGRlbGV0ZSBhbnkgZmlsZXMgbm90IGluIERCXG4gICAgICBjb25zdCBtaWdyYXRpb25zSW5Gb2xkZXIgPSBfLmZpbHRlcihmaWxlc0luTWlncmF0aW9uRm9sZGVyLCBmaWxlID0+IC9cXGR7MTMsfVxcLS4rLmpzJC8udGVzdChmaWxlKSlcbiAgICAgICAgLm1hcChmaWxlbmFtZSA9PiB7XG4gICAgICAgICAgY29uc3QgZmlsZUNyZWF0ZWRBdCA9IHBhcnNlSW50KGZpbGVuYW1lLnNwbGl0KCctJylbMF0pO1xuICAgICAgICAgIGNvbnN0IGV4aXN0c0luRGF0YWJhc2UgPSAhIV8uZmluZChtaWdyYXRpb25zSW5EYXRhYmFzZSwge2NyZWF0ZWRBdDogbmV3IERhdGUoZmlsZUNyZWF0ZWRBdCl9KTtcbiAgICAgICAgICByZXR1cm4ge2NyZWF0ZWRBdDogZmlsZUNyZWF0ZWRBdCwgZmlsZW5hbWUsIGV4aXN0c0luRGF0YWJhc2V9O1xuICAgICAgICB9KTtcblxuICAgICAgY29uc3QgZmlsZXNOb3RJbkRiID0gXy5maWx0ZXIobWlncmF0aW9uc0luRm9sZGVyLCB7ZXhpc3RzSW5EYXRhYmFzZTogZmFsc2V9KS5tYXAoZiA9PiBmLmZpbGVuYW1lKTtcbiAgICAgIGxldCBtaWdyYXRpb25zVG9JbXBvcnQgPSBmaWxlc05vdEluRGI7XG4gICAgICB0aGlzLmxvZygnU3luY2hyb25pemluZyBkYXRhYmFzZSB3aXRoIGZpbGUgc3lzdGVtIG1pZ3JhdGlvbnMuLi4nKTtcbiAgICAgIGlmICghdGhpcy5hdXRvc3luYyAmJiBtaWdyYXRpb25zVG9JbXBvcnQubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IGFuc3dlcnMgPSBhd2FpdCBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgICAgICAgIGFzay5wcm9tcHQoe1xuICAgICAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdUaGUgZm9sbG93aW5nIG1pZ3JhdGlvbnMgZXhpc3QgaW4gdGhlIG1pZ3JhdGlvbnMgZm9sZGVyIGJ1dCBub3QgaW4gdGhlIGRhdGFiYXNlLiBTZWxlY3QgdGhlIG9uZXMgeW91IHdhbnQgdG8gaW1wb3J0IGludG8gdGhlIGRhdGFiYXNlJyxcbiAgICAgICAgICAgIG5hbWU6ICdtaWdyYXRpb25zVG9JbXBvcnQnLFxuICAgICAgICAgICAgY2hvaWNlczogZmlsZXNOb3RJbkRiXG4gICAgICAgICAgfSwgKGFuc3dlcnMpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUoYW5zd2Vycyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG1pZ3JhdGlvbnNUb0ltcG9ydCA9IGFuc3dlcnMubWlncmF0aW9uc1RvSW1wb3J0O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gUHJvbWlzZS5tYXAobWlncmF0aW9uc1RvSW1wb3J0LCAobWlncmF0aW9uVG9JbXBvcnQpID0+IHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBwYXRoLmpvaW4odGhpcy5taWdyYXRpb25QYXRoLCBtaWdyYXRpb25Ub0ltcG9ydCksXG4gICAgICAgICAgdGltZXN0YW1wU2VwYXJhdG9ySW5kZXggPSBtaWdyYXRpb25Ub0ltcG9ydC5pbmRleE9mKCctJyksXG4gICAgICAgICAgdGltZXN0YW1wID0gbWlncmF0aW9uVG9JbXBvcnQuc2xpY2UoMCwgdGltZXN0YW1wU2VwYXJhdG9ySW5kZXgpLFxuICAgICAgICAgIG1pZ3JhdGlvbk5hbWUgPSBtaWdyYXRpb25Ub0ltcG9ydC5zbGljZSh0aW1lc3RhbXBTZXBhcmF0b3JJbmRleCArIDEsIG1pZ3JhdGlvblRvSW1wb3J0Lmxhc3RJbmRleE9mKCcuJykpO1xuXG4gICAgICAgIHRoaXMubG9nKGBBZGRpbmcgbWlncmF0aW9uICR7ZmlsZVBhdGh9IGludG8gZGF0YWJhc2UgZnJvbSBmaWxlIHN5c3RlbS4gU3RhdGUgaXMgYCArIGBET1dOYC5yZWQpO1xuICAgICAgICByZXR1cm4gTWlncmF0aW9uTW9kZWwuY3JlYXRlKHtcbiAgICAgICAgICBuYW1lOiBtaWdyYXRpb25OYW1lLFxuICAgICAgICAgIGNyZWF0ZWRBdDogdGltZXN0YW1wXG4gICAgICAgIH0pLnRoZW4oY3JlYXRlZE1pZ3JhdGlvbiA9PiBjcmVhdGVkTWlncmF0aW9uLnRvSlNPTigpKTtcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aGlzLmxvZyhgQ291bGQgbm90IHN5bmNocm9uaXNlIG1pZ3JhdGlvbnMgaW4gdGhlIG1pZ3JhdGlvbnMgZm9sZGVyIHVwIHRvIHRoZSBkYXRhYmFzZS5gLnJlZCk7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogT3Bwb3NpdGUgb2Ygc3luYygpLlxuICAgKiBSZW1vdmVzIGZpbGVzIGluIG1pZ3JhdGlvbiBkaXJlY3Rvcnkgd2hpY2ggZG9uJ3QgZXhpc3QgaW4gZGF0YWJhc2UuXG4gICAqL1xuICBhc3luYyBwcnVuZSgpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZmlsZXNJbk1pZ3JhdGlvbkZvbGRlciA9IGZzLnJlYWRkaXJTeW5jKHRoaXMubWlncmF0aW9uUGF0aCk7XG4gICAgICBjb25zdCBtaWdyYXRpb25zSW5EYXRhYmFzZSA9IGF3YWl0IE1pZ3JhdGlvbk1vZGVsLmZpbmQoe30pLmxlYW4oKTtcbiAgICAgIC8vIEdvIG92ZXIgbWlncmF0aW9ucyBpbiBmb2xkZXIgYW5kIGRlbGV0ZSBhbnkgZmlsZXMgbm90IGluIERCXG4gICAgICBjb25zdCBtaWdyYXRpb25zSW5Gb2xkZXIgPSBfLmZpbHRlcihmaWxlc0luTWlncmF0aW9uRm9sZGVyLCBmaWxlID0+IC9cXGR7MTMsfVxcLS4rLmpzLy50ZXN0KGZpbGUpIClcbiAgICAgICAgLm1hcChmaWxlbmFtZSA9PiB7XG4gICAgICAgICAgY29uc3QgZmlsZUNyZWF0ZWRBdCA9IHBhcnNlSW50KGZpbGVuYW1lLnNwbGl0KCctJylbMF0pO1xuICAgICAgICAgIGNvbnN0IGV4aXN0c0luRGF0YWJhc2UgPSAhIV8uZmluZChtaWdyYXRpb25zSW5EYXRhYmFzZSwgeyBjcmVhdGVkQXQ6IG5ldyBEYXRlKGZpbGVDcmVhdGVkQXQpIH0pO1xuICAgICAgICAgIHJldHVybiB7IGNyZWF0ZWRBdDogZmlsZUNyZWF0ZWRBdCwgZmlsZW5hbWUsICBleGlzdHNJbkRhdGFiYXNlIH07XG4gICAgICAgIH0pO1xuXG4gICAgICBjb25zdCBkYk1pZ3JhdGlvbnNOb3RPbkZzID0gXy5maWx0ZXIobWlncmF0aW9uc0luRGF0YWJhc2UsIG0gPT4ge1xuICAgICAgICByZXR1cm4gIV8uZmluZChtaWdyYXRpb25zSW5Gb2xkZXIsIHsgZmlsZW5hbWU6IG0uZmlsZW5hbWUgfSlcbiAgICAgIH0pO1xuXG5cbiAgICAgIGxldCBtaWdyYXRpb25zVG9EZWxldGUgPSBkYk1pZ3JhdGlvbnNOb3RPbkZzLm1hcCggbSA9PiBtLm5hbWUgKTtcblxuICAgICAgaWYgKCF0aGlzLmF1dG9zeW5jICYmICEhbWlncmF0aW9uc1RvRGVsZXRlLmxlbmd0aCkge1xuICAgICAgICBjb25zdCBhbnN3ZXJzID0gYXdhaXQgbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICAgICAgICBhc2sucHJvbXB0KHtcbiAgICAgICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgICAgICBtZXNzYWdlOiAnVGhlIGZvbGxvd2luZyBtaWdyYXRpb25zIGV4aXN0IGluIHRoZSBkYXRhYmFzZSBidXQgbm90IGluIHRoZSBtaWdyYXRpb25zIGZvbGRlci4gU2VsZWN0IHRoZSBvbmVzIHlvdSB3YW50IHRvIHJlbW92ZSBmcm9tIHRoZSBmaWxlIHN5c3RlbS4nLFxuICAgICAgICAgICAgbmFtZTogJ21pZ3JhdGlvbnNUb0RlbGV0ZScsXG4gICAgICAgICAgICBjaG9pY2VzOiBtaWdyYXRpb25zVG9EZWxldGVcbiAgICAgICAgICB9LCAoYW5zd2VycykgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZShhbnN3ZXJzKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbWlncmF0aW9uc1RvRGVsZXRlID0gYW5zd2Vycy5taWdyYXRpb25zVG9EZWxldGU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG1pZ3JhdGlvbnNUb0RlbGV0ZURvY3MgPSBhd2FpdCBNaWdyYXRpb25Nb2RlbFxuICAgICAgICAuZmluZCh7XG4gICAgICAgICAgbmFtZTogeyAkaW46IG1pZ3JhdGlvbnNUb0RlbGV0ZSB9XG4gICAgICAgIH0pLmxlYW4oKTtcblxuICAgICAgaWYgKG1pZ3JhdGlvbnNUb0RlbGV0ZS5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5sb2coYFJlbW92aW5nIG1pZ3JhdGlvbihzKSBgLCBgJHttaWdyYXRpb25zVG9EZWxldGUuam9pbignLCAnKX1gLmN5YW4sIGAgZnJvbSBkYXRhYmFzZWApO1xuICAgICAgICBhd2FpdCBNaWdyYXRpb25Nb2RlbC5yZW1vdmUoe1xuICAgICAgICAgIG5hbWU6IHsgJGluOiBtaWdyYXRpb25zVG9EZWxldGUgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG1pZ3JhdGlvbnNUb0RlbGV0ZURvY3M7XG4gICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgdGhpcy5sb2coYENvdWxkIG5vdCBwcnVuZSBleHRyYW5lb3VzIG1pZ3JhdGlvbnMgZnJvbSBkYXRhYmFzZS5gLnJlZCk7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTGlzdHMgdGhlIGN1cnJlbnQgbWlncmF0aW9ucyBhbmQgdGhlaXIgc3RhdHVzZXNcbiAgICogQHJldHVybnMge1Byb21pc2U8QXJyYXk8T2JqZWN0Pj59XG4gICAqIEBleGFtcGxlXG4gICAqICAgW1xuICAgKiAgICB7IG5hbWU6ICdteS1taWdyYXRpb24nLCBmaWxlbmFtZTogJzE0OTIxMzIyMzQyNF9teS1taWdyYXRpb24uanMnLCBzdGF0ZTogJ3VwJyB9LFxuICAgKiAgICB7IG5hbWU6ICdhZGQtY293cycsIGZpbGVuYW1lOiAnMTQ5MjEzMjIzNDUzX2FkZC1jb3dzLmpzJywgc3RhdGU6ICdkb3duJyB9XG4gICAqICAgXVxuICAgKi9cbiAgYXN5bmMgbGlzdCgpIHtcbiAgICBhd2FpdCB0aGlzLnN5bmMoKTtcbiAgICBjb25zdCBtaWdyYXRpb25zID0gYXdhaXQgTWlncmF0aW9uTW9kZWwuZmluZCgpLnNvcnQoeyBjcmVhdGVkQXQ6IDEgfSk7XG4gICAgaWYgKCFtaWdyYXRpb25zLmxlbmd0aCkgdGhpcy5sb2coJ1RoZXJlIGFyZSBubyBtaWdyYXRpb25zIHRvIGxpc3QuJy55ZWxsb3cpO1xuICAgIHJldHVybiBtaWdyYXRpb25zLm1hcCgobSkgPT4ge1xuICAgICAgdGhpcy5sb2coXG4gICAgICAgIGAke20uc3RhdGUgPT0gJ3VwJyA/ICdVUDogIFxcdCcgOiAnRE9XTjpcXHQnfWBbbS5zdGF0ZSA9PSAndXAnPyAnZ3JlZW4nIDogJ3JlZCddICtcbiAgICAgICAgYCAke20uZmlsZW5hbWV9YFxuICAgICAgKTtcbiAgICAgIHJldHVybiBtLnRvSlNPTigpO1xuICAgIH0pO1xuICB9XG59XG5cblxuXG5mdW5jdGlvbiBmaWxlUmVxdWlyZWQoZXJyb3IpIHtcbiAgaWYgKGVycm9yICYmIGVycm9yLmNvZGUgPT0gJ0VOT0VOVCcpIHtcbiAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoYENvdWxkIG5vdCBmaW5kIGFueSBmaWxlcyBhdCBwYXRoICcke2Vycm9yLnBhdGh9J2ApO1xuICB9XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBNaWdyYXRvcjtcblxuIl19