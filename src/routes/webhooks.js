const security=require('../lib/security');
const WebhooksService=require('../services/webhooks');

class WebhooksRoute {
	constructor(router,databaseConnection) {
		this.router = router;
		this.registerRoutes();
		WebhooksService.db=databaseConnection;
	}

	registerRoutes() {
		this.router.get(
			'/v1/webhooks',
			security.checkUserScope.bind(this, security.scope.READ_SETTINGS),
			this.getWebhooks.bind(this)
		);
		this.router.post(
			'/v1/webhooks',
			security.checkUserScope.bind(this, security.scope.WRITE_SETTINGS),
			this.addWebhook.bind(this)
		);
		this.router.get(
			'/v1/webhooks/:id',
			security.checkUserScope.bind(this, security.scope.READ_SETTINGS),
			this.getSingleWebhook.bind(this)
		);
		this.router.put(
			'/v1/webhooks/:id',
			security.checkUserScope.bind(this, security.scope.WRITE_SETTINGS),
			this.updateWebhook.bind(this)
		);
		this.router.delete(
			'/v1/webhooks/:id',
			security.checkUserScope.bind(this, security.scope.WRITE_SETTINGS),
			this.deleteWebhook.bind(this)
		);
	}

	async getWebhooks(req, res, next) {
		try {
			let data = await WebhooksService.getWebhooks(req.query);
			return res.send(data);
		} catch(err) {
			return next(err);
		}
	}

	async getSingleWebhook(req, res, next) {
		try {
			let data = await WebhooksService.getSingleWebhook(req.params.id);
			return (data) ? res.send(data) : res.status(404).end();
		} catch(err) {
			return next(err);
		}
	}

	async addWebhook(req, res, next) {
		try {
			let data = await WebhooksService.addWebhook(req.body);
			return res.send(data);
		} catch(err) {
			return next(err);
		}
	}

	async updateWebhook(req, res, next) {
		try {
			let data = await WebhooksService.updateWebhook(req.params.id, req.body);
			return (data) ? res.send(data) : res.status(404).end();
		} catch(err) {
			return next(err);
		}
	}

	async deleteWebhook(req, res, next) {
		try {
			let data = await WebhooksService.deleteWebhook(req.params.id);
			return res.status(data ? 200 : 404).end();
		} catch(err) {
			return next(err);
		}
	}
}

module.exports=WebhooksRoute;