const security=require('../lib/security');
const PaymentGatewaysService=require('../services/settings/paymentGateways');

class PaymentGatewaysRoute {
	constructor(router,databaseConnection) {
		this.router = router;
		this.registerRoutes();
		PaymentGatewaysService.db=databaseConnection;
	}

	registerRoutes() {
		this.router.get(
			'/v1/payment_gateways/:name',
			security.checkUserScope.bind(this, security.scope.READ_PAYMENT_METHODS),
			this.getGateway.bind(this)
		);
		this.router.put(
			'/v1/payment_gateways/:name',
			security.checkUserScope.bind(this, security.scope.WRITE_PAYMENT_METHODS),
			this.updateGateway.bind(this)
		);
	}

	getGateway(req, res, next) {
		PaymentGatewaysService.getGateway(req.params.name)
			.then(data => {
				return res.send(data);
			})
			.catch(next);
	}

	updateGateway(req, res, next) {
		PaymentGatewaysService.updateGateway(req.params.name, req.body)
			.then(data => {
				return res.send(data);
			})
			.catch(next);
	}
}

module.exports=PaymentGatewaysRoute;