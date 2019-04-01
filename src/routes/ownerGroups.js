const security=require('../lib/security');
const OwnerGroupsService=require('../services/owners/ownerGroups');

module.exports=function(){
	function constructor(router) {
		this.router = router;
		this.registerRoutes();
	}

	function registerRoutes() {
		this.router.get(
			'/v1/owner_groups',
			security.checkUserScope.bind(this, security.scope.READ_CUSTOMER_GROUPS),
			this.getGroups.bind(this)
		);
		this.router.post(
			'/v1/owner_groups',
			security.checkUserScope.bind(this, security.scope.WRITE_CUSTOMER_GROUPS),
			this.addGroup.bind(this)
		);
		this.router.get(
			'/v1/owner_groups/:id',
			security.checkUserScope.bind(this, security.scope.READ_CUSTOMER_GROUPS),
			this.getSingleGroup.bind(this)
		);
		this.router.put(
			'/v1/owner_groups/:id',
			security.checkUserScope.bind(this, security.scope.WRITE_CUSTOMER_GROUPS),
			this.updateGroup.bind(this)
		);
		this.router.delete(
			'/v1/owner_groups/:id',
			security.checkUserScope.bind(this, security.scope.WRITE_CUSTOMER_GROUPS),
			this.deleteGroup.bind(this)
		);
	}

	async function getGroups(req, res, next) {
		try {
			let data = await OwnerGroupsService.getGroups(req.query)
			return res.send(data);
		} catch(err) {
			return next(err);
		}
	}

	async function getSingleGroup(req, res, next) {
		try {
			let data = await OwnerGroupsService.getSingleGroup(req.params.id)
			if (data) {
				return res.send(data);
			} else {
				return res.status(404).end();
			}
		} catch (err) {
			return next(err);
		}
	}

	async function addGroup(req, res, next) {
		try {
			let data = OwnerGroupsService.addGroup(req.body)
			return res.send(data);
		} catch(err) {
			return next(err);
		}
	}

	async function updateGroup(req, res, next) {
		try {
			let data = await OwnerGroupsService.updateGroup(req.params.id, req.body)
			if (data) {
				return res.send(data);
			} else {
				return res.status(404).end();
			}
		} catch(err) {
			return next(err);
		}
	}

	async function deleteGroup(req, res, next) {
		try {
			let data = await OwnerGroupsService.deleteGroup(req.params.id)
			return res.status(data ? 200 : 404).end();
		} catch(err) {
			return next(err)
		}
	}
}