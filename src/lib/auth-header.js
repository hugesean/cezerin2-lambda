const jwt=require('jsonwebtoken');
const serverConfigs=require('../../config/server');

const cert = serverConfigs.jwtSecretKey;

class AuthHeader {
	encodeUserLoginAuth(userId) {
		return jwt.sign({ userId: userId }, cert);
	}

	decodeUserLoginAuth(token) {
		try {
			return jwt.verify(token, cert);
		} catch (error) {
			return error;
		}
	}

	encodeUserPassword(token) {
		return jwt.sign({ password: token }, cert);
	}

	decodeUserPassword(token) {
		return jwt.verify(token, cert);
	}
}
module.exports=new AuthHeader();