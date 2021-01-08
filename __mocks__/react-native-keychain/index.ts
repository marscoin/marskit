const keychainMock = {
	SECURITY_LEVEL_ANY: "MOCK_SECURITY_LEVEL_ANY",
	SECURITY_LEVEL_SECURE_SOFTWARE: "MOCK_SECURITY_LEVEL_SECURE_SOFTWARE",
	SECURITY_LEVEL_SECURE_HARDWARE: "MOCK_SECURITY_LEVEL_SECURE_HARDWARE",
	setGenericPassword: jest.fn().mockResolvedValue(true),
	getGenericPassword: jest.fn().mockResolvedValue("123"),
	resetGenericPassword: jest.fn().mockResolvedValue(true),
}

export default keychainMock;
