const security=require('../lib/security');
const OrderStatusesService=require('../services/orders/orderStatuses');

module.exports=function(){
	function constructor(router) {
		this.router = router;
		this.registerRoutes();
	}

	function registerRoutes() {
		this.router.get(
			'/v1/order_statuses',
			security.checkUserScope.bind(this, security.scope.READ_ORDER_STATUSES),
			this.getStatuses.bind(this)
		);
		this.router.post(
			'/v1/order_statuses',
			security.checkUserScope.bind(this, security.scope.WRITE_ORDER_STATUSES),
			this.addStatus.bind(this)
		);
		this.router.get(
			'/v1/order_statuses/:id',
			security.checkUserScope.bind(this, security.scope.READ_ORDER_STATUSES),
			this.getSingleStatus.bind(this)
		);
		this.router.put(
			'/v1/order_statuses/:id',
			security.checkUserScope.bind(this, security.scope.WRITE_ORDER_STATUSES),
			this.updateStatus.bind(this)
		);
		this.router.delete(
			'/v1/order_statuses/:id',
			security.checkUserScope.bind(this, security.scope.WRITE_ORDER_STATUSES),
			this.deleteStatus.bind(this)
		);
	}

	async function getStatuses(req, res, next) {
		try {
			let data = await OrderStatusesService.getStatuses(req.query)
			return res.send(data);
		} catch(err) {
			return next(err);
		}
	}

	async function getSingleStatus(req, res, next) {
		try {
			let data = await OrderStatusesService.getSingleStatus(req.params.id)
			if (data) {
					return res.send(data);
			} else {
					return res.status(404).end();
			}
		} catch (err) {
			return next(err);
		}
	}

	async function addStatus(req, res, next) {
		try {
			let data = OrderStatusesService.addStatus(req.body)
			return res.send(data);
		} catch (err) {
			return next(err);
		}
	}

	async function updateStatus(req, res, next) {
		try {
			let data = await OrderStatusesService.updateStatus(req.params.id, req.body)
			if (data) {
				return res.send(data);
			} else {
				return res.status(404).end();
			}
		} catch (err) {
			return next(err);
		}
	}

	async function deleteStatus(req, res, next) {
		try {
			let data = await OrderStatusesService.deleteStatus(req.params.id)
			return res.status(data ? 200 : 404).end();
		} catch (err) {
			return next(err);
		}
	}
}