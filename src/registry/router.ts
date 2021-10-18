import ComponentRoute from './routes/component';
import ComponentsRoute from './routes/components';
import ComponentInfoRoute from './routes/component-info';
import ComponentPreviewRoute from './routes/component-preview';
import IndexRoute from './routes';
import PublishRoute from './routes/publish';
import StaticRedirectorRoute from './routes/static-redirector';
import PluginsRoute from './routes/plugins';
import DependenciesRoute from './routes/dependencies';
import settings from '../resources/settings';
import { Express } from 'express';
import { Config, Repository } from '../types';

export function create(
  app: Express,
  conf: Config,
  repository: Repository
): Express {
  const routes = {
    component: ComponentRoute(conf, repository),
    components: ComponentsRoute(conf, repository),
    componentInfo: ComponentInfoRoute(conf, repository),
    componentPreview: ComponentPreviewRoute(conf, repository),
    index: IndexRoute(repository),
    publish: PublishRoute(repository),
    staticRedirector: StaticRedirectorRoute(repository),
    plugins: PluginsRoute(conf),
    dependencies: DependenciesRoute(conf)
  };

  const prefix = conf.prefix;

  if (prefix !== '/') {
    app.get('/', (req, res) => res.redirect(prefix));
    app.get(prefix.substr(0, prefix.length - 1), routes.index);
  }

  app.get(`${prefix}oc-client/client.js`, routes.staticRedirector);
  app.get(`${prefix}oc-client/oc-client.min.map`, routes.staticRedirector);

  app.get(`${prefix}~registry/plugins`, routes.plugins);
  app.get(`${prefix}~registry/dependencies`, routes.dependencies);

  if (conf.local) {
    app.get(
      `${prefix}:componentName/:componentVersion/${settings.registry.localStaticRedirectorPath}*`,
      routes.staticRedirector
    );
  } else {
    app.put(
      `${prefix}:componentName/:componentVersion`,
      conf.beforePublish,
      routes.publish
    );
  }

  app.get(prefix, routes.index);
  app.post(prefix, routes.components);

  app.get(
    `${prefix}:componentName/:componentVersion${settings.registry.componentInfoPath}`,
    routes.componentInfo
  );
  app.get(
    `${prefix}:componentName${settings.registry.componentInfoPath}`,
    routes.componentInfo
  );

  app.get(
    `${prefix}:componentName/:componentVersion${settings.registry.componentPreviewPath}`,
    routes.componentPreview
  );
  app.get(
    `${prefix}:componentName${settings.registry.componentPreviewPath}`,
    routes.componentPreview
  );

  app.get(`${prefix}:componentName/:componentVersion`, routes.component);
  app.get(`${prefix}:componentName`, routes.component);

  if (conf.routes) {
    conf.routes.forEach(route =>
      app[
        route.method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'head'
      ](route.route, route.handler)
    );
  }

  app.set('etag', 'strong');

  return app;
}