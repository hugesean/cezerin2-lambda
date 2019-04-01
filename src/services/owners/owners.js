const { ObjectID }=require('mongodb');
const parse=require('../../lib/parse');
const webhooks=require('../../lib/webhooks');
const OwnerGroupsService=require('./ownerGroups');
const AuthHeader=require('../../lib/auth-header');
const security=require('../../lib/security');

class OwnersService {
	getFilter(params = {}) {
		// tag
		// gender
		// date_created_to
		// date_created_from
		// total_spent_to
		// total_spent_from
		// orders_count_to
		// orders_count_from

		let filter = {};
		const id = parse.getObjectIDIfValid(params.id);
		const group_id = parse.getObjectIDIfValid(params.group_id);

		if (id) {
			filter._id = new ObjectID(id);
		}

		if (group_id) {
			filter.group_id = group_id;
		}

		if (params.email) {
			filter.email = params.email.toLowerCase();
		}

		if (params.search) {
			filter['$or'] = [
				{ email: new RegExp(params.search, 'i') },
				{ mobile: new RegExp(params.search, 'i') },
				{ $text: { $search: params.search } }
			];
		}

		return filter;
	}

	getOwners(params = {}) {
		let filter = this.getFilter(params);
		const limit = parse.getNumberIfPositive(params.limit) || 1000;
		const offset = parse.getNumberIfPositive(params.offset) || 0;

		return Promise.all([
			OwnerGroupsService.getGroups(),
			this.db
				.collection('owners')
				.find(filter)
				.sort({ date_created: -1 })
				.skip(offset)
				.limit(limit)
				.toArray(),
			this.db.collection('owners').countDocuments(filter)
		]).then(([ownerGroups, owners, ownersCount]) => {
			const items = owners.map(owner =>
				this.changeProperties(owner, ownerGroups)
			);
			const result = {
				total_count: ownersCount,
				has_more: offset + items.length < ownersCount,
				data: items
			};
			return result;
		});
	}

	getSingleOwner(id) {
		if (!ObjectID.isValid(id)) {
			return Promise.reject('Invalid identifier');
		}
		return this.getOwners({ id: id }).then(
			items => (items.data.length > 0 ? items.data[0] : {})
		);
	}

	async addOwner(data) {
		const owner = this.getValidDocumentForInsert(data);

		// is email unique
		if (owner.email && owner.email.length > 0) {
			const ownerCount = await this.db
				.collection('owners')
				.count({ email: owner.email });
			if (ownerCount > 0) {
				return Promise.reject('Owner email must be unique');
			}
		}

		const insertResponse = await this.db
			.collection('owners')
			.insertMany([owner]);
		const newOwnerId = insertResponse.ops[0]._id.toString();
		const newOwner = await this.getSingleOwner(newOwnerId);
		await webhooks.trigger({
			event: webhooks.events.CUSTOMER_CREATED,
			payload: newOwner
		});
		return newOwner;
	}

	async updateOwner(id, data) {
		if (!ObjectID.isValid(id)) {
			return Promise.reject('Invalid identifier');
		}
		const ownerObjectID = new ObjectID(id);
		const owner = this.getValidDocumentForUpdate(id, data);

		// is email unique
		if (owner.email && owner.email.length > 0) {
			const ownerCount = await this.db.collection('owners').count({
				_id: {
					$ne: ownerObjectID
				},
				email: owner.email
			});

			if (ownerCount > 0) {
				return Promise.reject('Owner email must be unique');
			}
		}

		await this.db.collection('owners').updateOne(
			{
				_id: ownerObjectID
			},
			{
				$set: owner
			}
		);

		const updatedOwner = await this.getSingleOwner(id);
		await webhooks.trigger({
			event: webhooks.events.CUSTOMER_UPDATED,
			payload: updatedOwner
		});
		return updatedOwner;
	}

	updateOwnerStatistics(ownerId, totalSpent, ordersCount) {
		if (!ObjectID.isValid(ownerId)) {
			return Promise.reject('Invalid identifier');
		}
		const ownerObjectID = new ObjectID(ownerId);
		const ownerData = {
			total_spent: totalSpent,
			orders_count: ordersCount
		};

		return this.db
			.collection('owners')
			.updateOne({ _id: ownerObjectID }, { $set: ownerData });
	}

	async deleteOwner(ownerId) {
		if (!ObjectID.isValid(ownerId)) {
			return Promise.reject('Invalid identifier');
		}
		const ownerObjectID = new ObjectID(ownerId);
		const owner = await this.getSingleOwner(ownerId);
		const deleteResponse = await this.db
			.collection('owners')
			.deleteOne({ _id: ownerObjectID });
		await webhooks.trigger({
			event: webhooks.events.CUSTOMER_DELETED,
			payload: owner
		});
		return deleteResponse.deletedCount > 0;
	}

