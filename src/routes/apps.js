const security=require('../lib/security');
const AppSettingsService=require('../services/apps/settings');

class AppsRoute {
	constructor(router,databaseConnection) {
		this.router = router;
		this.registerRoutes();
		AppSettingsService.db=databaseConnection;
	}

	registerRoutes() {
		this.router.get(
			'/v1/apps/:key/settings',
			security.checkUserScope.bind(this, security.scope.READ_SETTINGS),
			this.getSettings.bind(this)
		);
		this.router.put(
			'/v1/apps/:key/settings',
			security.checkUserScope.bind(this, security.scope.WRITE_SETTINGS),
			this.updateSettings.bind(this)
		);
	}

	getSettings(req, res, next) {
		AppSettingsService.getSettings(req.params.key)
			.then(data => {
				return res.send(data);
			})
			.catch(next);
	}

	updateSettings(req, res, next) {
		AppSettingsService.updateSettings(req.params.key, req.body)
			.then(data => {
				if (data) {
					return res.send(data);
				} else {
					return res.status(404).end();
				}
			})
			.catch(next);
	}
}

module.exports=AppsRoute;