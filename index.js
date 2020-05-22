const path = require('path');
const express = require('express');

let app = express();

app.use(express.static(path.join(__dirname,'build','contracts')));
app.use(express.static(path.join(__dirname,'src')));
app.use(express.static(path.join(__dirname,'node_modules','@truffle','contract','dist')))
app.use(express.static(path.join(__dirname,'node_modules','web3','dist')));
app.use(express.static(path.join(__dirname,'node_modules','truffle-hdwallet-provider','dist')));

app.get('/',(req,res)=>{
	res.status(200).sendFile(path.join(__dirname,'src','index.html'));
})

app.listen(3000,(error)=>{
	if(error)
		console.error(error);
	else
		console.log('server listening at port number 3000');
})