	getValidDocumentForInsert(data) {
		let owner = {
			date_created: new Date(),
			date_updated: null,
			total_spent: 0,
			orders_count: 0
		};

		owner.note = parse.getString(data.note);
		owner.email = parse.getString(data.email).toLowerCase();
		owner.mobile = parse.getString(data.mobile).toLowerCase();
		owner.full_name = parse.getString(data.full_name);
		owner.first_name = parse.getString(data.first_name);
		owner.last_name = parse.getString(data.last_name);
		owner.password = parse.getString(data.password);
		owner.gender = parse.getString(data.gender).toLowerCase();
		owner.group_id = parse.getObjectIDIfValid(data.group_id);
		owner.tags = parse.getArrayIfValid(data.tags) || [];
		owner.social_accounts =
			parse.getArrayIfValid(data.social_accounts) || [];
		owner.birthdate = parse.getDateIfValid(data.birthdate);
		owner.addresses = this.validateAddresses(data.addresses);
		owner.browser = parse.getBrowser(data.browser);

		return owner;
	}

	validateAddresses(addresses) {
		if (addresses && addresses.length > 0) {
			let validAddresses = addresses.map(addressItem =>
				parse.getOwnerAddress(addressItem)
			);
			return validAddresses;
		} else {
			return [];
		}
	}

	getValidDocumentForUpdate(id, data) {
		if (Object.keys(data).length === 0) {
			return new Error('Required fields are missing');
		}

		let owner = {
			date_updated: new Date()
		};

		if (data.note !== undefined) {
			owner.note = parse.getString(data.note);
		}

		if (data.email !== undefined) {
			owner.email = parse.getString(data.email).toLowerCase();
		}

		if (data.mobile !== undefined) {
			owner.mobile = parse.getString(data.mobile).toLowerCase();
		}

		if (data.full_name !== undefined) {
			owner.full_name = parse.getString(data.full_name);
		}

		if (data.first_name !== undefined) {
			owner.first_name = parse.getString(data.first_name);
		}

		if (data.last_name !== undefined) {
			owner.last_name = parse.getString(data.last_name);
		}

		if (data.password !== undefined) {
			owner.password = parse.getString(data.password);
		}

		if (data.gender !== undefined) {
			owner.gender = parse.getString(data.gender);
		}

		if (data.group_id !== undefined) {
			owner.group_id = parse.getObjectIDIfValid(data.group_id);
		}

		if (data.tags !== undefined) {
			owner.tags = parse.getArrayIfValid(data.tags) || [];
		}

		if (data.social_accounts !== undefined) {
			owner.social_accounts =
				parse.getArrayIfValid(data.social_accounts) || [];
		}

		if (data.birthdate !== undefined) {
			owner.birthdate = parse.getDateIfValid(data.birthdate);
		}

		if (data.addresses !== undefined) {
			owner.addresses = this.validateAddresses(data.addresses);
		}

		if (data.browser !== undefined) {
			owner.browser = parse.getBrowser(data.browser);
		}

		return owner;
	}

	changeProperties(owner, ownerGroups) {
		if (owner) {
			owner.id = owner._id.toString();
			delete owner._id;

			const ownerGroup = owner.group_id
				? ownerGroups.find(
						group => group.id === owner.group_id.toString()
				  )
				: null;

			owner.group_name =
				ownerGroup && ownerGroup.name ? ownerGroup.name : '';

			if (owner.addresses && owner.addresses.length === 1) {
				owner.billing = owner.shipping = owner.addresses[0];
			} else if (owner.addresses && owner.addresses.length > 1) {
				let default_billing = owner.addresses.find(
					address => address.default_billing
				);
				let default_shipping = owner.addresses.find(
					address => address.default_shipping
				);
				owner.billing = default_billing
					? default_billing
					: owner.addresses[0];
				owner.shipping = default_shipping
					? default_shipping
					: owner.addresses[0];
			} else {
				owner.billing = {};
				owner.shipping = {};
			}
		}

		return owner;
	}

	addAddress(owner_id, address) {
		if (!ObjectID.isValid(owner_id)) {
			return Promise.reject('Invalid identifier');
		}
		let ownerObjectID = new ObjectID(owner_id);
		const validAddress = parse.getOwnerAddress(address);

		return this.db.collection('owners').updateOne(
			{
				_id: ownerObjectID
			},
			{
				$push: {
					addresses: validAddress
				}
			}
		);
	}

