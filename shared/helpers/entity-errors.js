class EntityNotFoundError extends Error {
  constructor(message) {
    super(message);
  }
}

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
  }
}

class DuplicateEntityError extends Error {
  constructor(message) {
    super(message);
  }
}

module.exports = { EntityNotFoundError, UnauthorizedError, DuplicateEntityError };
