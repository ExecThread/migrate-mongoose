'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var collection = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'migrations';
  var dbConnection = arguments[1];


  var MigrationSchema = new _mongoose.Schema({
    name: String,
    createdAt: Date,
    state: {
      type: String,
      enum: ['down', 'up'],
      default: 'down'
    }
  }, {
    collection: collection,
    toJSON: {
      virtuals: true,
      transform: function transform(doc, ret, options) {
        delete ret._id;
        delete ret.id;
        delete ret.__v;
        return ret;
      }
    }
  });

  MigrationSchema.virtual('filename').get(function () {
    return this.createdAt.getTime() + '-' + this.name + '.js';
  });

  dbConnection.on('error', function (err) {
    console.error('MongoDB Connection Error: ' + err);
  });

  return dbConnection.model(collection, MigrationSchema);
};

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Factory function for a mongoose model
_mongoose2.default.Promise = _bluebird2.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kYi5qcyJdLCJuYW1lcyI6WyJjb2xsZWN0aW9uIiwiZGJDb25uZWN0aW9uIiwiTWlncmF0aW9uU2NoZW1hIiwibmFtZSIsIlN0cmluZyIsImNyZWF0ZWRBdCIsIkRhdGUiLCJzdGF0ZSIsInR5cGUiLCJlbnVtIiwiZGVmYXVsdCIsInRvSlNPTiIsInZpcnR1YWxzIiwidHJhbnNmb3JtIiwiZG9jIiwicmV0Iiwib3B0aW9ucyIsIl9pZCIsImlkIiwiX192IiwidmlydHVhbCIsImdldCIsImdldFRpbWUiLCJvbiIsImNvbnNvbGUiLCJlcnJvciIsImVyciIsIm1vZGVsIiwiUHJvbWlzZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O2tCQUtlLFlBQXFEO0FBQUEsTUFBMUNBLFVBQTBDLHVFQUE3QixZQUE2QjtBQUFBLE1BQWZDLFlBQWU7OztBQUVsRSxNQUFNQyxrQkFBa0IscUJBQVc7QUFDakNDLFVBQU1DLE1BRDJCO0FBRWpDQyxlQUFXQyxJQUZzQjtBQUdqQ0MsV0FBTztBQUNMQyxZQUFNSixNQUREO0FBRUxLLFlBQU0sQ0FBQyxNQUFELEVBQVMsSUFBVCxDQUZEO0FBR0xDLGVBQVM7QUFISjtBQUgwQixHQUFYLEVBUXJCO0FBQ0RWLGdCQUFZQSxVQURYO0FBRURXLFlBQVE7QUFDTkMsZ0JBQVUsSUFESjtBQUVOQyxpQkFBVyxtQkFBU0MsR0FBVCxFQUFjQyxHQUFkLEVBQW1CQyxPQUFuQixFQUE0QjtBQUNyQyxlQUFPRCxJQUFJRSxHQUFYO0FBQ0EsZUFBT0YsSUFBSUcsRUFBWDtBQUNBLGVBQU9ILElBQUlJLEdBQVg7QUFDQSxlQUFPSixHQUFQO0FBQ0Q7QUFQSztBQUZQLEdBUnFCLENBQXhCOztBQXFCQWIsa0JBQWdCa0IsT0FBaEIsQ0FBd0IsVUFBeEIsRUFBb0NDLEdBQXBDLENBQXdDLFlBQVc7QUFDakQsV0FBVSxLQUFLaEIsU0FBTCxDQUFlaUIsT0FBZixFQUFWLFNBQXNDLEtBQUtuQixJQUEzQztBQUNELEdBRkQ7O0FBSUFGLGVBQWFzQixFQUFiLENBQWdCLE9BQWhCLEVBQXlCLGVBQU87QUFDOUJDLFlBQVFDLEtBQVIsZ0NBQTJDQyxHQUEzQztBQUNELEdBRkQ7O0FBSUEsU0FBT3pCLGFBQWEwQixLQUFiLENBQW9CM0IsVUFBcEIsRUFBZ0NFLGVBQWhDLENBQVA7QUFDRCxDOztBQXJDRDs7OztBQUNBOzs7Ozs7QUFDQTtBQUNBLG1CQUFTMEIsT0FBVCIsImZpbGUiOiJkYi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtb25nb29zZSwgeyBTY2hlbWEgfSAgZnJvbSAnbW9uZ29vc2UnO1xuaW1wb3J0IFByb21pc2UgZnJvbSAnYmx1ZWJpcmQnO1xuLy8gRmFjdG9yeSBmdW5jdGlvbiBmb3IgYSBtb25nb29zZSBtb2RlbFxubW9uZ29vc2UuUHJvbWlzZSA9IFByb21pc2U7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uICggY29sbGVjdGlvbiA9ICdtaWdyYXRpb25zJywgZGJDb25uZWN0aW9uICkge1xuXG4gIGNvbnN0IE1pZ3JhdGlvblNjaGVtYSA9IG5ldyBTY2hlbWEoe1xuICAgIG5hbWU6IFN0cmluZyxcbiAgICBjcmVhdGVkQXQ6IERhdGUsXG4gICAgc3RhdGU6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGVudW06IFsnZG93bicsICd1cCddLFxuICAgICAgZGVmYXVsdDogJ2Rvd24nXG4gICAgfVxuICB9LCB7XG4gICAgY29sbGVjdGlvbjogY29sbGVjdGlvbixcbiAgICB0b0pTT046IHtcbiAgICAgIHZpcnR1YWxzOiB0cnVlLFxuICAgICAgdHJhbnNmb3JtOiBmdW5jdGlvbihkb2MsIHJldCwgb3B0aW9ucykge1xuICAgICAgICBkZWxldGUgcmV0Ll9pZDtcbiAgICAgICAgZGVsZXRlIHJldC5pZDtcbiAgICAgICAgZGVsZXRlIHJldC5fX3Y7XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBNaWdyYXRpb25TY2hlbWEudmlydHVhbCgnZmlsZW5hbWUnKS5nZXQoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGAke3RoaXMuY3JlYXRlZEF0LmdldFRpbWUoKX0tJHt0aGlzLm5hbWV9LmpzYDtcbiAgfSk7XG5cbiAgZGJDb25uZWN0aW9uLm9uKCdlcnJvcicsIGVyciA9PiB7XG4gICAgY29uc29sZS5lcnJvcihgTW9uZ29EQiBDb25uZWN0aW9uIEVycm9yOiAke2Vycn1gKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRiQ29ubmVjdGlvbi5tb2RlbCggY29sbGVjdGlvbiwgTWlncmF0aW9uU2NoZW1hICk7XG59XG5cbiJdfQ==