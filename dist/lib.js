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
                  var createdMigration = MigrationModel.create({
                    name: migrationName,
                    createdAt: timestamp
                  });
                  return createdMigration;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9saWIuanMiXSwibmFtZXMiOlsiTWlncmF0aW9uTW9kZWwiLCJjb25maWciLCJ3YXJuaW5ncyIsImVzNlRlbXBsYXRlIiwiZXM1VGVtcGxhdGUiLCJNaWdyYXRvciIsInRlbXBsYXRlUGF0aCIsIm1pZ3JhdGlvbnNQYXRoIiwiZGJDb25uZWN0aW9uVXJpIiwiZXM2VGVtcGxhdGVzIiwiY29sbGVjdGlvbk5hbWUiLCJhdXRvc3luYyIsImNsaSIsImRlZmF1bHRUZW1wbGF0ZSIsInRlbXBsYXRlIiwicmVhZEZpbGVTeW5jIiwibWlncmF0aW9uUGF0aCIsInJlc29sdmUiLCJjb25uZWN0aW9uIiwiY3JlYXRlQ29ubmVjdGlvbiIsImVzNiIsImNvbGxlY3Rpb24iLCJsb2dTdHJpbmciLCJmb3JjZSIsImNvbnNvbGUiLCJsb2ciLCJjbG9zZSIsIm1pZ3JhdGlvbk5hbWUiLCJmaW5kT25lIiwibmFtZSIsImV4aXN0aW5nTWlncmF0aW9uIiwiRXJyb3IiLCJyZWQiLCJzeW5jIiwibm93IiwiRGF0ZSIsIm5ld01pZ3JhdGlvbkZpbGUiLCJ3cml0ZUZpbGVTeW5jIiwiam9pbiIsImNyZWF0ZSIsImNyZWF0ZWRBdCIsIm1pZ3JhdGlvbkNyZWF0ZWQiLCJzdGFjayIsImZpbGVSZXF1aXJlZCIsImRpcmVjdGlvbiIsInNvcnQiLCJ1bnRpbE1pZ3JhdGlvbiIsIlJlZmVyZW5jZUVycm9yIiwicXVlcnkiLCIkbHRlIiwic3RhdGUiLCIkZ3RlIiwic29ydERpcmVjdGlvbiIsImZpbmQiLCJtaWdyYXRpb25zVG9SdW4iLCJsZW5ndGgiLCJ5ZWxsb3ciLCJsaXN0Iiwic2VsZiIsIm51bU1pZ3JhdGlvbnNSYW4iLCJtaWdyYXRpb25zUmFuIiwibWlncmF0aW9uIiwibWlncmF0aW9uRmlsZVBhdGgiLCJmaWxlbmFtZSIsIm1vZHVsZXNQYXRoIiwiX19kaXJuYW1lIiwiY29kZSIsInJlcXVpcmUiLCJtaWdyYXRpb25GdW5jdGlvbnMiLCJtZXNzYWdlIiwidGVzdCIsInJlamVjdCIsImNhbGxQcm9taXNlIiwiY2FsbCIsIm1vZGVsIiwiYmluZCIsImNhbGxiYWNrIiwiZXJyIiwidGhlbiIsImNhdGNoIiwidG9VcHBlckNhc2UiLCJ3aGVyZSIsInVwZGF0ZSIsIiRzZXQiLCJwdXNoIiwidG9KU09OIiwiZ3JlZW4iLCJmaWxlc0luTWlncmF0aW9uRm9sZGVyIiwicmVhZGRpclN5bmMiLCJtaWdyYXRpb25zSW5EYXRhYmFzZSIsIm1pZ3JhdGlvbnNJbkZvbGRlciIsImZpbHRlciIsImZpbGUiLCJtYXAiLCJmaWxlQ3JlYXRlZEF0IiwicGFyc2VJbnQiLCJzcGxpdCIsImV4aXN0c0luRGF0YWJhc2UiLCJmaWxlc05vdEluRGIiLCJmIiwibWlncmF0aW9uc1RvSW1wb3J0IiwicHJvbXB0IiwidHlwZSIsImNob2ljZXMiLCJhbnN3ZXJzIiwibWlncmF0aW9uVG9JbXBvcnQiLCJmaWxlUGF0aCIsInRpbWVzdGFtcFNlcGFyYXRvckluZGV4IiwiaW5kZXhPZiIsInRpbWVzdGFtcCIsInNsaWNlIiwibGFzdEluZGV4T2YiLCJjcmVhdGVkTWlncmF0aW9uIiwibGVhbiIsImRiTWlncmF0aW9uc05vdE9uRnMiLCJtIiwibWlncmF0aW9uc1RvRGVsZXRlIiwiJGluIiwibWlncmF0aW9uc1RvRGVsZXRlRG9jcyIsImN5YW4iLCJyZW1vdmUiLCJtaWdyYXRpb25zIiwiZXJyb3IiLCJwYXRoIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBOzs7Ozs7QUFDQSxJQUFJQSx1QkFBSjs7QUFFQSxtQkFBUUMsTUFBUixDQUFlO0FBQ2JDLFlBQVU7QUFERyxDQUFmOztBQUlBLElBQU1DLDhTQUFOOztBQWlCQSxJQUFNQywwU0FBTjs7SUFtQnFCQyxRO0FBQ25CLDBCQVFHO0FBQUEsUUFQREMsWUFPQyxRQVBEQSxZQU9DO0FB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VyxJQUFYLEdBQWtCLFNBQWxCLEdBQThCLFNBQWpDLEdBQTZDaUUsRUFBRWpFLEtBQUYsSUFBVyxJQUFYLEdBQWlCLE9BQWpCLEdBQTJCLEtBQXhFLFdBQ0lpRSxFQUFFcEQsUUFETixDQURGO0FBSUEseUJBQU9vRCxFQUFFOUIsTUFBRixFQUFQO0FBQ0QsaUJBTk0sQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7a0JBalNVaEYsUTs7O0FBNlNyQixTQUFTc0MsWUFBVCxDQUFzQitFLEtBQXRCLEVBQTZCO0FBQzNCLE1BQUlBLFNBQVNBLE1BQU14RCxJQUFOLElBQWMsUUFBM0IsRUFBcUM7QUFDbkMsVUFBTSxJQUFJbkIsY0FBSix5Q0FBd0QyRSxNQUFNQyxJQUE5RCxRQUFOO0FBQ0Q7QUFDRjs7QUFHREMsT0FBT0MsT0FBUCxHQUFpQnhILFFBQWpCIiwiZmlsZSI6ImxpYi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBta2RpcnAgZnJvbSAnbWtkaXJwJztcbmltcG9ydCBQcm9taXNlIGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCAnY29sb3JzJztcbmltcG9ydCBtb25nb29zZSBmcm9tICdtb25nb29zZSc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IGFzayBmcm9tICdpbnF1aXJlcic7XG5cbmltcG9ydCBNaWdyYXRpb25Nb2RlbEZhY3RvcnkgZnJvbSAnLi9kYic7XG5sZXQgTWlncmF0aW9uTW9kZWw7XG5cblByb21pc2UuY29uZmlnKHtcbiAgd2FybmluZ3M6IGZhbHNlXG59KTtcblxuY29uc3QgZXM2VGVtcGxhdGUgPVxuYFxuLyoqXG4gKiBNYWtlIGFueSBjaGFuZ2VzIHlvdSBuZWVkIHRvIG1ha2UgdG8gdGhlIGRhdGFiYXNlIGhlcmVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVwICgpIHtcbiAgLy8gV3JpdGUgbWlncmF0aW9uIGhlcmVcbn1cblxuLyoqXG4gKiBNYWtlIGFueSBjaGFuZ2VzIHRoYXQgVU5ETyB0aGUgdXAgZnVuY3Rpb24gc2lkZSBlZmZlY3RzIGhlcmUgKGlmIHBvc3NpYmxlKVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZG93biAoKSB7XG4gIC8vIFdyaXRlIG1pZ3JhdGlvbiBoZXJlXG59XG5gO1xuXG5jb25zdCBlczVUZW1wbGF0ZSA9XG5gJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIE1ha2UgYW55IGNoYW5nZXMgeW91IG5lZWQgdG8gbWFrZSB0byB0aGUgZGF0YWJhc2UgaGVyZVxuICovXG5leHBvcnRzLnVwID0gZnVuY3Rpb24gdXAgKGRvbmUpIHtcbiAgZG9uZSgpO1xufTtcblxuLyoqXG4gKiBNYWtlIGFueSBjaGFuZ2VzIHRoYXQgVU5ETyB0aGUgdXAgZnVuY3Rpb24gc2lkZSBlZmZlY3RzIGhlcmUgKGlmIHBvc3NpYmxlKVxuICovXG5leHBvcnRzLmRvd24gPSBmdW5jdGlvbiBkb3duKGRvbmUpIHtcbiAgZG9uZSgpO1xufTtcbmA7XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWlncmF0b3Ige1xuICBjb25zdHJ1Y3Rvcih7XG4gICAgdGVtcGxhdGVQYXRoLFxuICAgIG1pZ3JhdGlvbnNQYXRoID0gJy4vbWlncmF0aW9ucycsXG4gICAgZGJDb25uZWN0aW9uVXJpLFxuICAgIGVzNlRlbXBsYXRlcyA9IGZhbHNlLFxuICAgIGNvbGxlY3Rpb25OYW1lID0gJ21pZ3JhdGlvbnMnLFxuICAgIGF1dG9zeW5jID0gZmFsc2UsXG4gICAgY2xpID0gZmFsc2VcbiAgfSkge1xuICAgIGNvbnN0IGRlZmF1bHRUZW1wbGF0ZSA9IGVzNlRlbXBsYXRlcyA/ICBlczZUZW1wbGF0ZSA6IGVzNVRlbXBsYXRlO1xuICAgIHRoaXMudGVtcGxhdGUgPSB0ZW1wbGF0ZVBhdGggPyBmcy5yZWFkRmlsZVN5bmModGVtcGxhdGVQYXRoLCAndXRmLTgnKSA6IGRlZmF1bHRUZW1wbGF0ZTtcbiAgICB0aGlzLm1pZ3JhdGlvblBhdGggPSBwYXRoLnJlc29sdmUobWlncmF0aW9uc1BhdGgpO1xuICAgIHRoaXMuY29ubmVjdGlvbiA9IG1vbmdvb3NlLmNyZWF0ZUNvbm5lY3Rpb24oZGJDb25uZWN0aW9uVXJpKTtcbiAgICB0aGlzLmVzNiA9IGVzNlRlbXBsYXRlcztcbiAgICB0aGlzLmNvbGxlY3Rpb24gPSBjb2xsZWN0aW9uTmFtZTtcbiAgICB0aGlzLmF1dG9zeW5jID0gYXV0b3N5bmM7XG4gICAgdGhpcy5jbGkgPSBjbGk7XG4gICAgTWlncmF0aW9uTW9kZWwgPSBNaWdyYXRpb25Nb2RlbEZhY3RvcnkoY29sbGVjdGlvbk5hbWUsIHRoaXMuY29ubmVjdGlvbik7XG4gIH1cblxuICBsb2cgKGxvZ1N0cmluZywgZm9yY2UgPSBmYWxzZSkge1xuICAgIGlmIChmb3JjZSB8fCB0aGlzLmNsaSkge1xuICAgICAgY29uc29sZS5sb2cobG9nU3RyaW5nKTtcbiAgICB9XG4gIH1cblxuICBjbG9zZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25uZWN0aW9uID8gdGhpcy5jb25uZWN0aW9uLmNsb3NlKCkgOiBudWxsO1xuICB9XG5cbiAgYXN5bmMgY3JlYXRlKG1pZ3JhdGlvbk5hbWUpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZXhpc3RpbmdNaWdyYXRpb24gPSBhd2FpdCBNaWdyYXRpb25Nb2RlbC5maW5kT25lKHsgbmFtZTogbWlncmF0aW9uTmFtZSB9KTtcbiAgICAgIGlmICghIWV4aXN0aW5nTWlncmF0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlcmUgaXMgYWxyZWFkeSBhIG1pZ3JhdGlvbiB3aXRoIG5hbWUgJyR7bWlncmF0aW9uTmFtZX0nIGluIHRoZSBkYXRhYmFzZWAucmVkKTtcbiAgICAgIH1cblxuICAgICAgYXdhaXQgdGhpcy5zeW5jKCk7XG4gICAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgY29uc3QgbmV3TWlncmF0aW9uRmlsZSA9IGAke25vd30tJHttaWdyYXRpb25OYW1lfS5qc2A7XG4gICAgICBta2RpcnAuc3luYyh0aGlzLm1pZ3JhdGlvblBhdGgpO1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4odGhpcy5taWdyYXRpb25QYXRoLCBuZXdNaWdyYXRpb25GaWxlKSwgdGhpcy50ZW1wbGF0ZSk7XG4gICAgICAvLyBjcmVhdGUgaW5zdGFuY2UgaW4gZGJcbiAgICAgIGF3YWl0IHRoaXMuY29ubmVjdGlvbjtcbiAgICAgIGNvbnN0IG1pZ3JhdGlvbkNyZWF0ZWQgPSBhd2FpdCBNaWdyYXRpb25Nb2RlbC5jcmVhdGUoe1xuICAgICAgICBuYW1lOiBtaWdyYXRpb25OYW1lLFxuICAgICAgICBjcmVhdGVkQXQ6IG5vd1xuICAgICAgfSk7XG4gICAgICB0aGlzLmxvZyhgQ3JlYXRlZCBtaWdyYXRpb24gJHttaWdyYXRpb25OYW1lfSBpbiAke3RoaXMubWlncmF0aW9uUGF0aH0uYCk7XG4gICAgICByZXR1cm4gbWlncmF0aW9uQ3JlYXRlZDtcbiAgICB9IGNhdGNoKGVycm9yKXtcbiAgICAgIHRoaXMubG9nKGVycm9yLnN0YWNrKTtcbiAgICAgIGZpbGVSZXF1aXJlZChlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgbWlncmF0aW9ucyB1cCB0byBvciBkb3duIHRvIGEgZ2l2ZW4gbWlncmF0aW9uIG5hbWVcbiAgICpcbiAgICogQHBhcmFtIG1pZ3JhdGlvbk5hbWVcbiAgICogQHBhcmFtIGRpcmVjdGlvblxuICAgKi9cbiAgYXN5bmMgcnVuKGRpcmVjdGlvbiA9ICd1cCcsIG1pZ3JhdGlvbk5hbWUpIHtcbiAgICBhd2FpdCB0aGlzLnN5bmMoKTtcblxuICAgIGNvbnN0IHVudGlsTWlncmF0aW9uID0gbWlncmF0aW9uTmFtZSA/XG4gICAgICBhd2FpdCBNaWdyYXRpb25Nb2RlbC5maW5kT25lKHtuYW1lOiBtaWdyYXRpb25OYW1lfSkgOlxuICAgICAgYXdhaXQgTWlncmF0aW9uTW9kZWwuZmluZE9uZSgpLnNvcnQoe2NyZWF0ZWRBdDogLTF9KTtcblxuICAgIGlmICghdW50aWxNaWdyYXRpb24pIHtcbiAgICAgIGlmIChtaWdyYXRpb25OYW1lKSB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJDb3VsZCBub3QgZmluZCB0aGF0IG1pZ3JhdGlvbiBpbiB0aGUgZGF0YWJhc2VcIik7XG4gICAgICBlbHNlIHRocm93IG5ldyBFcnJvcihcIlRoZXJlIGFyZSBubyBwZW5kaW5nIG1pZ3JhdGlvbnMuXCIpO1xuICAgIH1cblxuICAgIGxldCBxdWVyeSA9IHtcbiAgICAgIGNyZWF0ZWRBdDogeyRsdGU6IHVudGlsTWlncmF0aW9uLmNyZWF0ZWRBdH0sXG4gICAgICBzdGF0ZTogJ2Rvd24nXG4gICAgfTtcblxuICAgIGlmIChkaXJlY3Rpb24gPT0gJ2Rvd24nKSB7XG4gICAgICBxdWVyeSA9IHtcbiAgICAgICAgY3JlYXRlZEF0OiB7JGd0ZTogdW50aWxNaWdyYXRpb24uY3JlYXRlZEF0fSxcbiAgICAgICAgc3RhdGU6ICd1cCdcbiAgICAgIH07XG4gICAgfVxuXG5cbiAgICBjb25zdCBzb3J0RGlyZWN0aW9uID0gZGlyZWN0aW9uID09ICd1cCcgPyAxIDogLTE7XG4gICAgY29uc3QgbWlncmF0aW9uc1RvUnVuID0gYXdhaXQgTWlncmF0aW9uTW9kZWwuZmluZChxdWVyeSlcbiAgICAgIC5zb3J0KHtjcmVhdGVkQXQ6IHNvcnREaXJlY3Rpb259KTtcblxuICAgIGlmICghbWlncmF0aW9uc1RvUnVuLmxlbmd0aCkge1xuICAgICAgaWYgKHRoaXMuY2xpKSB7XG4gICAgICAgIHRoaXMubG9nKCdUaGVyZSBhcmUgbm8gbWlncmF0aW9ucyB0byBydW4nLnllbGxvdyk7XG4gICAgICAgIHRoaXMubG9nKGBDdXJyZW50IE1pZ3JhdGlvbnMnIFN0YXR1c2VzOiBgKTtcbiAgICAgICAgYXdhaXQgdGhpcy5saXN0KCk7XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZXJlIGFyZSBubyBtaWdyYXRpb25zIHRvIHJ1bicpO1xuICAgIH1cblxuICAgIGxldCBzZWxmID0gdGhpcztcbiAgICBsZXQgbnVtTWlncmF0aW9uc1JhbiA9IDA7XG4gICAgbGV0IG1pZ3JhdGlvbnNSYW4gPSBbXTtcblxuICAgIGZvciAoY29uc3QgbWlncmF0aW9uIG9mIG1pZ3JhdGlvbnNUb1J1bikge1xuICAgICAgY29uc3QgbWlncmF0aW9uRmlsZVBhdGggPSBwYXRoLmpvaW4oc2VsZi5taWdyYXRpb25QYXRoLCBtaWdyYXRpb24uZmlsZW5hbWUpO1xuICAgICAgY29uc3QgbW9kdWxlc1BhdGggPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vJywgJ25vZGVfbW9kdWxlcycpO1xuICAgICAgbGV0IGNvZGUgPSBmcy5yZWFkRmlsZVN5bmMobWlncmF0aW9uRmlsZVBhdGgpO1xuICAgICAgaWYgKHRoaXMuZXM2KSB7XG4gICAgICAgIHJlcXVpcmUoJ2JhYmVsLXJlZ2lzdGVyJykoe1xuICAgICAgICAgIFwicHJlc2V0c1wiOiBbcmVxdWlyZShcImJhYmVsLXByZXNldC1sYXRlc3RcIildLFxuICAgICAgICAgIFwicGx1Z2luc1wiOiBbcmVxdWlyZShcImJhYmVsLXBsdWdpbi10cmFuc2Zvcm0tcnVudGltZVwiKV1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVxdWlyZSgnYmFiZWwtcG9seWZpbGwnKTtcbiAgICAgIH1cblxuICAgICAgbGV0IG1pZ3JhdGlvbkZ1bmN0aW9ucztcblxuICAgICAgdHJ5IHtcbiAgICAgICAgbWlncmF0aW9uRnVuY3Rpb25zID0gcmVxdWlyZShtaWdyYXRpb25GaWxlUGF0aCk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgZXJyLm1lc3NhZ2UgPSBlcnIubWVzc2FnZSAmJiAvVW5leHBlY3RlZCB0b2tlbi8udGVzdChlcnIubWVzc2FnZSkgP1xuICAgICAgICAgICdVbmV4cGVjdGVkIFRva2VuIHdoZW4gcGFyc2luZyBtaWdyYXRpb24uIElmIHlvdSBhcmUgdXNpbmcgYW4gRVM2IG1pZ3JhdGlvbiBmaWxlLCB1c2Ugb3B0aW9uIC0tZXM2JyA6XG4gICAgICAgICAgZXJyLm1lc3NhZ2U7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cblxuICAgICAgaWYgKCFtaWdyYXRpb25GdW5jdGlvbnNbZGlyZWN0aW9uXSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgKGBUaGUgJHtkaXJlY3Rpb259IGV4cG9ydCBpcyBub3QgZGVmaW5lZCBpbiAke21pZ3JhdGlvbi5maWxlbmFtZX0uYC5yZWQpO1xuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSggKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGNhbGxQcm9taXNlID0gIG1pZ3JhdGlvbkZ1bmN0aW9uc1tkaXJlY3Rpb25dLmNhbGwoXG4gICAgICAgICAgICB0aGlzLmNvbm5lY3Rpb24ubW9kZWwuYmluZCh0aGlzLmNvbm5lY3Rpb24pLFxuICAgICAgICAgICAgZnVuY3Rpb24gY2FsbGJhY2soZXJyKSB7XG4gICAgICAgICAgICAgIGlmIChlcnIpIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG5cbiAgICAgICAgICBpZiAoY2FsbFByb21pc2UgJiYgdHlwZW9mIGNhbGxQcm9taXNlLnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxQcm9taXNlLnRoZW4ocmVzb2x2ZSkuY2F0Y2gocmVqZWN0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMubG9nKGAke2RpcmVjdGlvbi50b1VwcGVyQ2FzZSgpfTogICBgW2RpcmVjdGlvbiA9PSAndXAnPyAnZ3JlZW4nIDogJ3JlZCddICsgYCAke21pZ3JhdGlvbi5maWxlbmFtZX0gYCk7XG5cbiAgICAgICAgYXdhaXQgTWlncmF0aW9uTW9kZWwud2hlcmUoe25hbWU6IG1pZ3JhdGlvbi5uYW1lfSkudXBkYXRlKHskc2V0OiB7c3RhdGU6IGRpcmVjdGlvbn19KTtcbiAgICAgICAgbWlncmF0aW9uc1Jhbi5wdXNoKG1pZ3JhdGlvbi50b0pTT04oKSk7XG4gICAgICAgIG51bU1pZ3JhdGlvbnNSYW4rKztcbiAgICAgIH0gY2F0Y2goZXJyKSB7XG4gICAgICAgIHRoaXMubG9nKGBGYWlsZWQgdG8gcnVuIG1pZ3JhdGlvbiAke21pZ3JhdGlvbi5uYW1lfSBkdWUgdG8gYW4gZXJyb3IuYC5yZWQpO1xuICAgICAgICB0aGlzLmxvZyhgTm90IGNvbnRpbnVpbmcuIE1ha2Ugc3VyZSB5b3VyIGRhdGEgaXMgaW4gY29uc2lzdGVudCBzdGF0ZWAucmVkKTtcbiAgICAgICAgdGhyb3cgZXJyIGluc3RhbmNlb2YoRXJyb3IpID8gZXJyIDogbmV3IEVycm9yKGVycik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG1pZ3JhdGlvbnNUb1J1bi5sZW5ndGggPT0gbnVtTWlncmF0aW9uc1JhbikgdGhpcy5sb2coJ0FsbCBtaWdyYXRpb25zIGZpbmlzaGVkIHN1Y2Nlc3NmdWxseS4nLmdyZWVuKTtcbiAgICByZXR1cm4gbWlncmF0aW9uc1JhbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb29rcyBhdCB0aGUgZmlsZSBzeXN0ZW0gbWlncmF0aW9ucyBhbmQgaW1wb3J0cyBhbnkgbWlncmF0aW9ucyB0aGF0IGFyZVxuICAgKiBvbiB0aGUgZmlsZSBzeXN0ZW0gYnV0IG1pc3NpbmcgaW4gdGhlIGRhdGFiYXNlIGludG8gdGhlIGRhdGFiYXNlXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb25hbGl0eSBpcyBvcHBvc2l0ZSBvZiBwcnVuZSgpXG4gICAqL1xuICBhc3luYyBzeW5jKCkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBmaWxlc0luTWlncmF0aW9uRm9sZGVyID0gZnMucmVhZGRpclN5bmModGhpcy5taWdyYXRpb25QYXRoKTtcbiAgICAgIGNvbnN0IG1pZ3JhdGlvbnNJbkRhdGFiYXNlID0gYXdhaXQgTWlncmF0aW9uTW9kZWwuZmluZCh7fSk7XG4gICAgICAvLyBHbyBvdmVyIG1pZ3JhdGlvbnMgaW4gZm9sZGVyIGFuZCBkZWxldGUgYW55IGZpbGVzIG5vdCBpbiBEQlxuICAgICAgY29uc3QgbWlncmF0aW9uc0luRm9sZGVyID0gXy5maWx0ZXIoZmlsZXNJbk1pZ3JhdGlvbkZvbGRlciwgZmlsZSA9PiAvXFxkezEzLH1cXC0uKy5qcyQvLnRlc3QoZmlsZSkpXG4gICAgICAgIC5tYXAoZmlsZW5hbWUgPT4ge1xuICAgICAgICAgIGNvbnN0IGZpbGVDcmVhdGVkQXQgPSBwYXJzZUludChmaWxlbmFtZS5zcGxpdCgnLScpWzBdKTtcbiAgICAgICAgICBjb25zdCBleGlzdHNJbkRhdGFiYXNlID0gISFfLmZpbmQobWlncmF0aW9uc0luRGF0YWJhc2UsIHtjcmVhdGVkQXQ6IG5ldyBEYXRlKGZpbGVDcmVhdGVkQXQpfSk7XG4gICAgICAgICAgcmV0dXJuIHtjcmVhdGVkQXQ6IGZpbGVDcmVhdGVkQXQsIGZpbGVuYW1lLCBleGlzdHNJbkRhdGFiYXNlfTtcbiAgICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGZpbGVzTm90SW5EYiA9IF8uZmlsdGVyKG1pZ3JhdGlvbnNJbkZvbGRlciwge2V4aXN0c0luRGF0YWJhc2U6IGZhbHNlfSkubWFwKGYgPT4gZi5maWxlbmFtZSk7XG4gICAgICBsZXQgbWlncmF0aW9uc1RvSW1wb3J0ID0gZmlsZXNOb3RJbkRiO1xuICAgICAgdGhpcy5sb2coJ1N5bmNocm9uaXppbmcgZGF0YWJhc2Ugd2l0aCBmaWxlIHN5c3RlbSBtaWdyYXRpb25zLi4uJyk7XG4gICAgICBpZiAoIXRoaXMuYXV0b3N5bmMgJiYgbWlncmF0aW9uc1RvSW1wb3J0Lmxlbmd0aCkge1xuICAgICAgICBjb25zdCBhbnN3ZXJzID0gYXdhaXQgbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICAgICAgICBhc2sucHJvbXB0KHtcbiAgICAgICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgICAgICBtZXNzYWdlOiAnVGhlIGZvbGxvd2luZyBtaWdyYXRpb25zIGV4aXN0IGluIHRoZSBtaWdyYXRpb25zIGZvbGRlciBidXQgbm90IGluIHRoZSBkYXRhYmFzZS4gU2VsZWN0IHRoZSBvbmVzIHlvdSB3YW50IHRvIGltcG9ydCBpbnRvIHRoZSBkYXRhYmFzZScsXG4gICAgICAgICAgICBuYW1lOiAnbWlncmF0aW9uc1RvSW1wb3J0JyxcbiAgICAgICAgICAgIGNob2ljZXM6IGZpbGVzTm90SW5EYlxuICAgICAgICAgIH0sIChhbnN3ZXJzKSA9PiB7XG4gICAgICAgICAgICByZXNvbHZlKGFuc3dlcnMpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBtaWdyYXRpb25zVG9JbXBvcnQgPSBhbnN3ZXJzLm1pZ3JhdGlvbnNUb0ltcG9ydDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIFByb21pc2UubWFwKG1pZ3JhdGlvbnNUb0ltcG9ydCwgKG1pZ3JhdGlvblRvSW1wb3J0KSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKHRoaXMubWlncmF0aW9uUGF0aCwgbWlncmF0aW9uVG9JbXBvcnQpLFxuICAgICAgICAgIHRpbWVzdGFtcFNlcGFyYXRvckluZGV4ID0gbWlncmF0aW9uVG9JbXBvcnQuaW5kZXhPZignLScpLFxuICAgICAgICAgIHRpbWVzdGFtcCA9IG1pZ3JhdGlvblRvSW1wb3J0LnNsaWNlKDAsIHRpbWVzdGFtcFNlcGFyYXRvckluZGV4KSxcbiAgICAgICAgICBtaWdyYXRpb25OYW1lID0gbWlncmF0aW9uVG9JbXBvcnQuc2xpY2UodGltZXN0YW1wU2VwYXJhdG9ySW5kZXggKyAxLCBtaWdyYXRpb25Ub0ltcG9ydC5sYXN0SW5kZXhPZignLicpKTtcblxuICAgICAgICB0aGlzLmxvZyhgQWRkaW5nIG1pZ3JhdGlvbiAke2ZpbGVQYXRofSBpbnRvIGRhdGFiYXNlIGZyb20gZmlsZSBzeXN0ZW0uIFN0YXRlIGlzIGAgKyBgRE9XTmAucmVkKTtcbiAgICAgICAgY29uc3QgY3JlYXRlZE1pZ3JhdGlvbiA9IE1pZ3JhdGlvbk1vZGVsLmNyZWF0ZSh7XG4gICAgICAgICAgbmFtZTogbWlncmF0aW9uTmFtZSxcbiAgICAgICAgICBjcmVhdGVkQXQ6IHRpbWVzdGFtcFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZWRNaWdyYXRpb247XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhpcy5sb2coYENvdWxkIG5vdCBzeW5jaHJvbmlzZSBtaWdyYXRpb25zIGluIHRoZSBtaWdyYXRpb25zIGZvbGRlciB1cCB0byB0aGUgZGF0YWJhc2UuYC5yZWQpO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE9wcG9zaXRlIG9mIHN5bmMoKS5cbiAgICogUmVtb3ZlcyBmaWxlcyBpbiBtaWdyYXRpb24gZGlyZWN0b3J5IHdoaWNoIGRvbid0IGV4aXN0IGluIGRhdGFiYXNlLlxuICAgKi9cbiAgYXN5bmMgcHJ1bmUoKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGZpbGVzSW5NaWdyYXRpb25Gb2xkZXIgPSBmcy5yZWFkZGlyU3luYyh0aGlzLm1pZ3JhdGlvblBhdGgpO1xuICAgICAgY29uc3QgbWlncmF0aW9uc0luRGF0YWJhc2UgPSBhd2FpdCBNaWdyYXRpb25Nb2RlbC5maW5kKHt9KS5sZWFuKCk7XG4gICAgICAvLyBHbyBvdmVyIG1pZ3JhdGlvbnMgaW4gZm9sZGVyIGFuZCBkZWxldGUgYW55IGZpbGVzIG5vdCBpbiBEQlxuICAgICAgY29uc3QgbWlncmF0aW9uc0luRm9sZGVyID0gXy5maWx0ZXIoZmlsZXNJbk1pZ3JhdGlvbkZvbGRlciwgZmlsZSA9PiAvXFxkezEzLH1cXC0uKy5qcy8udGVzdChmaWxlKSApXG4gICAgICAgIC5tYXAoZmlsZW5hbWUgPT4ge1xuICAgICAgICAgIGNvbnN0IGZpbGVDcmVhdGVkQXQgPSBwYXJzZUludChmaWxlbmFtZS5zcGxpdCgnLScpWzBdKTtcbiAgICAgICAgICBjb25zdCBleGlzdHNJbkRhdGFiYXNlID0gISFfLmZpbmQobWlncmF0aW9uc0luRGF0YWJhc2UsIHsgY3JlYXRlZEF0OiBuZXcgRGF0ZShmaWxlQ3JlYXRlZEF0KSB9KTtcbiAgICAgICAgICByZXR1cm4geyBjcmVhdGVkQXQ6IGZpbGVDcmVhdGVkQXQsIGZpbGVuYW1lLCAgZXhpc3RzSW5EYXRhYmFzZSB9O1xuICAgICAgICB9KTtcblxuICAgICAgY29uc3QgZGJNaWdyYXRpb25zTm90T25GcyA9IF8uZmlsdGVyKG1pZ3JhdGlvbnNJbkRhdGFiYXNlLCBtID0+IHtcbiAgICAgICAgcmV0dXJuICFfLmZpbmQobWlncmF0aW9uc0luRm9sZGVyLCB7IGZpbGVuYW1lOiBtLmZpbGVuYW1lIH0pXG4gICAgICB9KTtcblxuXG4gICAgICBsZXQgbWlncmF0aW9uc1RvRGVsZXRlID0gZGJNaWdyYXRpb25zTm90T25Gcy5tYXAoIG0gPT4gbS5uYW1lICk7XG5cbiAgICAgIGlmICghdGhpcy5hdXRvc3luYyAmJiAhIW1pZ3JhdGlvbnNUb0RlbGV0ZS5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgYW5zd2VycyA9IGF3YWl0IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgICAgICAgYXNrLnByb21wdCh7XG4gICAgICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICAgICAgbWVzc2FnZTogJ1RoZSBmb2xsb3dpbmcgbWlncmF0aW9ucyBleGlzdCBpbiB0aGUgZGF0YWJhc2UgYnV0IG5vdCBpbiB0aGUgbWlncmF0aW9ucyBmb2xkZXIuIFNlbGVjdCB0aGUgb25lcyB5b3Ugd2FudCB0byByZW1vdmUgZnJvbSB0aGUgZmlsZSBzeXN0ZW0uJyxcbiAgICAgICAgICAgIG5hbWU6ICdtaWdyYXRpb25zVG9EZWxldGUnLFxuICAgICAgICAgICAgY2hvaWNlczogbWlncmF0aW9uc1RvRGVsZXRlXG4gICAgICAgICAgfSwgKGFuc3dlcnMpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUoYW5zd2Vycyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG1pZ3JhdGlvbnNUb0RlbGV0ZSA9IGFuc3dlcnMubWlncmF0aW9uc1RvRGVsZXRlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBtaWdyYXRpb25zVG9EZWxldGVEb2NzID0gYXdhaXQgTWlncmF0aW9uTW9kZWxcbiAgICAgICAgLmZpbmQoe1xuICAgICAgICAgIG5hbWU6IHsgJGluOiBtaWdyYXRpb25zVG9EZWxldGUgfVxuICAgICAgICB9KS5sZWFuKCk7XG5cbiAgICAgIGlmIChtaWdyYXRpb25zVG9EZWxldGUubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMubG9nKGBSZW1vdmluZyBtaWdyYXRpb24ocykgYCwgYCR7bWlncmF0aW9uc1RvRGVsZXRlLmpvaW4oJywgJyl9YC5jeWFuLCBgIGZyb20gZGF0YWJhc2VgKTtcbiAgICAgICAgYXdhaXQgTWlncmF0aW9uTW9kZWwucmVtb3ZlKHtcbiAgICAgICAgICBuYW1lOiB7ICRpbjogbWlncmF0aW9uc1RvRGVsZXRlIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBtaWdyYXRpb25zVG9EZWxldGVEb2NzO1xuICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgIHRoaXMubG9nKGBDb3VsZCBub3QgcHJ1bmUgZXh0cmFuZW91cyBtaWdyYXRpb25zIGZyb20gZGF0YWJhc2UuYC5yZWQpO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIExpc3RzIHRoZSBjdXJyZW50IG1pZ3JhdGlvbnMgYW5kIHRoZWlyIHN0YXR1c2VzXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPEFycmF5PE9iamVjdD4+fVxuICAgKiBAZXhhbXBsZVxuICAgKiAgIFtcbiAgICogICAgeyBuYW1lOiAnbXktbWlncmF0aW9uJywgZmlsZW5hbWU6ICcxNDkyMTMyMjM0MjRfbXktbWlncmF0aW9uLmpzJywgc3RhdGU6ICd1cCcgfSxcbiAgICogICAgeyBuYW1lOiAnYWRkLWNvd3MnLCBmaWxlbmFtZTogJzE0OTIxMzIyMzQ1M19hZGQtY293cy5qcycsIHN0YXRlOiAnZG93bicgfVxuICAgKiAgIF1cbiAgICovXG4gIGFzeW5jIGxpc3QoKSB7XG4gICAgYXdhaXQgdGhpcy5zeW5jKCk7XG4gICAgY29uc3QgbWlncmF0aW9ucyA9IGF3YWl0IE1pZ3JhdGlvbk1vZGVsLmZpbmQoKS5zb3J0KHsgY3JlYXRlZEF0OiAxIH0pO1xuICAgIGlmICghbWlncmF0aW9ucy5sZW5ndGgpIHRoaXMubG9nKCdUaGVyZSBhcmUgbm8gbWlncmF0aW9ucyB0byBsaXN0LicueWVsbG93KTtcbiAgICByZXR1cm4gbWlncmF0aW9ucy5tYXAoKG0pID0+IHtcbiAgICAgIHRoaXMubG9nKFxuICAgICAgICBgJHttLnN0YXRlID09ICd1cCcgPyAnVVA6ICBcXHQnIDogJ0RPV046XFx0J31gW20uc3RhdGUgPT0gJ3VwJz8gJ2dyZWVuJyA6ICdyZWQnXSArXG4gICAgICAgIGAgJHttLmZpbGVuYW1lfWBcbiAgICAgICk7XG4gICAgICByZXR1cm4gbS50b0pTT04oKTtcbiAgICB9KTtcbiAgfVxufVxuXG5cblxuZnVuY3Rpb24gZmlsZVJlcXVpcmVkKGVycm9yKSB7XG4gIGlmIChlcnJvciAmJiBlcnJvci5jb2RlID09ICdFTk9FTlQnKSB7XG4gICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGBDb3VsZCBub3QgZmluZCBhbnkgZmlsZXMgYXQgcGF0aCAnJHtlcnJvci5wYXRofSdgKTtcbiAgfVxufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gTWlncmF0b3I7XG5cbiJdfQ==