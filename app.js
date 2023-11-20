const fs = require('fs');
const pg = require('pg');
const https = require('https');

const config = {
	connectionString:
	'postgres://candidate:62I8anq3cFq5GYh2u4Lh@rc1b-r21uoagjy1t7k77h.mdb.yandexcloud.net:6432/db1',
	ssl: {
		rejectUnauthorized: true,
		ca: fs
			.readFileSync('/home/vboxuser/.postgresql/root.crt', 'utf8'),
	},
};
let arr = [];

async function run() {
	const conn = new pg.Client(config);
	await conn.connect();
	await conn.query('SELECT version()');
	await conn.query('DROP TABLE IF EXISTS RaicherVictor');
	await new Promise((resolve, reject) => {
		https.get('https://rickandmortyapi.com/api/character', (resp) => {
			const data = [];
			resp.on('data', (chunk) => {
				data.push(chunk);
			});
			resp.on('end', () => {
				const buff = Buffer.concat(data);
				const obj = JSON.parse(buff);
				arr = obj.results;
				resolve();
			});
		}).on('error', (err) => {
			reject(err);
		});
	});
	await conn.query('CREATE TABLE RaicherVictor(id serial PRIMARY KEY,name text,data jsonb)');
	const comm = 'INSERT INTO RaicherVictor(name,data) VALUES($1, $2)';
	console.log(comm);
	for (let i = 0; i < arr.length; i++) {
		const nam = arr[i].name;
		const buff = arr[i];
		await conn.query(comm, [nam, buff]);
	}
	console.log((await conn.query('SELECT * FROM RaicherVictor;')).rows);
	await conn.end();
}
run().catch(console.err);
