const bcrypt = require('bcryptjs');

const hashFromDb = '$2b$10$BB85SLXsJ/3QsHiz/0iZoeXjUoA03AjfocsrnQApix32HFIHjYcOW';

console.log('compare 123456 =>', bcrypt.compareSync('123456', hashFromDb));
console.log('compare 123456 ' , bcrypt.compareSync('123456 ', hashFromDb)); // con espacio
console.log('compare 123456\n', bcrypt.compareSync('123456\n', hashFromDb)); // con salto
