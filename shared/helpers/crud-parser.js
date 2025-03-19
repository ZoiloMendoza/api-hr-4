const peggy = require('peggy'); // Assuming you have PEG.js installed
const modelHelper = require('./model-helper');

function getStringColumns(columnTypes) {
    return Object.keys(columnTypes).filter(col => columnTypes[col] === 'STRING');
}

function getNumberColumns(columnTypes) {
    return Object.keys(columnTypes).filter(col => columnTypes[col] === 'INTEGER');
}

function getDecimalColumns(columnTypes) {
    return Object.keys(columnTypes).filter(col => columnTypes[col] === 'FLOAT' || columnTypes[col] === 'DECIMAL');
}

function getDateColumns(columnTypes) {
    return Object.keys(columnTypes).filter(col => columnTypes[col] === 'DATE');
}

function getJsonColumns(columnTypes) {
  return Object.keys(columnTypes).filter(col => columnTypes[col] === 'JSON');
}

function getBooleanColumns(columnTypes) {
    return Object.keys(columnTypes).filter(col => columnTypes[col] === 'BOOLEAN');
}



class CRUDParser {
    model = null;
    parser = null;
    genGrammar() {

      const tvect = modelHelper.getTypesVector();

      

        let  grammar = `Clause
  = OrClause

OrClause
  = left:AndClause _ "OR" _ right:OrClause { return { type: "or", left, right }; }
  / AndClause

AndClause
  = left:UnaryClause _ "AND" _ right:AndClause { return { type: "and", left, right }; }
  / UnaryClause

UnaryClause
  = "NOT" _ expr:UnaryClause { return { type: "not", left: expr }; }
  / PrimaryClause

PrimaryClause
  = "(" _ clause:Clause _ ")" { return clause; }
  / StringComparisonClause
  / NumericComparisonClause
  / DateComparisonClause
  / BooleanComparisonClause

  BooleanComparisonClause
  = left:BooleanValue _ "=" _ right:BooleanValue {
      return { type: "booleanComparison", operator: "=", left, right };
    }
  / BooleanValue

BooleanValue
  = "true" { return { type: "booleanLiteral", value: true }; }
  / "false" { return { type: "booleanLiteral", value: false }; }
  / "!" _ value:BooleanValue { return { type: "booleanNot", value }; }
  / UsersBooleanField


StringComparisonClause
  = left:StringValue _ op:("=" / "~") _ right:StringValue {
      return { type: "comparison", operator: op, left, right };
  }

NumericComparisonClause
  = left:NumericValue _ op:("<=" / ">=" / "<" / ">" / "=" / "~") _ right:NumericValue {
      return { type: op === "~" ? "numericLike" : "numericComparison", operator: op, left, right };
  }
  / left:NumericValue _ "between" _ lower:NumericValue _ "and" _ upper:NumericValue {
      return { type: "numericBetween", field: left, lower, upper };
  }

DateComparisonClause
  = left:DateValue _ op:("<=" / ">=" / "<" / ">" / "=") _ right:DateValue {
      return { type: "dateComparison", operator: op, left, right };
  }
  // ...or a between clause.
  / left:DateValue _ "between" _ lower:DateValue _ "and" _ upper:DateValue {
      return { type: "dateBetween", field: left, lower, upper };
  }

DateValue
  = base:DateLiteral arithmetics:(_ DateArithmetic)* {
      let result = base;
      if(arithmetics.length) {
        arithmetics.forEach(item => {
          const arithmetic = item[1];
          result = { type: "dateArithmetic", base: result, operator: arithmetic.operator, period: arithmetic.period };
        });
      }
      return result;
    }
  / "TODAY" arithmetics:(_ DateArithmetic)* {
      let result = { type: "today" };
      if(arithmetics.length) {
        arithmetics.forEach(item => {
          const arithmetic = item[1];
          result = { type: "dateArithmetic", base: result, operator: arithmetic.operator, period: arithmetic.period };
        });
      }
      return result;
    }
  / field:${this.model.getTableName()}DateField arithmetics:(_ DateArithmetic)* {
      let result = field;
      if(arithmetics.length) {
        arithmetics.forEach(item => {
          const arithmetic = item[1];
          result = { type: "dateArithmetic", base: result, operator: arithmetic.operator, period: arithmetic.period };
        });
      }
      return result;
    }

    // Helper rule to match a single digit.
Digit = [0-9]

// Month must be 01-09 or 10-12.
Month
  = "0" [1-9]
  / "1" [0-2]

// Day must be 01-09, 10-29, 30 or 31.
Day
  = "0" [1-9]
  / ([12] [0-9])
  / "3" [0-1]

// A date literal matching "yyyy-mm-dd" with month/day constraints.
DateLiteral
  = year:$(Digit Digit Digit Digit) "-" month:$(Month) "-" day:$(Day)
    { return { type: "dateLiteral", value: year + "-" + month + "-" + day }; }
    
// Allowed periods for date arithmetic.
Period
  = "day"   { return "day"; }
  / "month" { return "month"; }
  / "year"  { return "year"; }
  
// A date arithmetic operation: plus or minus a period.
DateArithmetic
  = _ op:("+" / "-") _ period:Period
    { return { operator: op, period: period }; }

NumericValue
  = Sum

// Define addition and subtraction
Sum
  = left:Product _ op:("+" / "-") _ right:Sum {
      return { type: "binaryOp", operator: op, left, right };
    }
  / Product

// Define multiplication and division
Product
  = left:Unary _ op:("*" / "/") _ right:Product {
      return { type: "binaryOp", operator: op, left, right };
    }
  / Unary

Unary
  = op:("+" / "-") _ expr:Unary { return { type: "unaryOp", operator: op, expr }; }
  / PrimaryNumeric

PrimaryNumeric
  = NumberLiteral
  / ${this.model.getTableName()}NumberField
  / "round" _ "(" _ expr:NumericValue _ ")" { return { type: "round", value: expr }; }
  / "(" _ expr:NumericValue _ ")" { return expr; }

NumberLiteral
  = digits:[0-9]+ ("." decimals:[0-9]+)? {
      return { type: "number", value: parseFloat(text()) };
  }

StringValue
  = head:(StringLiteral / ${this.model.getTableName()}StringField) tail:(_ "||" _ (StringLiteral / ${this.model.getTableName()}StringField))*
    {
      let tmp =  tail.reduce((acc, cur) => {
        // cur is an array where cur[3] is the right-hand value.
        return { type: "concat", left: acc, right: cur[3] };
      }, head);
      if (tail.length > 0) {
        if ((tmp.left.type === "literal")&&(tmp.right.type === "literal")) {
            return {"type": "literal", value: tmp.left.value + tmp.right.value};
        }
      }
      return tmp;
    }

StringLiteral
  = "\\\"" chars:DoubleQuotedChar* "\\\"" { return {"type": "literal", value: chars.join("")}; }

DoubleQuotedChar
  = "\\\\\\\"" { return "\\\""; }
  / "\\\\\\\\\" { return "\\\\\"; }
  / char:[^"] { return char; }

_ "whitespace"
  = [ \\t\\n\\r]*

`;

const fields = {};
      for (let bType of modelHelper.basicTypes) {
        for(let o of Object.keys(models)) {
          const m = models[o];
          if (m.getTableName) {
            if (tvect[bType][m.getTableName()]) {
              fields[m.getTableName() + bType] = [];
              for (let mType of tvect[bType][m.getTableName()]) {
                if (mType.basic) {
                  fields[m.getTableName() + bType].push(`"${mType.name}" { return  {"type": "field", value: "${mType.name}", "path": "/"}; }`)
                } else {
                  fields[m.getTableName() + bType].push(`"${mType.name}." f:${mType.target}StringField { return  {"type": "field", value: f.value, "path": "/${mType.target}" + f.path}; }`);
                } 
              }
            }
          }
        }
      }

      for (let f of Object.keys(fields)) {
        grammar += `${f}Field
  = ${fields[f].join("\n  / ")}

`
      }

      
      //console.log(grammar)
        return grammar;
    }

    constructor(model, filterCols = []) {
        this.model = model;
        this.columnsToRemove =  new Set(['updatedAt', 'createdAt', 'active'].concat(filterCols));
        //console.log(typesVector)
        const grammar = this.genGrammar();
        //console.log(grammar )
        // Compile the grammar
        this.parser = peggy.generate(grammar);
        logger.info("Parser initialized for model " + this.model.name);
    }

    parse(q , isActive = true) {
      const query = {
        start: parseInt(q.start || 1) - 1,
        limit: parseInt(q.limit || 100),
        order: q.order || 'ASC',
        orderBy: q.orderBy || 'id',
        sq: q.q || '',
        filter: { },
      };
      if (query.sq != "") {
        query.filter = this.parser.parse(query.sq);
      }
      query.filter.active = {value: isActive, type: "Boolean"};
      return query;
    }
}

module.exports = CRUDParser;