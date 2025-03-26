# Claude Coding Agent Guidelines

## Commands
- **Start server**: `npm start`
- **Run migrations**: `npx sequelize-cli db:migrate`
- **Create migration**: `npx sequelize-cli model:generate --name Model --attributes field:type`
- **Run specific test**: *No test framework configured*

## Code Style Guidelines
- **Structure**: Follow modular approach with modules/{module}/{models,routes,services,validators}
- **Models**: Use Sequelize models with proper validation
- **Routes**: Follow RESTful API patterns
- **Validation**: Use Joi validators in dedicated validator files
- **Services**: Business logic in service files, extending base-service
- **Error Handling**: Use entity-errors helper for consistent error responses
- **Naming**: camelCase for variables/methods, PascalCase for classes
- **Imports**: Group by external dependencies, then internal modules
- **Documentation**: Include JSDoc comments for functions
- **Authentication**: JWT-based auth with role-based access control

## Development Flow
1. Create environment file from env_example
2. Set up database connection in .sequelize-config.js
3. Run migrations before starting server