// config used by server side only
const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = process.env.DB_PORT || 27017;
const dbName = process.env.DB_NAME || 'shop';
const dbUser = process.env.DB_USER || '';
const dbPass = process.env.DB_PASS || '';
const dbCred =
	dbUser.length > 0 || dbPass.length > 0 ? `${dbUser}:${dbPass}@` : '';

const dbUrl =
	process.env.DB_URL || `mongodb://${dbCred}${dbHost}:${dbPort}/${dbName}`;

module.exports = {
	// used by Store (server side)
	apiBaseUrl: `https://rentklub-hugesean.c9users.io:8081/api/v1`,

	// used by Store (server and client side)
	ajaxBaseUrl: `https://rentklub-hugesean.c9users.io:8081/ajax`,

	// Access-Control-Allow-Origin
	storeBaseUrl: '*',

	// used by API to service assets
	assetsBaseURL: process.env.ASSETS_BASE_URL || '',

	// used by API
	adminBaseURL: process.env.ADMIN_BASE_URL || 'https://rentklub-frontend-hugesean.c9users.io:8081',
	adminLoginPath: process.env.ADMIN_LOGIN_PATH || '/admin/login',

	apiListenPort: 8081,
	storeListenPort: 8080,

	// used by API
	mongodbServerUrl: dbUrl,
	smtpServer: {
		host: '',
		port: 0,
		secure: true,
		user: '',
		pass: '',
		fromName: '',
		fromAddress: ''
	},

	// key to sign tokens
	jwtSecretKey: 'SP69kXFR3znRi7kL8Max2GTB24wOtEQj',

	// key to sign store cookies
	cookieSecretKey: '8669X9P5yI1DAEthy1chc3M9EncyS7SM',

	// path to uploads
	categoriesUploadPath: 'public/content/images/categories',
	productsUploadPath: 'public/content/images/products',
	filesUploadPath: 'public/content',
	themeAssetsUploadPath: 'theme/assets/images',

	// url to uploads
	categoriesUploadUrl: '/images/categories',
	productsUploadUrl: '/images/products',
	filesUploadUrl: '',
	themeAssetsUploadUrl: '/assets/images',

	// store UI language
	language: 'en',

	// cost factor, controls how much time is needed to calculate a single BCrypt hash
	// for production: recommended salRounds > 12
	saltRounds: 12,

	// used by API
	orderStartNumber: 1000
};