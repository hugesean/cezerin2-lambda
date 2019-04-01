class PaymentMethodsLightService {
	getMethods(filter = {}) {
		return this.db
			.collection('paymentMethods')
			.find(filter)
			.toArray()
			.then(items => items.map(item => this.changeProperties(item)));
	}

	changeProperties(item) {
		if (item) {
			item.id = item._id.toString();
			delete item._id;
		}
		return item;
	}
}

module.exports=new PaymentMethodsLightService();
