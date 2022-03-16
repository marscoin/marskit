export class MMKV {
	private __INTERNAL_MOCK_STORAGE__: {[key: string]: string;} = {}

	set(key: string, value: string): void {
		this.__INTERNAL_MOCK_STORAGE__[key] = value;
	}

	getString(key: string): string {
		return this.__INTERNAL_MOCK_STORAGE__[key];
	}

	delete(key: string): void {
		delete this.__INTERNAL_MOCK_STORAGE__[key];
	}
}
