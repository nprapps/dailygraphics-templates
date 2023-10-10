var fs = require("fs")
var path = require("path");

// Get this key list from terminal output after running index.html
let keyList = [ 
  { key: 'nipper' } 
]


// create generated folder if it doesn't exist
try {
  if (!fs.existsSync("generated")) {
    fs.mkdirSync("generated");
  }
} catch (err) {
  console.error(err);
}

// generate a template for each key
for (var i = 0; i < keyList.length; i++) {
  generateTemplate(keyList[i]);
}

async function generateTemplate(data) {
  try {    
    var template = await include(".","_photoIndex.html");
    
    let key = data.key;
    let content = template.replace("%%key%%",key)

    await fs.promises.writeFile(`./generated/${key}.html`, content);

  } catch (err) {
    console.log(err);
  }
}

async function include(dir,file) {
  var f = path.join(dir, file);
  return fs.promises.readFile(f,"utf-8")
}
