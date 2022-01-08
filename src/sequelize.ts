import { Sequelize } from 'sequelize';
import { Application } from './declarations';

export default function (app: Application): void {
  const { user, password, db, options } = app.get('postgres');
  const sequelize = new Sequelize(db, user, password, {

    ...options,
    logging: (sql, queryObject) => {
      console.log('\n');
      console.warn(sql);
      // console.log(queryObject);
    },
    define: {
      freezeTableName: true
    }
  });
  const oldSetup = app.setup;

  app.set('sequelizeClient', sequelize);

  app.setup = function (...args): Application {
    const result = oldSetup.apply(this, args);

    // Set up data relationships
    const models = sequelize.models;
    Object.keys(models).forEach(name => {
      if ('associate' in models[name]) {
        (models[name] as any).associate(models);
      }
    });

    // Sync to the database
    // app.set('sequelizeSync', sequelize.sync());

    return result;
  };
}
