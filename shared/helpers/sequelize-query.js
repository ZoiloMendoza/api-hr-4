const { Op, fn, col, literal } = require("sequelize");

/**
 * Recursively evaluates a value node for string expressions.
 * Supports:
 * - literal: returns its value.
 * - field: returns a Sequelize col() expression.
 * - concat: returns a Sequelize fn('concat', …) expression.
 */
function evaluateValue(node, baseModel) {
  if (node.type === "literal") {
    return node.value;
  } else if (node.type === "field") {
    if (node.path === "/") {
      return col(`${baseModel.name}.${node.value}`);
    } else {
      const assocName = node.path.split("/")[1];
      if (!baseModel.associations[assocName]) {
        throw new Error(`Association mapping for "${assocName}" not provided in base model.`);
      }
      const alias = baseModel.associations[assocName].as;
      return col(`${alias}.${node.value}`);
    }
  } else if (node.type === "concat") {
    return fn("concat", evaluateValue(node.left, baseModel), evaluateValue(node.right, baseModel));
  }
  throw new Error(`Unknown value node type: ${node.type}`);
}

/**
 * Recursively evaluates a numeric value node.
 * Supports:
 * - number: returns its numeric value.
 * - field: returns a Sequelize col() expression.
 * - binaryOp: arithmetic operations between two numeric values.
 * - unaryOp: unary operators.
 * - round: a "round" function applied to a numeric expression.
 */
function evaluateNumericValue(node, baseModel) {
  if (node.type === "number") {
    return node.value;
  } else if (node.type === "field") {
    if (node.path === "/") {
      return col(`${baseModel.name}.${node.value}`);
    } else {
      const assocName = node.path.split("/")[1];
      if (!baseModel.associations[assocName]) {
        throw new Error(`Association mapping for "${assocName}" not provided in base model.`);
      }
      const alias = baseModel.associations[assocName].as;
      return col(`${alias}.${node.value}`);
    }
  } else if (node.type === "binaryOp") {
    const left = evaluateNumericValue(node.left, baseModel);
    const right = evaluateNumericValue(node.right, baseModel);
    return literal(`(${left} ${node.operator} ${right})`);
  } else if (node.type === "unaryOp") {
    const expr = evaluateNumericValue(node.expr, baseModel);
    return literal(`(${node.operator}${expr})`);
  } else if (node.type === "round") {
    const inner = evaluateNumericValue(node.value, baseModel);
    return fn("ROUND", inner);
  }
  throw new Error(`Unknown numeric value node type: ${node.type}`);
}

/**
 * Recursively evaluates a date value node.
 * Supports:
 * - dateLiteral: returns its string value ("yyyy-mm-dd").
 * - today: returns a Sequelize fn() representing the current date (CURDATE).
 * - dateArithmetic: applies arithmetic to a date.
 * - field: returns a Sequelize col() expression.
 *
 * This implementation uses MySQL's DATE_ADD/DATE_SUB functions.
 */
function evaluateDateValue(node, baseModel) {
  if (node.type === "dateLiteral") {
    return node.value;
  } else if (node.type === "today") {
    return fn("CURDATE");
  } else if (node.type === "dateArithmetic") {
    const baseDate = evaluateDateValue(node.base, baseModel);
    if (node.operator === "+") {
      return fn("DATE_ADD", baseDate, literal(`INTERVAL 1 ${node.period.toUpperCase()}`));
    } else if (node.operator === "-") {
      return fn("DATE_SUB", baseDate, literal(`INTERVAL 1 ${node.period.toUpperCase()}`));
    }
    throw new Error(`Unsupported date arithmetic operator: ${node.operator}`);
  } else if (node.type === "field") {
    if (node.path === "/") {
      return col(`${baseModel.name}.${node.value}`);
    } else {
      const assocName = node.path.split("/")[1];
      if (!baseModel.associations[assocName]) {
        throw new Error(`Association mapping for "${assocName}" not provided in base model.`);
      }
      const alias = baseModel.associations[assocName].as;
      return col(`${alias}.${node.value}`);
    }
  }
  throw new Error(`Unknown date value node type: ${node.type}`);
}

/**
 * Recursively evaluates a boolean value node.
 * Supports:
 * - booleanLiteral: returns its boolean value.
 * - booleanNot: returns a Sequelize not() expression.
 * - field: returns a Sequelize col() expression (assumed to be a boolean field).
 */
