const ProductsRoute = require('./routes/products');
const ProductCategoriesRoute = require('./routes/productCategories');
const SitemapRoute = require('./routes/sitemap');
const ThemeRoute = require('./routes/theme');
const CustomersRoute = require('./routes/customers');
const CustomerGroupsRoute = require('./routes/customerGroups');
const OwnersRoute = require('./routes/owners');
const OwnerGroupsRoute = require('./routes/ownerGroups');
const OrdersRoute = require('./routes/orders');
const OrderStatusesRoute = require('./routes/orderStatuses');
const ShippingMethodsRoute = require('./routes/shippingMethods');
const PaymentMethodsRoute = require('./routes/paymentMethods');
const PaymentGatewaysRoute = require('./routes/paymentGateways');
const SettingsRoute = require('./routes/settings');
const PagesRoute = require('./routes/pages');
const SecurityTokensRoute = require('./routes/tokens');
const NotificationsRoute = require('./routes/notifications');
const RedirectsRoute = require('./routes/redirects');
const FilesRoute = require('./routes/files');
const AppsRoute = require('./routes/apps');
const WebhooksRoute = require('./routes/webhooks');
var db =require('./lib/mongo');


module.exports = function(app,apiRouter) {
  'use strict';
      // Initialize all routes   
    db.init((connection)=>{
      new ProductsRoute(apiRouter,connection);
      new ProductCategoriesRoute(apiRouter,connection);
      new SitemapRoute(apiRouter,connection);
      new ThemeRoute(apiRouter,connection);
      new CustomersRoute(apiRouter,connection);
      new CustomerGroupsRoute(apiRouter,connection);
      new OrdersRoute(apiRouter,connection);
      new OrderStatusesRoute(apiRouter,connection);
      new ShippingMethodsRoute(apiRouter,connection);
      new PaymentMethodsRoute(apiRouter,connection);
      new PaymentGatewaysRoute(apiRouter,connection);
      new SettingsRoute(apiRouter,connection);
      new PagesRoute(apiRouter,connection);
      new SecurityTokensRoute(apiRouter,connection);
      new NotificationsRoute(apiRouter,connection);
      new RedirectsRoute(apiRouter,connection);
      new FilesRoute(apiRouter,connection);
      new AppsRoute(apiRouter,connection);
      new WebhooksRoute(apiRouter,connection);
      new OwnersRoute(apiRouter,connection);
      new OwnerGroupsRoute(apiRouter,connection);
    });
};
