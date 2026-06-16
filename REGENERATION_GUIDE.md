# Manual Code Regeneration Guide: Event Registration & Ticket Management System

This guide outlines the step-by-step instructions to manually reconstruct the **Event Registration & Ticket Management System** from scratch. Follow the steps sequentially to set up the project environment, build the database models, implement business logic, construct RESTful endpoints, document the API, and test your work.

---

## Table of Contents
1. [Project Initialization & Dependencies](#1-project-initialization--dependencies)
2. [Project Folder Structure](#2-project-folder-structure)
3. [Root Configuration Files](#3-root-configuration-files)
4. [Database & ORM Configuration](#4-database--orm-configuration)
5. [Type Interfaces](#5-type-interfaces)
6. [Sequelize Database Models](#6-sequelize-database-models)
7. [Database Migrations](#7-database-migrations)
8. [Database Seeders](#8-database-seeders)
9. [Utility Helpers](#9-utility-helpers)
10. [Custom Middlewares](#10-custom-middlewares)
11. [Request Validation Schemas](#11-request-validation-schemas)
12. [Business Logic Services](#12-business-logic-services)
13. [API Controllers](#13-api-controllers)
14. [Routing & Swagger Setup](#14-routing--swagger-setup)
15. [Server Bootstrapping](#15-server-bootstrapping)
16. [Test Configuration & Test Cases](#16-test-configuration--test-cases)
17. [Commands to Run, Migrate, Seed, and Test](#17-commands-to-run-migrate-seed-and-test)

---

## 1. Project Initialization & Dependencies

To begin, initialize a new Node.js project and install the necessary production and development dependencies.

Run the following commands in an empty directory:

```bash
# Initialize project
npm init -y

# Install production dependencies
npm install express cors dotenv morgan joi sequelize mysql2 sqlite3 swagger-ui-express swagger-jsdoc

# Install development dependencies
npm install --save-dev typescript @types/express @types/cors @types/node @types/morgan @types/swagger-ui-express @types/swagger-jsdoc ts-node-dev jest ts-jest @types/jest supertest @types/supertest rimraf sequelize-cli
```

---

## 2. Project Folder Structure

Create the folder layout by running the following command (PowerShell / Command Prompt / Terminal):

```bash
mkdir src
mkdir src/config
mkdir src/controllers
mkdir src/docs
mkdir src/interfaces
mkdir src/middlewares
mkdir src/migrations
mkdir src/models
mkdir src/routes
mkdir src/seeders
mkdir src/services
mkdir src/tests
mkdir src/utils
mkdir src/validations
```

The resulting structure should look like this:

```
├── .env.example
├── .gitignore
├── .sequelizerc
├── jest.config.js
├── package.json
├── REGENERATION_GUIDE.md
├── tsconfig.json
└── src
    ├── app.ts
    ├── server.ts
    ├── config
    │   ├── database.ts
    │   └── sequelize-cli-config.js
    ├── controllers
    │   ├── dashboard.controller.ts
    │   ├── event.controller.ts
    │   └── registration.controller.ts
    ├── docs
    │   └── swagger.ts
    ├── interfaces
    │   ├── audit-log.interface.ts
    │   ├── event.interface.ts
    │   └── registration.interface.ts
    ├── middlewares
    │   ├── error.middleware.ts
    │   ├── logger.middleware.ts
    │   └── validation.middleware.ts
    ├── migrations
    │   ├── 20260617000001-create-events.js
    │   ├── 20260617000002-create-registrations.js
    │   └── 20260617000003-create-audit-logs.js
    ├── models
    │   ├── index.ts
    │   ├── AuditLog.ts
    │   ├── Event.ts
    │   └── Registration.ts
    ├── routes
    │   ├── index.ts
    │   ├── dashboard.routes.ts
    │   ├── event.routes.ts
    │   └── registration.routes.ts
    ├── seeders
    │   ├── 20260617000001-seed-events.js
    │   ├── 20260617000002-seed-registrations.js
    │   └── 20260617000003-seed-audit-logs.js
    ├── services
    │   ├── dashboard.service.ts
    │   ├── event.service.ts
    │   └── registration.service.ts
    ├── tests
    │   ├── api.test.ts
    │   └── registration.test.ts
    ├── utils
    │   ├── helpers.ts
    │   └── query.utils.ts
    └── validations
        ├── event.validation.ts
        └── registration.validation.ts
```

---

## 3. Root Configuration Files

Create the following files in the project root folder:

### `.env.example`
```env
PORT=3000
NODE_ENV=development

DB_DIALECT=sqlite
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=event_management
```

*(Copy `.env.example` to `.env` locally. For SQLite, `database.sqlite` will generate in the root).*

### `.gitignore`
```text
node_modules/
dist/
database.sqlite
database_test.sqlite
database_prod.sqlite
.env
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "src/tests/**/*"]
}
```

### `package.json` (Scripts and Metadata configuration)
Update the `scripts` and dependencies in your root `package.json` to match:
```json
{
  "name": "event-registration-system",
  "version": "1.0.0",
  "description": "Event Registration & Ticket Management System",
  "main": "dist/server.js",
  "scripts": {
    "clean": "rimraf dist",
    "build": "npm run clean && tsc",
    "start": "npm run build && node dist/server.js",
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "test": "jest --runInBand --detectOpenHandles",
    "db:migrate": "npx sequelize-cli db:migrate",
    "db:seed": "npx sequelize-cli db:seed:all",
    "db:undo": "npx sequelize-cli db:migrate:undo:all"
  }
}
```

### `.sequelizerc`
This config file tells Sequelize CLI where to look for config, models, seeders, and migrations.
```javascript
const path = require('path');

module.exports = {
  'config': path.resolve('src', 'config', 'sequelize-cli-config.js'),
  'models-path': path.resolve('src', 'models'),
  'seeders-path': path.resolve('src', 'seeders'),
  'migrations-path': path.resolve('src', 'migrations')
};
```

---

## 4. Database & ORM Configuration

Create database config files in `src/config/`:

### `src/config/database.ts`
```typescript
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbDialect = (process.env.DB_DIALECT || 'mysql') as 'mysql' | 'sqlite';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'event_management';

const sequelize = dbDialect === 'sqlite'
  ? new Sequelize({
      dialect: 'sqlite',
      storage: './database.sqlite',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      define: {
        timestamps: true,
      },
    })
  : new Sequelize(dbName, dbUser, dbPassword, {
      host: dbHost,
      port: dbPort,
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      define: {
        timestamps: true,
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });

export default sequelize;
export { sequelize };
```

### `src/config/sequelize-cli-config.js`
```javascript
require('dotenv').config();

module.exports = {
  development: {
    dialect: process.env.DB_DIALECT || 'mysql',
    storage: './database.sqlite',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || 'event_management',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
  },
  test: {
    dialect: process.env.DB_DIALECT || 'mysql',
    storage: './database_test.sqlite',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || 'event_management_test',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    logging: false
  },
  production: {
    dialect: process.env.DB_DIALECT || 'mysql',
    storage: './database_prod.sqlite',
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};
```

---

## 5. Type Interfaces

Define TypeScript interfaces under `src/interfaces/`:

### `src/interfaces/event.interface.ts`
```typescript
import { Optional } from 'sequelize';

export interface EventAttributes {
  id: number;
  eventName: string;
  location: string;
  eventDate: Date;
  capacity: number;
  availableSeats: number;
  ticketPrice: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface EventCreationAttributes extends Optional<EventAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}
```

### `src/interfaces/registration.interface.ts`
```typescript
import { Optional } from 'sequelize';

export interface RegistrationAttributes {
  id: number;
  registrationNumber: string;
  eventId: number;
  fullName: string;
  email: string;
  tickets: number;
  totalAmount: number;
  status: 'REGISTERED' | 'CANCELLED' | 'WAITLIST';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RegistrationCreationAttributes
  extends Optional<RegistrationAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt'> {}
```

### `src/interfaces/audit-log.interface.ts`
```typescript
import { Optional } from 'sequelize';

export interface AuditLogAttributes {
  id: number;
  registrationId: number;
  oldStatus: 'REGISTERED' | 'CANCELLED' | 'WAITLIST' | null;
  newStatus: 'REGISTERED' | 'CANCELLED' | 'WAITLIST';
  changedAt: Date;
}

export interface AuditLogCreationAttributes extends Optional<AuditLogAttributes, 'id' | 'changedAt'> {}
```

---

## 6. Sequelize Database Models

Write database schemas under `src/models/`:

### `src/models/Event.ts`
```typescript
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { EventAttributes, EventCreationAttributes } from '../interfaces/event.interface';

class Event extends Model<EventAttributes, EventCreationAttributes> implements EventAttributes {
  public id!: number;
  public eventName!: string;
  public location!: string;
  public eventDate!: Date;
  public capacity!: number;
  public availableSeats!: number;
  public ticketPrice!: number;
  public status!: 'ACTIVE' | 'INACTIVE';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

Event.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    eventName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    eventDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    availableSeats: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ticketPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('ticketPrice');
        return rawValue ? parseFloat(rawValue as unknown as string) : 0;
      },
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
  },
  {
    sequelize,
    tableName: 'events',
    paranoid: true, // soft delete
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['eventName', 'eventDate'],
        name: 'unique_event_name_date',
      },
    ],
  }
);

export default Event;
export { Event };
```

### `src/models/Registration.ts`
```typescript
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { RegistrationAttributes, RegistrationCreationAttributes } from '../interfaces/registration.interface';

class Registration extends Model<RegistrationAttributes, RegistrationCreationAttributes>
  implements RegistrationAttributes {
  public id!: number;
  public registrationNumber!: string;
  public eventId!: number;
  public fullName!: string;
  public email!: string;
  public tickets!: number;
  public totalAmount!: number;
  public status!: 'REGISTERED' | 'CANCELLED' | 'WAITLIST';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Registration.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    registrationNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    eventId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tickets: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('totalAmount');
        return rawValue ? parseFloat(rawValue as unknown as string) : 0;
      },
    },
    status: {
      type: DataTypes.ENUM('REGISTERED', 'CANCELLED', 'WAITLIST'),
      allowNull: false,
      defaultValue: 'REGISTERED',
    },
  },
  {
    sequelize,
    tableName: 'registrations',
    timestamps: true,
  }
);

export default Registration;
export { Registration };
```

### `src/models/AuditLog.ts`
```typescript
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { AuditLogAttributes, AuditLogCreationAttributes } from '../interfaces/audit-log.interface';

class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> implements AuditLogAttributes {
  public id!: number;
  public registrationId!: number;
  public oldStatus!: 'REGISTERED' | 'CANCELLED' | 'WAITLIST' | null;
  public newStatus!: 'REGISTERED' | 'CANCELLED' | 'WAITLIST';
  public changedAt!: Date;
}

AuditLog.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    registrationId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    oldStatus: {
      type: DataTypes.ENUM('REGISTERED', 'CANCELLED', 'WAITLIST'),
      allowNull: true,
    },
    newStatus: {
      type: DataTypes.ENUM('REGISTERED', 'CANCELLED', 'WAITLIST'),
      allowNull: false,
    },
    changedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'audit_logs',
    timestamps: false,
  }
);

export default AuditLog;
export { AuditLog };
```

### `src/models/index.ts`
Setup associations between models.
```typescript
import { sequelize } from '../config/database';
import { Event } from './Event';
import { Registration } from './Registration';
import { AuditLog } from './AuditLog';

// Define associations
Event.hasMany(Registration, {
  foreignKey: 'eventId',
  as: 'registrations',
  onDelete: 'RESTRICT',
});

Registration.belongsTo(Event, {
  foreignKey: 'eventId',
  as: 'event',
});

Registration.hasMany(AuditLog, {
  foreignKey: 'registrationId',
  as: 'auditLogs',
  onDelete: 'CASCADE',
});

AuditLog.belongsTo(Registration, {
  foreignKey: 'registrationId',
  as: 'registration',
});

export {
  sequelize,
  Event,
  Registration,
  AuditLog,
};
```

---

## 7. Database Migrations

Write the raw JavaScript database migrations in `src/migrations/`. 

### `src/migrations/20260617000001-create-events.js`
```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('events', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      eventName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      eventDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      availableSeats: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      ticketPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
        allowNull: false,
        defaultValue: 'ACTIVE',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addIndex('events', ['eventName', 'eventDate'], {
      unique: true,
      name: 'unique_event_name_date',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('events', 'unique_event_name_date');
    await queryInterface.dropTable('events');
  },
};
```

### `src/migrations/20260617000002-create-registrations.js`
```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('registrations', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      registrationNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      eventId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tickets: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('REGISTERED', 'CANCELLED', 'WAITLIST'),
        allowNull: false,
        defaultValue: 'REGISTERED',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('registrations', ['eventId', 'email'], {
      name: 'idx_registrations_event_email',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('registrations', 'idx_registrations_event_email');
    await queryInterface.dropTable('registrations');
  },
};
```

### `src/migrations/20260617000003-create-audit-logs.js`
```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      registrationId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'registrations',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      oldStatus: {
        type: Sequelize.ENUM('REGISTERED', 'CANCELLED', 'WAITLIST'),
        allowNull: true,
      },
      newStatus: {
        type: Sequelize.ENUM('REGISTERED', 'CANCELLED', 'WAITLIST'),
        allowNull: false,
      },
      changedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('audit_logs', ['registrationId'], {
      name: 'idx_audit_logs_registration_id',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('audit_logs', 'idx_audit_logs_registration_id');
    await queryInterface.dropTable('audit_logs');
  },
};
```

---

## 8. Database Seeders

Write seed files under `src/seeders/` to load mock data:

### `src/seeders/20260617000001-seed-events.js`
```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('audit_logs', null, {});
    await queryInterface.bulkDelete('registrations', null, {});
    await queryInterface.bulkDelete('events', null, {});
    return queryInterface.bulkInsert('events', [
      {
        id: 1,
        eventName: 'Tech Summit 2026',
        location: 'San Francisco',
        eventDate: '2026-08-15',
        capacity: 500,
        availableSeats: 497, // 500 - 3 (from seeded registrations)
        ticketPrice: 150.00,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        eventName: 'Music Festival 2026',
        location: 'Los Angeles',
        eventDate: '2026-09-20',
        capacity: 1000,
        availableSeats: 1000,
        ticketPrice: 75.00,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        eventName: 'React Workshop',
        location: 'Chicago',
        eventDate: '2026-07-10',
        capacity: 50,
        availableSeats: 45, // 50 - 5 (from seeded registrations)
        ticketPrice: 199.00,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        eventName: 'AI Dev Conference',
        location: 'Boston',
        eventDate: '2026-11-12',
        capacity: 150,
        availableSeats: 150,
        ticketPrice: 299.00,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 5,
        eventName: 'Design Meetup',
        location: 'Denver',
        eventDate: '2026-10-05',
        capacity: 200,
        availableSeats: 200,
        ticketPrice: 0.00,
        status: 'INACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('events', null, {});
  },
};
```

### `src/seeders/20260617000002-seed-registrations.js`
```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('registrations', null, {});
    return queryInterface.bulkInsert('registrations', [
      {
        id: 1,
        registrationNumber: 'REG-20260617-1001',
        eventId: 1,
        fullName: 'John Doe',
        email: 'john@example.com',
        tickets: 2,
        totalAmount: 300.00,
        status: 'REGISTERED',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        registrationNumber: 'REG-20260617-1002',
        eventId: 1,
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        tickets: 1,
        totalAmount: 150.00,
        status: 'REGISTERED',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        registrationNumber: 'REG-20260617-1003',
        eventId: 3,
        fullName: 'Alice Johnson',
        email: 'alice@example.com',
        tickets: 5,
        totalAmount: 995.00,
        status: 'REGISTERED',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('registrations', null, {});
  },
};
```

### `src/seeders/20260617000003-seed-audit-logs.js`
```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('audit_logs', null, {});
    return queryInterface.bulkInsert('audit_logs', [
      {
        id: 1,
        registrationId: 1,
        oldStatus: null,
        newStatus: 'REGISTERED',
        changedAt: new Date(),
      },
      {
        id: 2,
        registrationId: 2,
        oldStatus: null,
        newStatus: 'REGISTERED',
        changedAt: new Date(),
      },
      {
        id: 3,
        registrationId: 3,
        oldStatus: null,
        newStatus: 'REGISTERED',
        changedAt: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('audit_logs', null, {});
  },
};
```

---

## 9. Utility Helpers

Write helper routines inside `src/utils/`:

### `src/utils/helpers.ts`
```typescript
/**
 * Generates a unique registration number with the format: REG-YYYYMMDD-XXXX
 * Where YYYYMMDD is the current date and XXXX is a 4-digit alphanumeric code.
 */
export const generateRegistrationNumber = (): string => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}${mm}${dd}`;

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomStr = '';
  for (let i = 0; i < 4; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `REG-${dateStr}-${randomStr}`;
};
```

### `src/utils/query.utils.ts`
```typescript
import { Op, Order } from 'sequelize';

export interface ParsedQuery {
  limit: number;
  offset: number;
  order: Order;
}

/**
 * Parses page and limit parameters, returning calculated limit and offset.
 */
export const getPagination = (page: number = 1, limit: number = 10): { limit: number; offset: number } => {
  const parsedLimit = Math.max(1, limit);
  const parsedPage = Math.max(1, page);
  const offset = (parsedPage - 1) * parsedLimit;
  return { limit: parsedLimit, offset };
};

/**
 * Formats response data with pagination metadata.
 */
export const getPagingData = <T>(
  data: { count: number; rows: T[] },
  page: number = 1,
  limit: number = 10
) => {
  const { count: totalItems, rows: items } = data;
  const currentPage = Math.max(1, page);
  const totalPages = Math.ceil(totalItems / limit);

  return {
    totalItems,
    items,
    totalPages,
    currentPage,
    limit,
  };
};

/**
 * Builds standard sort options for Sequelize.
 */
export const getSorting = (
  sortBy: string = 'createdAt',
  sortOrder: string = 'DESC',
  allowedFields: string[] = []
): Order => {
  const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  const field = allowedFields.includes(sortBy) ? sortBy : 'createdAt';
  return [[field, order]];
};
```

---

## 10. Custom Middlewares

Write logging, error, and validation middlewares in `src/middlewares/`:

### `src/middlewares/logger.middleware.ts`
```typescript
import morgan from 'morgan';

export const requestLogger = morgan(':method :url :status :res[content-length] - :response-time ms');

export default requestLogger;
```

### `src/middlewares/error.middleware.ts`
```typescript
import { Request, Response, NextFunction } from 'express';

/**
 * Custom AppError to throw operational errors with status codes.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors: any[];

  constructor(message: string, statusCode: number = 500, errors: any[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype); // Restore prototype chain
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Express Error Handling Middleware.
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || [];

  // Log error for developers (exclude test environment to avoid noisy logs)
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] ${statusCode} - ${message}`, err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export default errorHandler;
```

### `src/middlewares/validation.middleware.ts`
```typescript
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Schema } from 'joi';
import { AppError } from './error.middleware';

/**
 * Validation Middleware using Joi.
 * Validates request data against a schema and handles formatting of validation errors.
 */
export const validate = (
  schema: Schema,
  source: 'body' | 'query' | 'params' = 'body'
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, ''), // Strip quotes for cleaner output
      }));

      return next(new AppError('Validation failed', 400, errorDetails));
    }

    // Overwrite the request object property with validated and cast values
    req[source] = value;
    next();
  };
};

export default validate;
```

---

## 11. Request Validation Schemas

Write Joi validation schemas under `src/validations/`:

### `src/validations/event.validation.ts`
```typescript
import Joi from 'joi';

export const createEventSchema = Joi.object({
  eventName: Joi.string().trim().min(3).max(100).required(),
  location: Joi.string().trim().min(3).max(100).required(),
  eventDate: Joi.date().iso().required(),
  capacity: Joi.number().integer().greater(0).required(),
  ticketPrice: Joi.number().min(0).required(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE'),
});

export const queryEventsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow(''),
  sortBy: Joi.string().valid('eventName', 'eventDate', 'ticketPrice', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').default('DESC'),
  location: Joi.string().trim(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE'),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  eventDate: Joi.date().iso(),
});
```

### `src/validations/registration.validation.ts`
```typescript
import Joi from 'joi';

export const createRegistrationSchema = Joi.object({
  eventId: Joi.number().integer().positive().required(),
  fullName: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email().required(),
  tickets: Joi.number().integer().positive().required(),
});

export const queryRegistrationsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow(''),
  sortBy: Joi.string().valid('registrationNumber', 'fullName', 'email', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').default('DESC'),
  eventId: Joi.number().integer().positive(),
  status: Joi.string().valid('REGISTERED', 'CANCELLED', 'WAITLIST'),
  registrationDate: Joi.date().iso(),
});
```

---

## 12. Business Logic Services

Write domain services in `src/services/` to enforce business rules, transaction locks, and aggregations:

### `src/services/dashboard.service.ts`
```typescript
import { sequelize, Event, Registration } from '../models';
import { fn, col, literal } from 'sequelize';

/**
 * Fetch aggregate data for the system dashboard.
 */
export async function getDashboardStats() {
  // 1. Total and Active Events
  const totalEvents = await Event.count();
  const activeEvents = await Event.count({ where: { status: 'ACTIVE' } });

  // 2. Registrations counts (Registered/Waitlisted vs Cancelled)
  const totalRegistrations = await Registration.count({
    where: { status: ['REGISTERED', 'WAITLIST'] },
  });
  const cancelledRegistrations = await Registration.count({
    where: { status: 'CANCELLED' },
  });

  // 3. Total Revenue (sum of totalAmount for REGISTERED status only)
  const totalRevenueResult = await Registration.sum('totalAmount', {
    where: { status: 'REGISTERED' },
  });
  const totalRevenue = totalRevenueResult ? parseFloat(totalRevenueResult as unknown as string) : 0.0;

  // 4. Top Events (by registered ticket sales)
  const topEvents = await Event.findAll({
    attributes: [
      'id',
      'eventName',
      'location',
      'eventDate',
      'capacity',
      'availableSeats',
      [fn('COALESCE', fn('SUM', col('registrations.tickets')), 0), 'registeredSeats'],
      [fn('COALESCE', fn('SUM', col('registrations.totalAmount')), 0.0), 'revenue'],
    ],
    include: [
      {
        model: Registration,
        as: 'registrations',
        attributes: [],
        where: { status: 'REGISTERED' },
        required: false, // LEFT JOIN so we don't exclude events with 0 registrations
      },
    ],
    group: ['Event.id'],
    order: [[literal('registeredSeats'), 'DESC']],
    limit: 5,
    subQuery: false, // Ensures limit and grouping are executed correctly in a single SQL query
  });

  // Format top events output
  const formattedTopEvents = topEvents.map((evt: any) => {
    const data = evt.get({ plain: true });
    return {
      eventId: data.id,
      eventName: data.eventName,
      location: data.location,
      eventDate: data.eventDate,
      capacity: data.capacity,
      availableSeats: data.availableSeats,
      registeredSeats: parseInt(data.registeredSeats, 10),
      revenue: parseFloat(data.revenue),
    };
  });

  return {
    totalEvents,
    activeEvents,
    totalRegistrations,
    cancelledRegistrations,
    totalRevenue,
    topEvents: formattedTopEvents,
  };
}
```

### `src/services/event.service.ts`
```typescript
import { Op, fn, col } from 'sequelize';
import { Event } from '../models/Event';
import { Registration } from '../models/Registration';
import { AppError } from '../middlewares/error.middleware';
import { getPagination, getPagingData, getSorting } from '../utils/query.utils';

/**
 * Create a new event.
 */
export async function createEvent(data: {
  eventName: string;
  location: string;
  eventDate: string | Date;
  capacity: number;
  ticketPrice: number;
  status?: 'ACTIVE' | 'INACTIVE';
}) {
  const { eventName, location, eventDate, capacity, ticketPrice, status } = data;

  // Business Rule: Event date cannot be in the past
  const inputDate = new Date(eventDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (inputDate < today) {
    throw new AppError('Event date cannot be in the past', 400);
  }

  // Business Rule: Event name must be unique for the same date
  const existingEvent = await Event.findOne({
    where: {
      eventName,
      eventDate: inputDate.toISOString().slice(0, 10), // date-only format YYYY-MM-DD
    },
  });

  if (existingEvent) {
    throw new AppError('An event with this name already exists on this date', 400);
  }

  // Create event, setting availableSeats initially equal to capacity
  const event = await Event.create({
    eventName,
    location,
    eventDate: inputDate,
    capacity,
    availableSeats: capacity,
    ticketPrice,
    status: status || 'ACTIVE',
  });

  return event;
}

/**
 * Get filtered, sorted, paginated list of events.
 */
export async function getEvents(query: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  location?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  minPrice?: number;
  maxPrice?: number;
  eventDate?: string;
}) {
  const { page = 1, limit = 10, search, sortBy, sortOrder, location, status, minPrice, maxPrice, eventDate } = query;

  const whereClause: any = {};

  // Search by eventName and location
  if (search) {
    whereClause[Op.or] = [
      { eventName: { [Op.like]: `%${search}%` } },
      { location: { [Op.like]: `%${search}%` } },
    ];
  }

  // Filter by location
  if (location) {
    whereClause.location = location;
  }

  // Filter by status
  if (status) {
    whereClause.status = status;
  }

  // Filter by eventDate
  if (eventDate) {
    whereClause.eventDate = eventDate;
  }

  // Filter by ticket price range
  if (minPrice !== undefined || maxPrice !== undefined) {
    whereClause.ticketPrice = {};
    if (minPrice !== undefined) {
      whereClause.ticketPrice[Op.gte] = minPrice;
    }
    if (maxPrice !== undefined) {
      whereClause.ticketPrice[Op.lte] = maxPrice;
    }
  }

  const { limit: parsedLimit, offset } = getPagination(page, limit);
  const order = getSorting(sortBy, sortOrder, ['eventName', 'eventDate', 'ticketPrice', 'createdAt']);

  const events = await Event.findAndCountAll({
    where: whereClause,
    limit: parsedLimit,
    offset,
    order,
  });

  return getPagingData(events, page, parsedLimit);
}

/**
 * Get summary for a specific event.
 */
export async function getEventSummary(eventId: number) {
  const event = await Event.findByPk(eventId);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  // Calculate registeredSeats and totalRevenue using aggregate queries
  const registrations = await Registration.findAll({
    where: {
      eventId,
      status: 'REGISTERED',
    },
    attributes: [
      [fn('SUM', col('tickets')), 'totalTickets'],
      [fn('SUM', col('totalAmount')), 'totalRevenue'],
    ],
    raw: true,
  });

  const stats = registrations[0] as any;
  const registeredSeats = stats && stats.totalTickets ? parseInt(stats.totalTickets, 10) : 0;
  const totalRevenue = stats && stats.totalRevenue ? parseFloat(stats.totalRevenue) : 0.0;
  const availableSeats = event.capacity - registeredSeats;

  return {
    eventId: event.id,
    eventName: event.eventName,
    capacity: event.capacity,
    registeredSeats,
    availableSeats,
    totalRevenue,
  };
}
```

### `src/services/registration.service.ts`
```typescript
import { Op } from 'sequelize';
import { sequelize, Event, Registration, AuditLog } from '../models';
import { AppError } from '../middlewares/error.middleware';
import { getPagination, getPagingData, getSorting } from '../utils/query.utils';
import { generateRegistrationNumber } from '../utils/helpers';

/**
 * Register for an event.
 * Handles capacity validation, waitlisting, seat decrement, and audit logging using a transaction.
 */
export async function createRegistration(data: {
  eventId: number;
  fullName: string;
  email: string;
  tickets: number;
}) {
  const { eventId, fullName, email, tickets } = data;

  // Use a Sequelize transaction for safety and atomicity
  const result = await sequelize.transaction(async (t) => {
    // 1. Fetch Event with lock to prevent race conditions on capacity/available seats
    const event = await Event.findByPk(eventId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    if (event.status !== 'ACTIVE') {
      throw new AppError('Event is not active', 400);
    }

    // 2. Check if this email is already registered (either registered or waitlisted)
    const existingRegistration = await Registration.findOne({
      where: {
        eventId,
        email,
        status: { [Op.in]: ['REGISTERED', 'WAITLIST'] },
      },
      transaction: t,
    });

    if (existingRegistration) {
      throw new AppError('Email is already registered for this event', 400);
    }

    // 3. Determine registration status (Waitlist if seats are insufficient)
    let status: 'REGISTERED' | 'WAITLIST' = 'REGISTERED';
    if (tickets > event.availableSeats) {
      status = 'WAITLIST';
    }

    // 4. Calculate total amount
    const totalAmount = tickets * event.ticketPrice;

    // 5. Generate unique registration number
    const registrationNumber = generateRegistrationNumber();

    // 6. Create Registration record
    const registration = await Registration.create(
      {
        registrationNumber,
        eventId,
        fullName,
        email,
        tickets,
        totalAmount,
        status,
      },
      { transaction: t }
    );

    // 7. Update Event availableSeats if not waitlisted
    if (status === 'REGISTERED') {
      event.availableSeats -= tickets;
      await event.save({ transaction: t });
    }

    // 8. Create Audit Log entry
    await AuditLog.create(
      {
        registrationId: registration.id,
        oldStatus: null,
        newStatus: status,
      },
      { transaction: t }
    );

    return { registration, event };
  });

  return result;
}

/**
 * Cancel an existing registration.
 * Restores event available seats and creates an audit log.
 */
export async function cancelRegistration(registrationId: number) {
  const result = await sequelize.transaction(async (t) => {
    // 1. Fetch registration with lock
    const registration = await Registration.findByPk(registrationId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!registration) {
      throw new AppError('Registration not found', 404);
    }

    // 2. Check if already cancelled
    if (registration.status === 'CANCELLED') {
      throw new AppError('Registration is already cancelled', 400);
    }

    const oldStatus = registration.status;

    // 3. Update registration status
    registration.status = 'CANCELLED';
    await registration.save({ transaction: t });

    // 4. Restore available seats if it was REGISTERED
    if (oldStatus === 'REGISTERED') {
      const event = await Event.findByPk(registration.eventId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (event) {
        event.availableSeats += registration.tickets;
        // Ensure availableSeats does not exceed capacity
        if (event.availableSeats > event.capacity) {
          event.availableSeats = event.capacity;
        }
        await event.save({ transaction: t });
      }
    }

    // 5. Log status change in Audit Logs
    await AuditLog.create(
      {
        registrationId: registration.id,
        oldStatus,
        newStatus: 'CANCELLED',
      },
      { transaction: t }
    );

    return registration;
  });

  return result;
}

/**
 * List registrations with filters, sorting, and pagination.
 */
export async function getRegistrations(query: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  eventId?: number;
  status?: 'REGISTERED' | 'CANCELLED' | 'WAITLIST';
  registrationDate?: string;
}) {
  const { page = 1, limit = 10, search, sortBy, sortOrder, eventId, status, registrationDate } = query;

  const whereClause: any = {};

  // Search by registrationNumber, fullName, email
  if (search) {
    whereClause[Op.or] = [
      { registrationNumber: { [Op.like]: `%${search}%` } },
      { fullName: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }

  // Filter by eventId
  if (eventId) {
    whereClause.eventId = eventId;
  }

  // Filter by status
  if (status) {
    whereClause.status = status;
  }

  // Filter by registration date
  if (registrationDate) {
    // Compare only date part of createdAt
    whereClause[Op.and] = [
      sequelize.where(
        sequelize.fn('DATE', sequelize.col('createdAt')),
        '=',
        registrationDate
      ),
    ];
  }

  const { limit: parsedLimit, offset } = getPagination(page, limit);
  const order = getSorting(sortBy, sortOrder, ['registrationNumber', 'fullName', 'email', 'createdAt']);

  const registrations = await Registration.findAndCountAll({
    where: whereClause,
    limit: parsedLimit,
    offset,
    order,
    include: [
      {
        model: Event,
        as: 'event',
        attributes: ['id', 'eventName', 'location', 'eventDate'],
      },
    ],
  });

  return getPagingData(registrations, page, parsedLimit);
}
```

---

## 13. API Controllers

Write the Express request handler controllers under `src/controllers/`:

### `src/controllers/dashboard.controller.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import * as dashboardService from '../services/dashboard.service';

/**
 * GET /dashboard
 * Returns aggregate statistics for the dashboard.
 */
export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await dashboardService.getDashboardStats();
    return res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}
```

### `src/controllers/event.controller.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import * as eventService from '../services/event.service';

/**
 * POST /events
 * Creates a new event.
 */
export async function createEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const event = await eventService.createEvent(req.body);
    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /events
 * Returns a filtered, sorted, and paginated list of events.
 */
export async function getEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await eventService.getEvents(req.query as any);
    return res.status(200).json({
      success: true,
      message: 'Events retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /events/:id/summary
 * Returns the registration summary of a specific event.
 */
export async function getEventSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const eventId = parseInt(req.params.id, 10);
    const summary = await eventService.getEventSummary(eventId);
    return res.status(200).json({
      success: true,
      message: 'Event summary retrieved successfully',
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}
```

### `src/controllers/registration.controller.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import * as registrationService from '../services/registration.service';

/**
 * POST /registrations
 * Registers a user for an event.
 */
export async function createRegistration(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await registrationService.createRegistration(req.body);
    const isWaitlist = result.registration.status === 'WAITLIST';

    return res.status(201).json({
      success: true,
      message: isWaitlist
        ? 'Registration placed on the waitlist'
        : 'Event registration successful',
      data: result.registration,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /registrations/:id/cancel
 * Cancels a registration.
 */
export async function cancelRegistration(req: Request, res: Response, next: NextFunction) {
  try {
    const registrationId = parseInt(req.params.id, 10);
    const registration = await registrationService.cancelRegistration(registrationId);

    return res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully',
      data: registration,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /registrations
 * Returns a filtered and paginated list of registrations.
 */
export async function getRegistrations(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await registrationService.getRegistrations(req.query as any);
    return res.status(200).json({
      success: true,
      message: 'Registrations retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
```

---

## 14. Routing & Swagger Setup

Assemble routes and Swagger schema documentation under `src/routes/` and `src/docs/`:

### `src/routes/event.routes.ts`
```typescript
import { Router } from 'express';
import * as eventController from '../controllers/event.controller';
import { validate } from '../middlewares/validation.middleware';
import { createEventSchema, queryEventsSchema } from '../validations/event.validation';

const router = Router();

router.post(
  '/',
  validate(createEventSchema, 'body'),
  eventController.createEvent
);

router.get(
  '/',
  validate(queryEventsSchema, 'query'),
  eventController.getEvents
);

router.get(
  '/:id/summary',
  eventController.getEventSummary
);

export default router;
```

### `src/routes/registration.routes.ts`
```typescript
import { Router } from 'express';
import * as registrationController from '../controllers/registration.controller';
import { validate } from '../middlewares/validation.middleware';
import { createRegistrationSchema, queryRegistrationsSchema } from '../validations/registration.validation';

const router = Router();

router.post(
  '/',
  validate(createRegistrationSchema, 'body'),
  registrationController.createRegistration
);

router.patch(
  '/:id/cancel',
  registrationController.cancelRegistration
);

router.get(
  '/',
  validate(queryRegistrationsSchema, 'query'),
  registrationController.getRegistrations
);

export default router;
```

### `src/routes/dashboard.routes.ts`
```typescript
import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';

const router = Router();

router.get('/', dashboardController.getDashboardStats);

export default router;
```

### `src/routes/index.ts`
```typescript
import { Router } from 'express';
import eventRouter from './event.routes';
import registrationRouter from './registration.routes';
import dashboardRouter from './dashboard.routes';

const apiRouter = Router();

apiRouter.use('/events', eventRouter);
apiRouter.use('/registrations', registrationRouter);
apiRouter.use('/dashboard', dashboardRouter);

export default apiRouter;
export { apiRouter };
```

### `src/docs/swagger.ts`
This file configures Swagger OpenAPI documentation and specs for interactive API testing.
```typescript
import swaggerUi from 'swagger-ui-express';

const swaggerDocument: any = {
  openapi: '3.0.0',
  info: {
    title: 'Event Registration & Ticket Management API',
    version: '1.0.0',
    description: 'A robust, interview-friendly Express API for managing events and registrations built with Node.js, TypeScript, Express.js, MySQL, and Sequelize ORM.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development server',
    },
  ],
  paths: {
    '/events': {
      post: {
        tags: ['Events'],
        summary: 'Create a new event',
        description: 'Creates a new event with a given capacity, ticket price, location, and date.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateEventInput',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Event created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/EventResponse',
                },
              },
            },
          },
          400: {
            description: 'Validation failed or duplicate event name for date',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      get: {
        tags: ['Events'],
        summary: 'List events',
        description: 'Retrieves a list of events with filtering, search, pagination, and sorting.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Number of records per page' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search term (matches name or location)' },
          { name: 'location', in: 'query', schema: { type: 'string' }, description: 'Filter by exact location' },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] }, description: 'Filter by status' },
          { name: 'minPrice', in: 'query', schema: { type: 'number' }, description: 'Filter by minimum ticket price' },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' }, description: 'Filter by maximum ticket price' },
          { name: 'eventDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Filter by event date (YYYY-MM-DD)' },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['eventName', 'eventDate', 'ticketPrice', 'createdAt'], default: 'createdAt' }, description: 'Sort field' },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['ASC', 'DESC'], default: 'DESC' }, description: 'Sort direction' },
        ],
        responses: {
          200: {
            description: 'Events retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/EventsListResponse',
                },
              },
            },
          },
        },
      },
    },
    '/events/{id}/summary': {
      get: {
        tags: ['Events'],
        summary: 'Get event summary',
        description: 'Returns real-time reservation metrics for a specific event.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Event ID' },
        ],
        responses: {
          200: {
            description: 'Event summary retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/EventSummaryResponse',
                },
              },
            },
          },
          404: {
            description: 'Event not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/registrations': {
      post: {
        tags: ['Registrations'],
        summary: 'Register for an event',
        description: 'Books tickets for an active event. Creates a waitlisted registration if tickets exceed available seats.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateRegistrationInput',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Event registration successful or waitlisted',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RegistrationResponse',
                },
              },
            },
          },
          400: {
            description: 'Bad request (duplicate email, inactive event, validation error)',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          404: {
            description: 'Event not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      get: {
        tags: ['Registrations'],
        summary: 'List registrations',
        description: 'Retrieves a list of registrations with filtering, search, pagination, and sorting.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Number of records per page' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search term (matches registration number, name, or email)' },
          { name: 'eventId', in: 'query', schema: { type: 'integer' }, description: 'Filter by event ID' },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['REGISTERED', 'CANCELLED', 'WAITLIST'] }, description: 'Filter by status' },
          { name: 'registrationDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Filter by registration date (YYYY-MM-DD)' },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['registrationNumber', 'fullName', 'email', 'createdAt'], default: 'createdAt' }, description: 'Sort field' },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['ASC', 'DESC'], default: 'DESC' }, description: 'Sort direction' },
        ],
        responses: {
          200: {
            description: 'Registrations retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RegistrationsListResponse',
                },
              },
            },
          },
        },
      },
    },
    '/registrations/{id}/cancel': {
      patch: {
        tags: ['Registrations'],
        summary: 'Cancel a registration',
        description: 'Cancels a registration, releases reserved seats, and logs the change.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Registration ID' },
        ],
        responses: {
          200: {
            description: 'Registration cancelled successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RegistrationResponse',
                },
              },
            },
          },
          400: {
            description: 'Registration already cancelled',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          404: {
            description: 'Registration not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/dashboard': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get dashboard statistics',
        description: 'Returns total events, active events, registrations status, total revenue, and top performing events.',
        responses: {
          200: {
            description: 'Dashboard stats retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/DashboardResponse',
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      CreateEventInput: {
        type: 'object',
        required: ['eventName', 'location', 'eventDate', 'capacity', 'ticketPrice'],
        properties: {
          eventName: { type: 'string', example: 'Tech Summit 2026' },
          location: { type: 'string', example: 'San Francisco' },
          eventDate: { type: 'string', format: 'date', example: '2026-08-15' },
          capacity: { type: 'integer', example: 500 },
          ticketPrice: { type: 'number', example: 150.00 },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'], example: 'ACTIVE' },
        },
      },
      CreateRegistrationInput: {
        type: 'object',
        required: ['eventId', 'fullName', 'email', 'tickets'],
        properties: {
          eventId: { type: 'integer', example: 1 },
          fullName: { type: 'string', example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          tickets: { type: 'integer', example: 2 },
        },
      },
      EventResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Event created successfully' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              eventName: { type: 'string', example: 'Tech Summit 2026' },
              location: { type: 'string', example: 'San Francisco' },
              eventDate: { type: 'string', example: '2026-08-15' },
              capacity: { type: 'integer', example: 500 },
              availableSeats: { type: 'integer', example: 500 },
              ticketPrice: { type: 'number', example: 150.00 },
              status: { type: 'string', example: 'ACTIVE' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
      EventsListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Events retrieved successfully' },
          data: {
            type: 'object',
            properties: {
              totalItems: { type: 'integer', example: 1 },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer' },
                    eventName: { type: 'string' },
                    location: { type: 'string' },
                    eventDate: { type: 'string' },
                    capacity: { type: 'integer' },
                    availableSeats: { type: 'integer' },
                    ticketPrice: { type: 'number' },
                    status: { type: 'string' },
                  },
                },
              },
              totalPages: { type: 'integer', example: 1 },
              currentPage: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 10 },
            },
          },
        },
      },
      EventSummaryResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Event summary retrieved successfully' },
          data: {
            type: 'object',
            properties: {
              eventId: { type: 'integer', example: 1 },
              eventName: { type: 'string', example: 'Tech Summit 2026' },
              capacity: { type: 'integer', example: 500 },
              registeredSeats: { type: 'integer', example: 320 },
              availableSeats: { type: 'integer', example: 180 },
              totalRevenue: { type: 'number', example: 48000.00 },
            },
          },
        },
      },
      RegistrationResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Event registration successful' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              registrationNumber: { type: 'string', example: 'REG-20260617-1001' },
              eventId: { type: 'integer', example: 1 },
              fullName: { type: 'string', example: 'John Doe' },
              email: { type: 'string', example: 'john@example.com' },
              tickets: { type: 'integer', example: 2 },
              totalAmount: { type: 'number', example: 300.00 },
              status: { type: 'string', example: 'REGISTERED' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
      RegistrationsListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Registrations retrieved successfully' },
          data: {
            type: 'object',
            properties: {
              totalItems: { type: 'integer', example: 1 },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer' },
                    registrationNumber: { type: 'string' },
                    eventId: { type: 'integer' },
                    fullName: { type: 'string' },
                    email: { type: 'string' },
                    tickets: { type: 'integer' },
                    totalAmount: { type: 'number' },
                    status: { type: 'string' },
                    event: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        eventName: { type: 'string' },
                        location: { type: 'string' },
                        eventDate: { type: 'string' },
                      },
                    },
                  },
                },
              },
              totalPages: { type: 'integer', example: 1 },
              currentPage: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 10 },
            },
          },
        },
      },
      DashboardResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Dashboard stats retrieved successfully' },
          data: {
            type: 'object',
            properties: {
              totalEvents: { type: 'integer', example: 50 },
              activeEvents: { type: 'integer', example: 30 },
              totalRegistrations: { type: 'integer', example: 5000 },
              cancelledRegistrations: { type: 'integer', example: 200 },
              totalRevenue: { type: 'number', example: 7500000 },
              topEvents: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    eventId: { type: 'integer' },
                    eventName: { type: 'string' },
                    location: { type: 'string' },
                    eventDate: { type: 'string' },
                    capacity: { type: 'integer' },
                    availableSeats: { type: 'integer' },
                    registeredSeats: { type: 'integer' },
                    revenue: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'email must be a valid email' },
              },
            },
          },
        },
      },
    },
  },
};

