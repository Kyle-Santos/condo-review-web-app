//Columns:
//  id - indicates the href.
//  name - indicates the name of condo.
//  address - the address of the condo
//  rating - the average rating of the condo
//  img - the path of the condo image
//  description - the brief info of the condo
function getDataCondo(){
    const fs = require('fs');
	let rawdata = fs.readFileSync('./data/DataCondo.json');
	return JSON.parse(rawdata);
}

module.exports.getDataCondo = getDataCondo;