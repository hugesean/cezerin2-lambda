const security=require('../lib/security');
const RedirectsService=require('../services/redirects');

class RedirectsRoute {
	constructor(router,databaseConnection) {
		this.router = router;
		this.registerRoutes();
		RedirectsService.db=databaseConnection;
	}

	registerRoutes() {
		this.router.get(
			'/v1/redirects',
			security.checkUserScope.bind(this, security.scope.READ_SETTINGS),
			this.getRedirects.bind(this)
		);
		this.router.post(
			'/v1/redirects',
			security.checkUserScope.bind(this, security.scope.WRITE_SETTINGS),
			this.addRedirect.bind(this)
		);
		this.router.get(
			'/v1/redirects/:id',
			security.checkUserScope.bind(this, security.scope.READ_SETTINGS),
			this.getSingleRedirect.bind(this)
		);
		this.router.put(
			'/v1/redirects/:id',
			security.checkUserScope.bind(this, security.scope.WRITE_SETTINGS),
			this.updateRedirect.bind(this)
		);
		this.router.delete(
			'/v1/redirects/:id',
			security.checkUserScope.bind(this, security.scope.WRITE_SETTINGS),
			this.deleteRedirect.bind(this)
		);
	}

	getRedirects(req, res, next) {
		RedirectsService.getRedirects(req.query)
			.then(data => {
				return res.send(data);
			})
			.catch(next);
	}

	getSingleRedirect(req, res, next) {
		RedirectsService.getSingleRedirect(req.params.id)
			.then(data => {
				if (data) {
					return res.send(data);
				} else {
					return res.status(404).end();
				}
			})
			.catch(next);
	}

	addRedirect(req, res, next) {
		RedirectsService.addRedirect(req.body)
			.then(data => {
				return res.send(data);
			})
			.catch(next);
	}

	updateRedirect(req, res, next) {
		RedirectsService.updateRedirect(req.params.id, req.body)
			.then(data => {
				if (data) {
					return res.send(data);
				} else {
					return res.status(404).end();
				}
			})
			.catch(next);
	}

	deleteRedirect(req, res, next) {
		RedirectsService.deleteRedirect(req.params.id)
			.then(data => {
				return res.status(data ? 200 : 404).end();
			})
			.catch(next);
	}
}

module.exports=RedirectsRoute;