export const serveSwagger = swaggerUi.serve;
export const swaggerUiSetup = swaggerUi.setup(swaggerDocument);
```

---

## 15. Server Bootstrapping

Create `src/app.ts` and `src/server.ts` to coordinate express and start listening:

### `src/app.ts`
```typescript
import express, { Application } from 'express';
import cors from 'cors';
import requestLogger from './middlewares/logger.middleware';
import errorHandler from './middlewares/error.middleware';
import apiRouter from './routes';
import { serveSwagger, swaggerUiSetup } from './docs/swagger';

const app: Application = express();

// Standard Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// API Documentation (Swagger)
app.use('/api-docs', serveSwagger, swaggerUiSetup);

// API Routes
app.use('/', apiRouter);

// Global Error Handler
app.use(errorHandler);

export default app;
export { app };
```

### `src/server.ts`
```typescript
import dotenv from 'dotenv';
import app from './app';
import { sequelize } from './models';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Authenticate database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Unable to start the server due to database connection error:', error);
    process.exit(1);
  }
};

startServer();
```

---

## 16. Test Configuration & Test Cases

Configure and write test suites inside `jest.config.js` and `src/tests/`:

### `jest.config.js`
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/tests/**/*.test.ts'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
};
```

### `src/tests/registration.test.ts`
```typescript
import { sequelize, Event, Registration, AuditLog } from '../models';
import * as registrationService from '../services/registration.service';
import { AppError } from '../middlewares/error.middleware';

// Mock the entire models index module
jest.mock('../models', () => {
  const mockTransaction = jest.fn((callback) =>
    callback({
      LOCK: { UPDATE: 'UPDATE' },
    })
  );
  return {
    sequelize: {
      transaction: mockTransaction,
    },
    Event: {
      findByPk: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
    },
    Registration: {
      findOne: jest.fn(),
      create: jest.fn(),
      findByPk: jest.fn(),
    },
    AuditLog: {
      create: jest.fn(),
    },
  };
});

describe('RegistrationService Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (sequelize.transaction as jest.Mock).mockImplementation((callback) =>
      callback({
        LOCK: { UPDATE: 'UPDATE' },
      })
    );
  });

  describe('createRegistration', () => {
    it('should successfully register for an event when seats are available', async () => {
      // Mock Event data
      const mockEvent = {
        id: 1,
        eventName: 'Tech Summit 2026',
        capacity: 100,
        availableSeats: 50,
        ticketPrice: 150.00,
        status: 'ACTIVE',
        save: jest.fn().mockResolvedValue(true),
      };

      // Mock Registration data
      const mockRegInput = {
        eventId: 1,
        fullName: 'John Doe',
        email: 'john@example.com',
        tickets: 2,
      };

      const mockCreatedReg = {
        id: 101,
        registrationNumber: 'REG-20260617-XXXX',
        eventId: 1,
        fullName: 'John Doe',
        email: 'john@example.com',
        tickets: 2,
        totalAmount: 300.00,
        status: 'REGISTERED',
      };

      // Setup mock behavior
      (Event.findByPk as jest.Mock).mockResolvedValue(mockEvent);
      (Registration.findOne as jest.Mock).mockResolvedValue(null); // No existing registration
      (Registration.create as jest.Mock).mockResolvedValue(mockCreatedReg);
      (AuditLog.create as jest.Mock).mockResolvedValue({});

      // Execute service call
      const result = await registrationService.createRegistration(mockRegInput);

      // Verify outcomes
      expect(Event.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
      expect(Registration.findOne).toHaveBeenCalled();
      expect(Registration.create).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: 1,
          email: 'john@example.com',
          tickets: 2,
          totalAmount: 300.00,
          status: 'REGISTERED',
        }),
        expect.any(Object)
      );

      // Event seats should decrement
      expect(mockEvent.availableSeats).toBe(48); // 50 - 2
      expect(mockEvent.save).toHaveBeenCalled();

      // Audit Log should be generated
      expect(AuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          registrationId: 101,
          oldStatus: null,
          newStatus: 'REGISTERED',
        }),
        expect.any(Object)
      );

      expect(result.registration.status).toBe('REGISTERED');
    });

    it('should place registration on WAITLIST status if tickets exceed availableSeats', async () => {
      const mockEvent = {
        id: 1,
        eventName: 'Tech Summit 2026',
        capacity: 100,
        availableSeats: 2, // Only 2 seats left
        ticketPrice: 150.00,
        status: 'ACTIVE',
        save: jest.fn().mockResolvedValue(true),
      };

      const mockRegInput = {
        eventId: 1,
        fullName: 'John Doe',
        email: 'john@example.com',
        tickets: 5, // Requesting 5 tickets
      };

      const mockCreatedReg = {
        id: 102,
        registrationNumber: 'REG-20260617-XXXX',
        eventId: 1,
        fullName: 'John Doe',
        email: 'john@example.com',
        tickets: 5,
        totalAmount: 750.00,
        status: 'WAITLIST',
      };

      (Event.findByPk as jest.Mock).mockResolvedValue(mockEvent);
      (Registration.findOne as jest.Mock).mockResolvedValue(null);
      (Registration.create as jest.Mock).mockResolvedValue(mockCreatedReg);
      (AuditLog.create as jest.Mock).mockResolvedValue({});

      const result = await registrationService.createRegistration(mockRegInput);

      expect(result.registration.status).toBe('WAITLIST');
      // Available seats should NOT decrement
      expect(mockEvent.availableSeats).toBe(2);
      expect(mockEvent.save).not.toHaveBeenCalled();

      // Audit Log should state WAITLIST
      expect(AuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          registrationId: 102,
          oldStatus: null,
          newStatus: 'WAITLIST',
        }),
        expect.any(Object)
      );
    });

    it('should throw AppError if email is already registered for this event', async () => {
      const mockEvent = {
        id: 1,
        eventName: 'Tech Summit 2026',
        capacity: 100,
        availableSeats: 50,
        status: 'ACTIVE',
      };

      const mockRegInput = {
        eventId: 1,
        fullName: 'John Doe',
        email: 'john@example.com',
        tickets: 2,
      };

      const mockExistingReg = {
        id: 99,
        email: 'john@example.com',
        status: 'REGISTERED',
      };

      (Event.findByPk as jest.Mock).mockResolvedValue(mockEvent);
      (Registration.findOne as jest.Mock).mockResolvedValue(mockExistingReg);

      await expect(registrationService.createRegistration(mockRegInput)).rejects.toThrow(
        new AppError('Email is already registered for this event', 400)
      );

      expect(Registration.create).not.toHaveBeenCalled();
    });
  });

  describe('cancelRegistration', () => {
    it('should successfully cancel a registration and restore event seats', async () => {
      const mockReg = {
        id: 201,
        registrationNumber: 'REG-20260617-1001',
        eventId: 1,
        tickets: 3,
        status: 'REGISTERED',
        save: jest.fn().mockResolvedValue(true),
      };

      const mockEvent = {
        id: 1,
        capacity: 100,
        availableSeats: 50,
        save: jest.fn().mockResolvedValue(true),
      };

      (Registration.findByPk as jest.Mock).mockResolvedValue(mockReg);
      (Event.findByPk as jest.Mock).mockResolvedValue(mockEvent);
      (AuditLog.create as jest.Mock).mockResolvedValue({});

      const result = await registrationService.cancelRegistration(201);

      expect(result.status).toBe('CANCELLED');
      expect(mockReg.save).toHaveBeenCalled();

      // Seats restored: 50 + 3 = 53
      expect(mockEvent.availableSeats).toBe(53);
      expect(mockEvent.save).toHaveBeenCalled();

      expect(AuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          registrationId: 201,
          oldStatus: 'REGISTERED',
          newStatus: 'CANCELLED',
        }),
        expect.any(Object)
      );
    });

    it('should cancel a WAITLIST registration without restoring event seats', async () => {
      const mockReg = {
        id: 202,
        registrationNumber: 'REG-20260617-1002',
        eventId: 1,
        tickets: 5,
        status: 'WAITLIST',
        save: jest.fn().mockResolvedValue(true),
      };

      const mockEvent = {
        id: 1,
        capacity: 100,
        availableSeats: 50,
        save: jest.fn().mockResolvedValue(true),
      };

      (Registration.findByPk as jest.Mock).mockResolvedValue(mockReg);
      (Event.findByPk as jest.Mock).mockResolvedValue(mockEvent);
      (AuditLog.create as jest.Mock).mockResolvedValue({});

      const result = await registrationService.cancelRegistration(202);

      expect(result.status).toBe('CANCELLED');
      expect(mockReg.save).toHaveBeenCalled();

      // Seats should remain unchanged
      expect(mockEvent.availableSeats).toBe(50);
      expect(mockEvent.save).not.toHaveBeenCalled();

      expect(AuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          registrationId: 202,
          oldStatus: 'WAITLIST',
          newStatus: 'CANCELLED',
        }),
        expect.any(Object)
      );
    });

    it('should throw AppError if trying to cancel an already CANCELLED registration', async () => {
      const mockReg = {
        id: 203,
        status: 'CANCELLED',
      };

      (Registration.findByPk as jest.Mock).mockResolvedValue(mockReg);

      await expect(registrationService.cancelRegistration(203)).rejects.toThrow(
        new AppError('Registration is already cancelled', 400)
      );

      expect(AuditLog.create).not.toHaveBeenCalled();
    });
  });
});
```

