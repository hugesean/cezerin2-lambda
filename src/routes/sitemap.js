const security=require('../lib/security');
const SitemapService=require('../services/sitemap');

class SitemapRoute {
	constructor(router,databaseConnection) {
		this.router = router;
		this.registerRoutes();
		SitemapService.db=databaseConnection;
	}

	registerRoutes() {
		this.router.get(
			'/v1/sitemap',
			security.checkUserScope.bind(this, security.scope.READ_SITEMAP),
			this.getPaths.bind(this)
		);
	}

	getPaths(req, res, next) {
		if (req.query.path) {
			SitemapService.getSinglePath(req.query.path, req.query.enabled)
				.then(data => {
					if (data) {
						return res.send(data);
					} else {
						return res.status(404).end();
					}
				})
				.catch(next);
		} else {
			SitemapService.getPaths(req.query.enabled)
				.then(data => {
					return res.send(data);
				})
				.catch(next);
		}
	}
}

module.exports=SitemapRoute;