function evaluateBooleanValue(node, baseModel) {
  if (node.type === "booleanLiteral") {
    return node.value;
  } else if (node.type === "booleanNot") {
    return { [Op.not]: evaluateBooleanValue(node.value, baseModel) };
  } else if (node.type === "field") {
    if (node.path === "/") {
      return col(`${baseModel.name}.${node.value}`);
    } else {
      const assocName = node.path.split("/")[1];
      if (!baseModel.associations[assocName]) {
        throw new Error(`Association mapping for "${assocName}" not provided in base model.`);
      }
      const alias = baseModel.associations[assocName].as;
      return col(`${alias}.${node.value}`);
    }
  }
  throw new Error(`Unknown boolean node type: ${node.type}`);
}

/**
 * Recursively prefixes all non-operator keys in a clause object with the provided prefix.
 */
function prefixClause(clause, prefix) {
  if (Array.isArray(clause)) {
    return clause.map(item => prefixClause(item, prefix));
  }
  if (typeof clause !== "object" || clause === null) {
    return clause;
  }
  if (
    clause.constructor &&
    (clause.constructor.name === "Fn" || clause.constructor.name === "Col")
  ) {
    return clause;
  }
  const newClause = {};
  for (const key in clause) {
    if (key === Op.and || key === Op.or || key === Op.not || key.startsWith("Op.")) {
      newClause[key] = prefixClause(clause[key], prefix);
    } else {
      newClause[`$${prefix}.${key}$`] = prefixClause(clause[key], prefix);
    }
  }
  return newClause;
}

/**
 * Translates an AST of search clauses into a Sequelize query object.
 *
 * Supported node types:
 *   - "comparison": string comparison.
 *   - "numericComparison": numeric comparison.
 *   - "numericLike": numeric LIKE (via cast).
 *   - "numericBetween": numeric between.
 *   - "dateComparison": date comparison.
 *   - "dateBetween": date between.
 *   - "booleanComparison": boolean equality comparison.
 *   - "and": logical AND.
 *   - "or": logical OR.
 *   - "not": logical NOT.
 *
 * @returns {Object} A Sequelize query object with a 'where' clause and an 'include' array.
 */