### `src/tests/api.test.ts`
```typescript
import request from 'supertest';
import app from '../app';
import { sequelize, Event, Registration, AuditLog } from '../models';

// Mock the models to prevent actual database connections/calls
jest.mock('../models', () => {
  const mockTransaction = jest.fn((callback) =>
    callback({
      LOCK: { UPDATE: 'UPDATE' },
    })
  );
  return {
    sequelize: {
      transaction: mockTransaction,
    },
    Event: {
      findByPk: jest.fn(),
      findOne: jest.fn(),
    },
    Registration: {
      findOne: jest.fn(),
      create: jest.fn(),
      findByPk: jest.fn(),
    },
    AuditLog: {
      create: jest.fn(),
    },
  };
});

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (sequelize.transaction as jest.Mock).mockImplementation((callback) =>
      callback({
        LOCK: { UPDATE: 'UPDATE' },
      })
    );
  });

  describe('POST /registrations (Event Registration & Capacity Validation)', () => {
    it('should return 400 validation error if body parameters are invalid', async () => {
      const response = await request(app)
        .post('/registrations')
        .send({
          eventId: 'not-a-number', // invalid type
          fullName: '', // should not be empty
          email: 'invalid-email', // invalid format
          tickets: 0, // must be at least 1
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should successfully register for an event when capacity allows', async () => {
      const mockEvent = {
        id: 1,
        eventName: 'Interview Prep Seminar',
        capacity: 100,
        availableSeats: 50,
        ticketPrice: 0.00,
        status: 'ACTIVE',
        save: jest.fn().mockResolvedValue(true),
      };

      const mockReg = {
        id: 10,
        registrationNumber: 'REG-20260617-9999',
        eventId: 1,
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        tickets: 2,
        totalAmount: 0.00,
        status: 'REGISTERED',
      };

      (Event.findByPk as jest.Mock).mockResolvedValue(mockEvent);
      (Registration.findOne as jest.Mock).mockResolvedValue(null); // No previous registration
      (Registration.create as jest.Mock).mockResolvedValue(mockReg);
      (AuditLog.create as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .post('/registrations')
        .send({
          eventId: 1,
          fullName: 'Jane Doe',
          email: 'jane@example.com',
          tickets: 2,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('REGISTERED');
      expect(response.body.data.registrationNumber).toBe('REG-20260617-9999');
      expect(mockEvent.availableSeats).toBe(48); // 50 - 2
      expect(mockEvent.save).toHaveBeenCalled();
    });

    it('should place registration on WAITLIST status if tickets request exceeds available seats', async () => {
      const mockEvent = {
        id: 1,
        eventName: 'Interview Prep Seminar',
        capacity: 100,
        availableSeats: 1, // Only 1 seat left
        ticketPrice: 0.00,
        status: 'ACTIVE',
        save: jest.fn().mockResolvedValue(true),
      };

      const mockReg = {
        id: 11,
        registrationNumber: 'REG-20260617-1111',
        eventId: 1,
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        tickets: 3, // Requesting 3 tickets
        totalAmount: 0.00,
        status: 'WAITLIST',
      };

      (Event.findByPk as jest.Mock).mockResolvedValue(mockEvent);
      (Registration.findOne as jest.Mock).mockResolvedValue(null);
      (Registration.create as jest.Mock).mockResolvedValue(mockReg);
      (AuditLog.create as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .post('/registrations')
        .send({
          eventId: 1,
          fullName: 'Jane Doe',
          email: 'jane@example.com',
          tickets: 3,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('WAITLIST');
      // Available seats should NOT change
      expect(mockEvent.availableSeats).toBe(1);
      expect(mockEvent.save).not.toHaveBeenCalled();
    });
  });

  describe('PATCH /registrations/:id/cancel (Registration Cancellation)', () => {
    it('should successfully cancel a REGISTERED registration and restore available seats', async () => {
      const mockReg = {
        id: 10,
        eventId: 1,
        tickets: 2,
        status: 'REGISTERED',
        save: jest.fn().mockResolvedValue(true),
      };

      const mockEvent = {
        id: 1,
        capacity: 100,
        availableSeats: 48,
        save: jest.fn().mockResolvedValue(true),
      };

      (Registration.findByPk as jest.Mock).mockResolvedValue(mockReg);
      (Event.findByPk as jest.Mock).mockResolvedValue(mockEvent);
      (AuditLog.create as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .patch('/registrations/10/cancel')
        .send();

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Registration cancelled successfully');
      expect(response.body.data.status).toBe('CANCELLED');
      
      // Seats should be restored: 48 + 2 = 50
      expect(mockEvent.availableSeats).toBe(50);
      expect(mockEvent.save).toHaveBeenCalled();
    });

    it('should return 400 if trying to cancel an already cancelled registration', async () => {
      const mockReg = {
        id: 12,
        status: 'CANCELLED',
      };

      (Registration.findByPk as jest.Mock).mockResolvedValue(mockReg);

      const response = await request(app)
        .patch('/registrations/12/cancel')
        .send();

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Registration is already cancelled');
    });

    it('should return 404 if registration to cancel is not found', async () => {
      (Registration.findByPk as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .patch('/registrations/999/cancel')
        .send();

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Registration not found');
    });
  });
});
```

---

## 17. Commands to Run, Migrate, Seed, and Test

Use the following commands during development and deployment:

### 1. Database Initialization
```bash
# Run migrations (creates tables and indexes)
npm run db:migrate

# Seed Database (populates initial mock values)
npm run db:seed

# Undo Migrations (drops tables, clears schema)
npm run db:undo
```

### 2. Run Local Servers
```bash
# Development Mode (runs src/server.ts directly using ts-node-dev with hot reloading)
npm run dev

# Build for Production (compiles TypeScript to JavaScript in /dist directory)
npm run build

# Start Production Server (builds and runs dist/server.js)
npm start
```

### 3. Run Test Suites
```bash
# Run unit and integration tests (uses jest to execute tests in src/tests/)
npm run test
```

### 4. Interactive Swagger UI
Open your browser and navigate to:
**[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**
