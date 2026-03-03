# Types Documentation

This directory contains JSDoc type definitions for the Bakora Amal platform. These types help with:

- **IDE Autocomplete**: Better IntelliSense support in VS Code and other editors
- **Documentation**: Self-documenting code
- **Type Safety**: Catch errors during development (when used with TypeScript checker tools)

## Usage

Import types using JSDoc comments in your files:

```javascript
/**
 * @param {import('./types/index').UserProfile} user
 * @returns {import('./types/index').AuthCredentials}
 */
function getUserCredentials(user) {
  // Your code here
}
```

Or define them at the top of your file:

```javascript
/**
 * @typedef {import('./types/index').UserProfile} UserProfile
 * @typedef {import('./types/index').Order} Order
 */
```

## Files

- **index.js**: Core type definitions (User, Order, Project, etc.)
- **api.js**: API request/response types
- **redux.js**: Redux state and hook types

## Adding New Types

When adding new types:

1. Add them to the appropriate file (index.js for entities, api.js for API types, redux.js for Redux types)
2. Use JSDoc `@typedef` syntax
3. Document all properties with `@property`
4. Use `@template` for generic types
5. Export the file with `export {};` to make it a module

## Example

```javascript
/**
 * New entity type
 * @typedef {Object} NewEntity
 * @property {string} id - Entity ID
 * @property {string} name - Entity name
 */
```

