import { decodeQRData } from '../src/utils/scanner';

describe('QR codes', () => {
	it('decodes a testnet lightning URI', async () => {
		const res = await decodeQRData(
			'lightning:lntb15u1p07ndhnpp5vzzd669p84zt9gx8r7z79lk4kfwh4dyutgswvhv2zlgpgqt8tfksdq4xysyymr0vd4kzcmrd9hx7cqp7xqrrss9qy9qsqsp5gsztzg7cjuz0eh32w03rekff43gx783lw2rx3855hvv6v5zg95jqr0al7wkckk2huef8pxg0rl58mtur6jxcrlt4ym4n7gg0unv72pmjsas4h0qljk5u4sg2m7kcwrra3j08lpaegavkmm438ghypyg77xgqgusvxj',
		);
		expect(res.isOk()).toEqual(true);
		if (res.isOk()) {
			const qrData = res.value[0];
			expect(qrData.network).toEqual('bitcoinTestnet');
			expect(qrData.qrDataType).toEqual('lightningPaymentRequest');
			expect(qrData.sats).toEqual(123);
			expect(qrData.message).toEqual('Dummy description');
		}
	});

	it('decodes a plain mainnet lightning invoice', async () => {
		const res = await decodeQRData(
			'lnbc50u1p07needpp5z5r6gy8e9ycchknr2zugn5wny5cgwdfgpuh8kgurrlt56h4c5eeqdzc235x2gzzd9azcgznv4shxmmwyqcjcgz9wp5hxmmyv5sryzj8v938y6t9dss9x6rpwp5hymc2yq34gv6nxqc52vpjcqzpgfppqkk0vs43wzsundw37f8xslw69eddwfe24sp5szfhqg07tk0mscdtv3ganxtfpr8un0w6zqwmpma9cjlp42a5xr5s9qy9qsqf053mzk3jmygprrnphshscxvxhmwsrgcjk9z0tghc9ttfcls6ywksrqlcgq83rkldu2kyg74xq2d6u6d3w03hupgqta2lgze9naza4cpy7m6nq',
		);
		expect(res.isOk()).toEqual(true);
		if (res.isOk()) {
			const qrData = res.value[0];
			expect(qrData.network).toEqual('bitcoin');
			expect(qrData.qrDataType).toEqual('lightningPaymentRequest');
			expect(qrData.sats).toEqual(123);
			expect(qrData.message).toEqual('Dummy description');
		}
	});

	it('decodes a bitcoin URI with params', async () => {
		const res = await decodeQRData(
			'bitcoin:1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ?amount=0.0005&label=Nakamoto&message=Donation%20for%20project%20xyz',
		);
		expect(res.isOk()).toEqual(true);
		if (res.isOk()) {
			const qrData = res.value[0];
			expect(qrData.network).toEqual('bitcoin');
			expect(qrData.qrDataType).toEqual('bitcoinAddress');
			expect(qrData.sats).toEqual(50000);
			expect(qrData.label).toEqual('Nakamoto');
			expect(qrData.message).toEqual('Donation for project xyz');
		}
	});

	it('decodes a bitcoin legacy address URI', async () => {
		const res = await decodeQRData(
			'bitcoin:1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ',
		);
		expect(res.isOk()).toEqual(true);
		if (res.isOk()) {
			const qrData = res.value[0];
			expect(qrData.network).toEqual('bitcoin');
			expect(qrData.qrDataType).toEqual('bitcoinAddress');
		}
	});

	it('decodes a bitcoin wrapped segwit address URI', async () => {
		const res = await decodeQRData(
			'bitcoin:3DrziWGfPSYWZpmGxL4WytNeXA2mwzEwWJ',
		);
		expect(res.isOk()).toEqual(true);
		if (res.isOk()) {
			const qrData = res.value[0];
			expect(qrData.network).toEqual('bitcoin');
			expect(qrData.qrDataType).toEqual('bitcoinAddress');
		}
	});

	it('decodes a plain bitcoin native segwit address', async () => {
		const res = await decodeQRData(
			'bitcoin:bc1qkk0vs43wzsundw37f8xslw69eddwfe24w9pyrg',
		);
		expect(res.isOk()).toEqual(true);
		if (res.isOk()) {
			const qrData = res.value[0];
			expect(qrData.network).toEqual('bitcoin');
			expect(qrData.qrDataType).toEqual('bitcoinAddress');
		}
	});

	it('decodes a plain bitcoin native segwit address', async () => {
		const res = await decodeQRData(
			'bc1qkk0vs43wzsundw37f8xslw69eddwfe24w9pyrg',
		);
		expect(res.isOk()).toEqual(true);
		if (res.isOk()) {
			const qrData = res.value[0];
			expect(qrData.network).toEqual('bitcoin');
			expect(qrData.qrDataType).toEqual('bitcoinAddress');
		}
	});

	it('decodes a bitcoin URI with lightning invoice param', async () => {
		const res = await decodeQRData(
			'bitcoin:bc1qtmcxrter6q2y684l57tsl99nt2hy3p2ldhv4ef?lightning=lnbc50u1p07kst3pp5skxdnhks6gq0k6qnfuxq2rfe02ccw4xsamrvm5t29lxxv0kcda8qdzj235x2gzzd9azcgznv4shxmmwyqcjcgz9wp5hxmmyv5srzzjpw4ehg6twypyxjmrvpgszx4pn2vcrz3fsxycqzpgfppqtmcxrter6q2y684l57tsl99nt2hy3p2lsp5h6hpvmunnavh2tycm45nuzj4t0fsmjk5letzeeg443nkqljuh2tq9qy9qsqlrpm7k6ec87npcz4kx67xs5apv7f9kq4jd63nwumxr90kttvgt08pzpsqw0h8548k7p6xt0ekk54f896jjn688fnult3syjm5yy9uscpg3ve5y',
		);
		expect(res.isOk()).toEqual(true);
		if (res.isOk()) {
			const qrDataBitcoin = res.value[0];
			expect(qrDataBitcoin.network).toEqual('bitcoin');
			expect(qrDataBitcoin.qrDataType).toEqual('bitcoinAddress');

			const qrDataLightning = res.value[1];
			expect(qrDataLightning.network).toEqual('bitcoin');
			expect(qrDataLightning.qrDataType).toEqual('lightningPaymentRequest');
			expect(qrDataLightning.sats).toEqual(123);
			expect(qrDataLightning.message).toEqual('Dummy description');
		}
	});
});
