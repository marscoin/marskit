import { decodeQRData } from '../src/utils/scanner';

describe('decodes payment QR codes', () => {
	it('decodes a lightning URI', async () => {
		const res = await decodeQRData(
			'lightning:lntb15u1p07ndhnpp5vzzd669p84zt9gx8r7z79lk4kfwh4dyutgswvhv2zlgpgqt8tfksdq4xysyymr0vd4kzcmrd9hx7cqp7xqrrss9qy9qsqsp5gsztzg7cjuz0eh32w03rekff43gx783lw2rx3855hvv6v5zg95jqr0al7wkckk2huef8pxg0rl58mtur6jxcrlt4ym4n7gg0unv72pmjsas4h0qljk5u4sg2m7kcwrra3j08lpaegavkmm438ghypyg77xgqgusvxj',
		);
		expect(res.isOk()).toEqual(true);
		if (res.isOk()) {
			expect(res.value).toEqual(['lightning']);
		}
	});

	it('decodes a plain lightning invoice', async () => {
		const res = await decodeQRData(
			'lntb15u1p07ndhnpp5vzzd669p84zt9gx8r7z79lk4kfwh4dyutgswvhv2zlgpgqt8tfksdq4xysyymr0vd4kzcmrd9hx7cqp7xqrrss9qy9qsqsp5gsztzg7cjuz0eh32w03rekff43gx783lw2rx3855hvv6v5zg95jqr0al7wkckk2huef8pxg0rl58mtur6jxcrlt4ym4n7gg0unv72pmjsas4h0qljk5u4sg2m7kcwrra3j08lpaegavkmm438ghypyg77xgqgusvxj',
		);
		expect(res.isOk()).toEqual(true);
		if (res.isOk()) {
			expect(res.value).toEqual(['lightning']);
		}
	});

	it('decodes a bitcoin URI', async () => {
		const res = await decodeQRData(
			'bitcoin:175tWpb8K1S7NmH4Zx6rewF9WQrcZv245W?amount=50&label=Luke-Jr&message=Donation%20for%20project%20xyz',
		);
		expect(res.isOk()).toEqual(true);
		if (res.isOk()) {
			expect(res.value).toEqual(['bitcoin']);
		}
	});

	it('decodes a plain bitcoin address', async () => {
		const res = await decodeQRData('175tWpb8K1S7NmH4Zx6rewF9WQrcZv245W');
		expect(res.isOk()).toEqual(true);
		if (res.isOk()) {
			expect(res.value).toEqual(['bitcoin']);
		}
	});

	it('decodes a bitcoin URI with lightning invoice param', async () => {
		const res = await decodeQRData(
			'bitcoin:bc1qkk0vs43wzsundw37f8xslw69eddwfe24w9pyrg?lightning=lnbc50u1p07needpp5z5r6gy8e9ycchknr2zugn5wny5cgwdfgpuh8kgurrlt56h4c5eeqdzc235x2gzzd9azcgznv4shxmmwyqcjcgz9wp5hxmmyv5sryzj8v938y6t9dss9x6rpwp5hymc2yq34gv6nxqc52vpjcqzpgfppqkk0vs43wzsundw37f8xslw69eddwfe24sp5szfhqg07tk0mscdtv3ganxtfpr8un0w6zqwmpma9cjlp42a5xr5s9qy9qsqf053mzk3jmygprrnphshscxvxhmwsrgcjk9z0tghc9ttfcls6ywksrqlcgq83rkldu2kyg74xq2d6u6d3w03hupgqta2lgze9naza4cpy7m6nq',
		);
		expect(res.isOk()).toEqual(true);
		if (res.isOk()) {
			expect(res.value).toEqual(['bitcoin', 'lightning']);
		}
	});
});
