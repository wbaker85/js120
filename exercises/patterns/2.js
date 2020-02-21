/*
Input:
  An Object
  Name of method on the object - a string
  Additional arguments to pass on

Output: A reference to the same function

*/

function delegate(obj, methodName, ...args) {
  return function() {
    return obj[methodName](...args);
  };
}

let foo = {
  name: 'test',
  bar: function(greeting) {
    console.log(greeting + ' ' + this.name);
  },
};

let baz = {
  qux: delegate(foo, 'bar', 'hello'),
};

baz.qux();   // logs 'hello test';

foo.bar = function() {
  console.log('changed');
};

baz.qux();          // logs 'changed'