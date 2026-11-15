// Load the deployed script files in document order for the DOM boundary tests.
const fs=require('node:fs'),path=require('node:path');
module.exports=()=>fs.readFileSync(path.join(__dirname,'../web/index.html'),'utf8').replace(/<script([^>]*?) src="([^"]+)"><\/script>/g,(_,attrs,src)=>`<script${attrs}>${fs.readFileSync(path.join(__dirname,'../web',src),'utf8')}</script>`);
