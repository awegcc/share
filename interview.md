https://github.com/jimuyouyou/node-interview-questions  

#### 1. output of this piece js code
```js
var User = {
  count: 1,
  getCount: function() {
    return this.count;
  }
};
console.log(User.getCount());
var func = User.getCount;
console.log(func());
```

#### 2. rewrite this piece of code without keywords class
```js
class animal {
  constructor(name='animal') { this.name=name; }
  dead() {console.log(this.name+':bye');}
}
 
class person extends animal {
  constructor(age=22, name) { super(name); this.age=age; }
  say() { console.log(this.name+":"+this.age); }
}
var p = new person();
```

#### 3. nodejs this

http://www.newhappy.com.cn/?p=393


#### 3. exports vs module.exports

http://www.newhappy.com.cn/?p=388