	createObjectToUpdateAddressFields(address) {
		let fields = {};

		if (address.address1 !== undefined) {
			fields['addresses.$.address1'] = parse.getString(address.address1);
		}

		if (address.address2 !== undefined) {
			fields['addresses.$.address2'] = parse.getString(address.address2);
		}

		if (address.city !== undefined) {
			fields['addresses.$.city'] = parse.getString(address.city);
		}

		if (address.country !== undefined) {
			fields['addresses.$.country'] = parse
				.getString(address.country)
				.toUpperCase();
		}

		if (address.state !== undefined) {
			fields['addresses.$.state'] = parse.getString(address.state);
		}

		if (address.phone !== undefined) {
			fields['addresses.$.phone'] = parse.getString(address.phone);
		}

		if (address.postal_code !== undefined) {
			fields['addresses.$.postal_code'] = parse.getString(address.postal_code);
		}

		if (address.full_name !== undefined) {
			fields['addresses.$.full_name'] = parse.getString(address.full_name);
		}

		if (address.company !== undefined) {
			fields['addresses.$.company'] = parse.getString(address.company);
		}

		if (address.tax_number !== undefined) {
			fields['addresses.$.tax_number'] = parse.getString(address.tax_number);
		}

		if (address.coordinates !== undefined) {
			fields['addresses.$.coordinates'] = address.coordinates;
		}

		if (address.details !== undefined) {
			fields['addresses.$.details'] = address.details;
		}

		if (address.default_billing !== undefined) {
			fields['addresses.$.default_billing'] = parse.getBooleanIfValid(
				address.default_billing,
				false
			);
		}

		if (address.default_shipping !== undefined) {
			fields['addresses.$.default_shipping'] = parse.getBooleanIfValid(
				address.default_shipping,
				false
			);
		}

		return fields;
	}

	updateAddress(owner_id, address_id, data) {
		if (!ObjectID.isValid(owner_id) || !ObjectID.isValid(address_id)) {
			return Promise.reject('Invalid identifier');
		}
		let ownerObjectID = new ObjectID(owner_id);
		let addressObjectID = new ObjectID(address_id);
		const addressFields = this.createObjectToUpdateAddressFields(data);

		return this.db.collection('owners').updateOne(
			{
				_id: ownerObjectID,
				'addresses.id': addressObjectID
			},
			{ $set: addressFields }
		);
	}

	deleteAddress(owner_id, address_id) {
		if (!ObjectID.isValid(owner_id) || !ObjectID.isValid(address_id)) {
			return Promise.reject('Invalid identifier');
		}
		let ownerObjectID = new ObjectID(owner_id);
		let addressObjectID = new ObjectID(address_id);

		return this.db.collection('owners').updateOne(
			{
				_id: ownerObjectID
			},
			{
				$pull: {
					addresses: {
						id: addressObjectID
					}
				}
			}
		);
	}

	setDefaultBilling(owner_id, address_id) {
		if (!ObjectID.isValid(owner_id) || !ObjectID.isValid(address_id)) {
			return Promise.reject('Invalid identifier');
		}
		let ownerObjectID = new ObjectID(owner_id);
		let addressObjectID = new ObjectID(address_id);

		return this.db
			.collection('owners')
			.updateOne(
				{
					_id: ownerObjectID,
					'addresses.default_billing': true
				},
				{
					$set: {
						'addresses.$.default_billing': false
					}
				}
			)
			.then(res => {
				return this.db.collection('owners').updateOne(
					{
						_id: ownerObjectID,
						'addresses.id': addressObjectID
					},
					{
						$set: {
							'addresses.$.default_billing': true
						}
					}
				);
			});
	}

	setDefaultShipping(owner_id, address_id) {
		if (!ObjectID.isValid(owner_id) || !ObjectID.isValid(address_id)) {
			return Promise.reject('Invalid identifier');
		}
		let ownerObjectID = new ObjectID(owner_id);
		let addressObjectID = new ObjectID(address_id);

		return this.db
			.collection('owners')
			.updateOne(
				{
					_id: ownerObjectID,
					'addresses.default_shipping': true
				},
				{
					$set: {
						'addresses.$.default_shipping': false
					}
				}
			)
			.then(res => {
				return this.db.collection('owners').updateOne(
					{
						_id: ownerObjectID,
						'addresses.id': addressObjectID
					},
					{
						$set: {
							'addresses.$.default_shipping': true
						}
					}
				);
			});
	}

	logout() {
		// remove user from local storage to log user out
		localStorage.removeItem('user');
	}

	getAll() {
		const requestOptions = {
			method: 'GET',
			//headers: authHeader()
		};

		return fetch(`${security.storeBaseUrl}/users`, requestOptions).then(handleResponse);
	}

	handleResponse(response) {
		return response.text().then(text => {
			const data = text && JSON.parse(text);
			if (!response.ok) {
				if (response.status === 401) {
					// auto logout if 401 response returned from api
					logout();
					location.reload(true);
				}

				const error = (data && data.message) || response.statusText;
				return Promise.reject(error);
			}

			return data;
		});
	}
}

module.exports=new OwnersService();