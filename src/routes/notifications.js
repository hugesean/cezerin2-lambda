const PaymentGateways=require('../paymentGateways');

class NotificationsRoute {
	constructor(router,databaseConnection) {
		this.router = router;
		this.registerRoutes();
		PaymentGateways.db=databaseConnection;
	}

	registerRoutes() {
		this.router.post(
			'/v1/notifications/:gateway',
			this.paymentNotification.bind(this)
		);
	}

	paymentNotification(req, res, next) {
		PaymentGateways.paymentNotification(req, res, req.params.gateway);
	}
}

module.exports=NotificationsRoute;