function translateAST(ast, baseModel) {
  // Build associations mapping.
  const associations = {};
  for (const assocName in baseModel.associations) {
    const association = baseModel.associations[assocName];
    associations[assocName] = { model: association.target, as: association.as };
  }

  // Aggregated results.
  const result = { base: null, associations: {} };

  function mergeConditions(existing, newClause, op) {
    if (!existing) return newClause;
    return { [op]: [existing, newClause] };
  }

  /**
   * Translates a string comparison node.
   */
  function translateStringComparison(node) {
    const target = node.left.path === "/" ? "base" : node.left.path.split("/")[1];
    const field = node.left.value;
    let value = evaluateValue(node.right, baseModel);
    if (node.operator === "=") {
      return { target, clause: { [field]: value } };
    } else if (node.operator === "~") {
      if (node.right.type === "literal") {
        if (typeof value === "string" && !value.startsWith('%') && !value.endsWith('%')) {
          value = `%${value}%`;
        }
        return { target, clause: { [field]: { [Op.like]: value } } };
      } else {
        return { target, clause: { [field]: { [Op.like]: value } } };
      }
    }
    throw new Error(`Operator ${node.operator} not supported for string comparisons.`);
  }

  /**
   * Translates a numeric comparison node.
   */
  function translateNumericComparison(node) {
    const target = node.left.path === "/" ? "base" : node.left.path.split("/")[1];
    const field = node.left.value;
    const value = evaluateNumericValue(node.right, baseModel);
    switch (node.operator) {
      case "=":
        return { target, clause: { [field]: value } };
      case "<":
        return { target, clause: { [field]: { [Op.lt]: value } } };
      case ">":
        return { target, clause: { [field]: { [Op.gt]: value } } };
      case "<=":
        return { target, clause: { [field]: { [Op.lte]: value } } };
      case ">=":
        return { target, clause: { [field]: { [Op.gte]: value } } };
      default:
        throw new Error(`Operator ${node.operator} not supported for numeric comparisons.`);
    }
  }

  /**
   * Translates a numeric LIKE node.
   * Uses CAST(... AS CHAR) for MySQL.
   */
  function translateNumericLike(node) {
    const target = node.left.path === "/" ? "base" : node.left.path.split("/")[1];
    const field = node.left.value;
    let value = evaluateNumericValue(node.right, baseModel);
    if (typeof value === "number") {
      value = value.toString();
    }
    if (!value.startsWith('%') && !value.endsWith('%')) {
      value = `%${value}%`;
    }

    const assoc = node.left.path === "/" ? null : node.left.path.split("/")[1];
    const alias = assoc
      ? baseModel.associations[assoc].as
      : baseModel.name;
    const qualified = `${alias}.${field}`;

    return {
      target,
      clause: literal(`CAST(${qualified} AS CHAR) LIKE '${value}'`)
    };
  }

  /**
   * Translates a numeric between node.
   */
  function translateNumericBetween(node) {
    const target = node.field.path === "/" ? "base" : node.field.path.split("/")[1];
    const field = node.field.value;
    const lower = evaluateNumericValue(node.lower, baseModel);
    const upper = evaluateNumericValue(node.upper, baseModel);
    return { target, clause: { [field]: { [Op.gte]: lower, [Op.lte]: upper } } };
  }

  /**
   * Translates a date comparison node.
   */
  function translateDateComparison(node) {
    const target = node.left.path === "/" ? "base" : node.left.path.split("/")[1];
    const field = node.left.value;
    const value = evaluateDateValue(node.right, baseModel);
    switch (node.operator) {
      case "=":
        return { target, clause: { [field]: value } };
      case "<":
        return { target, clause: { [field]: { [Op.lt]: value } } };
      case ">":
        return { target, clause: { [field]: { [Op.gt]: value } } };
      case "<=":
        return { target, clause: { [field]: { [Op.lte]: value } } };
      case ">=":
        return { target, clause: { [field]: { [Op.gte]: value } } };
      default:
        throw new Error(`Operator ${node.operator} not supported for date comparisons.`);
    }
  }

  /**
   * Translates a date between node.
   */
  function translateDateBetween(node) {
    const target = node.field.path === "/" ? "base" : node.field.path.split("/")[1];
    const field = node.field.value;
    const lower = evaluateDateValue(node.lower, baseModel);
    const upper = evaluateDateValue(node.upper, baseModel);
    return { target, clause: { [field]: { [Op.between]: [lower, upper] } } };
  }

  /**
   * Translates a boolean comparison node.
   * Expects an equality between two boolean values.
   */
  function translateBooleanComparison(node) {
    const target = node.left.path === "/" ? "base" : node.left.path.split("/")[1];
    const field = node.left.value;
    const value = evaluateBooleanValue(node.right, baseModel);
    return { target, clause: { [field]: value } };
  }

  /**
   * Recursively walks the AST.
   */
  function walk(node) {
    if (node.type === "comparison") {
      return translateStringComparison(node);
    } else if (node.type === "numericComparison") {
      return translateNumericComparison(node);
    } else if (node.type === "numericLike") {
      return translateNumericLike(node);
    } else if (node.type === "numericBetween") {
      return translateNumericBetween(node);
    } else if (node.type === "dateComparison") {
      return translateDateComparison(node);
    } else if (node.type === "dateBetween") {
      return translateDateBetween(node);
    } else if (node.type === "booleanComparison") {
      return translateBooleanComparison(node);
    } else if (node.type === "and" || node.type === "or") {
      const sequelizeOp = node.type === "and" ? Op.and : Op.or;
      const left = walk(node.left);
      const right = walk(node.right);
      if (left.target === right.target) {
        return { target: left.target, clause: { [sequelizeOp]: [left.clause, right.clause] } };
      }
      return { multi: [left, right], op: sequelizeOp };
    } else if (node.type === "not") {
      const operand = walk(node.left);
      return { target: operand.target, clause: { [Op.not]: operand.clause } };
    }
    console.log(node);
    throw new Error(`Unknown node type: ${node.type}`);
  }

  function processResult(res) {
    if (res.multi) {
      res.multi.forEach(item => addClause(item.target, item.clause));
    } else {
      addClause(res.target, res.clause);
    }
  }

  function addClause(target, clause) {
    if (target === "base") {
      result.base = mergeConditions(result.base, clause, Op.and);
    } else {
      result.associations[target] = mergeConditions(result.associations[target], clause, Op.and);
    }
  }

  const astResult = walk(ast);
  processResult(astResult);

  // Build the final Sequelize query.
  const query = { where: result.base || {} };
  const include = [];
  for (const assocName in result.associations) {
    if (!associations[assocName]) {
      throw new Error(`Association mapping for "${assocName}" not provided in base model.`);
    }
    include.push({
      model: associations[assocName].model,
      as: associations[assocName].as,
      required: false
    });
  }
  if (include.length) query.include = include;

  for (const assocName in result.associations) {
    const prefixed = prefixClause(result.associations[assocName], associations[assocName].as);
    query.where = mergeConditions(query.where, prefixed, Op.and);
  }

  return query;
}

module.exports = { translateAST };
