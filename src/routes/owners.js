const security=require('../lib/security');
const OwnersService=require('../services/owners/owners');

module.exports=function(){
	function constructor(router) {
		this.router = router;
		this.registerRoutes();
	}

	function registerRoutes() {
		this.router.get(
			'/v1/owners',
			security.checkUserScope.bind(this, security.scope.READ_OWNERS),
			this.getOwners.bind(this)
		);
		this.router.post(
			'/v1/owners',
			security.checkUserScope.bind(this, security.scope.WRITE_OWNERS),
			this.addOwner.bind(this)
		);
		this.router.get(
			'/v1/owners/:id',
			security.checkUserScope.bind(this, security.scope.READ_OWNERS),
			this.getSingleOwner.bind(this)
		);
		this.router.put(
			'/v1/owners/:id',
			security.checkUserScope.bind(this, security.scope.WRITE_OWNERS),
			this.updateOwner.bind(this)
		);
		this.router.delete(
			'/v1/owners/:id',
			security.checkUserScope.bind(this, security.scope.WRITE_OWNERS),
			this.deleteOwner.bind(this)
		);
		this.router.post(
			'/v1/owners/:id/addresses',
			security.checkUserScope.bind(this, security.scope.WRITE_OWNERS),
			this.addAddress.bind(this)
		);
		this.router.put(
			'/v1/owners/:id/addresses/:address_id',
			security.checkUserScope.bind(this, security.scope.WRITE_OWNERS),
			this.updateAddress.bind(this)
		);
		this.router.delete(
			'/v1/owners/:id/addresses/:address_id',
			security.checkUserScope.bind(this, security.scope.WRITE_OWNERS),
			this.deleteAddress.bind(this)
		);
		this.router.post(
			'/v1/owners/:id/addresses/:address_id/default_billing',
			security.checkUserScope.bind(this, security.scope.WRITE_OWNERS),
			this.setDefaultBilling.bind(this)
		);
		this.router.post(
			'/v1/owners/:id/addresses/:address_id/default_shipping',
			security.checkUserScope.bind(this, security.scope.WRITE_OWNERS),
			this.setDefaultShipping.bind(this)
		);
	}

	function getOwners(req, res, next) {
		OwnersService.getOwners(req.query)
			.then(data => {
				return res.send(data);
			})
			.catch(next);
	}

	function getSingleOwner(req, res, next) {
		OwnersService.getSingleOwner(req.params.id)
			.then(data => {
				if (data) {
					return res.send(data);
				} else {
					return res.status(404).end();
				}
			})
			.catch(next);
	}

	function addOwner(req, res, next) {
		OwnersService.addOwner(req.body)
			.then(data => {
				return res.send(data);
			})
			.catch(next);
	}

	function updateOwner(req, res, next) {
		OwnersService.updateOwner(req.params.id, req.body)
			.then(data => {
				if (data) {
					return res.send(data);
				} else {
					return res.status(404).end();
				}
			})
			.catch(next);
	}

	function deleteOwner(req, res, next) {
		OwnersService.deleteOwner(req.params.id)
			.then(data => {
				return res.status(data ? 200 : 404).end();
			})
			.catch(next);
	}

	function addAddress(req, res, next) {
		const owner_id = req.params.id;
		OwnersService.addAddress(owner_id, req.body)
			.then(data => {
				return res.end();
			})
			.catch(next);
	}

	function updateAddress(req, res, next) {
		const owner_id = req.params.id;
		const address_id = req.params.address_id;
		OwnersService.updateAddress(owner_id, address_id, req.body)
			.then(data => {
				return res.end();
			})
			.catch(next);
	}

	function deleteAddress(req, res, next) {
		const owner_id = req.params.id;
		const address_id = req.params.address_id;
		OwnersService.deleteAddress(owner_id, address_id)
			.then(data => {
				return res.end();
			})
			.catch(next);
	}

	function setDefaultBilling(req, res, next) {
		const owner_id = req.params.id;
		const address_id = req.params.address_id;
		OwnersService.setDefaultBilling(owner_id, address_id)
			.then(data => {
				return res.end();
			})
			.catch(next);
	}

	function setDefaultShipping(req, res, next) {
		const owner_id = req.params.id;
		const address_id = req.params.address_id;
		OwnersService.setDefaultShipping(owner_id, address_id)
			.then(data => {
				return res.end();
			})
			.catch(next);
	}
}