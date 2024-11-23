//GLOBAL STATUS
exports.STATUS_CODES = {
	// 1XX INFORMATIONAL
	CONTINUE: 100,
	SWITCHING_PROTOCOLS: 101,

	// 2XX SUCCESS
	SUCCESS: 200,
	CREATED: 201,

	// 3XX REDIRECTION
	MOVED_PERMANENTLY: 301,
	FOUND: 302,

	// 4XX CLIENT ERROR
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	NOT_FOUND: 404,

	// 5XX SERVER ERROR
	SERVER_ERROR: 500,
	NOT_IMPLEMENTED: 501,
	BAD_GATEWAY: 502,
};

exports.PATHS = {
	IMAGES: {
		USER_PROFILE: "/Users",
	},
};

exports.ENVIRONMENTS = {
	DEVELOPMENT: "development",
	STAGING: "staging",
	PRODUCTION: "production",
};

exports.USER_TYPE = {
	USER: "USER",
};

exports.DEVICE_TYPE = {
	ANDROID: "ANDROID",
	IOS: "IOS",
	WEB: "WEB",
};

exports.VEHICLE_TYPE = {
	BIKE: "BIKE",
	CAR: "CAR",
};

exports.AUTHTYPES = {
	GOOGLE: "google",
	FACEBOOK: "facebook",
	APPLE: "apple",
	MOBILE: "mobile",
};

exports.IMAGE_KEYS = {
	CATEGORY: "category",
	CAR: "car",
	BIKE: "bike",
	ITEM: "item",
};
