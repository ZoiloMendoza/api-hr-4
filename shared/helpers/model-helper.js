const Graph = require('graphology');
const CrudJsonType = require('./crud-jsonType');

class ModelHelper {
  graph = null;
  typesVector = {};
  
  getTypesVector() {
    if (!this.graph) {
      this.buildGraph(models);
    }
    return this.typesVector;
  }

  basicTypes = ["Number", "String", "Boolean", "Date"];
  jsonTypes = [];

  // Helper: map Sequelize attribute type to our basic type.
  mapAttributeType(attr) {
    if (attr && attr.type && attr.type.key) {
      switch (attr.type.key) {
        case "STRING":
        case "TEXT":
          return "String";
        case "INTEGER":
        case "FLOAT":
        case "DECIMAL":
          return "Number";
        case "BOOLEAN":
          return "Boolean";
        case "DATE":
        case "DATEONLY":
          return "Date";
        case "VIRTUAL":
          return null;
        case "JSON_CRUD":
          this.jsonTypes.push(attr);
          //JSON_CRUD IS NOT A BASIC TYPE
        return null;
        default:
          throw new Error(`Unsupported attribute type: ${attr.type.key}`);
      }
    }
    return null;
  }

  buildGraphData(models) {
    // Basic type nodes
    
    const nodes = {};
    const edges = [];

    // Create nodes for basic types.
    this.basicTypes.forEach(type => {
      nodes[type] = { id: type, type: "basic" };
      this.typesVector[type] = {};
    });

  
    // Create nodes for each model.
    Object.keys(models).forEach(modelName => {
        this.jsonTypes.length = 0;
        let skipModels = ["sequelize", "Sequelize"];
        if (skipModels.includes(modelName)) return;
        logger.info(`Building graph data for model ${modelName}`);
        const model = models[modelName];
        nodes[model.name.toLowerCase()] = { id: model.name.toLowerCase(), type: "model" };
        if (model.rawAttributes) {
            Object.keys(model.rawAttributes).forEach(attrName => {
              const attr = model.rawAttributes[attrName];
              const basicType = this.mapAttributeType(attr);
              if (basicType) {
                logger.trace(`Adding edge from ${model.name.toLowerCase()} to ${basicType} with name ${attrName}`);  
                
                //if ((!model.isExcluded) || (!model.isExcluded(attrName))) {
                  if (!this.typesVector[basicType][model.name.toLowerCase()]) {
                    this.typesVector[basicType][model.name.toLowerCase()] = [];
                  }
                  this.typesVector[basicType][model.name.toLowerCase()].push({name: attrName, json: false, basic: true});
                //}
                edges.push({
                  from: model.name.toLowerCase(),
                  to: basicType,
                  label: attrName,
                  multiple: false  // Basic attribute holds a single value.
                });
              }
            });
        }
        if (model.associations) {
            Object.keys(model.associations).forEach(assocName => {
              const assoc = model.associations[assocName];
              const targetName = model.associations[assocName].target.name.toLowerCase();

              if (!targetName) return;
      
              // Determine cardinality flags based on association type.
              let fromMultiple = false;
              let toMultiple = false;
              switch (assoc.associationType) {
                case "HasMany":
                  fromMultiple = true;
                  toMultiple = false;
                  break;
                case "BelongsTo":
                  fromMultiple = false;
                  toMultiple = true;
                  break;
                case "HasOne":
                  fromMultiple = false;
                  toMultiple = false;
                  break;
                case "BelongsToMany":
                  fromMultiple = true;
                  toMultiple = true;
                  break;
                default:
                  break;
              }
              logger.trace(`Adding edge from ${model.name.toLowerCase()} to ${targetName} with name ${assocName} (multiple: ${fromMultiple})`);
              //if ((!model.isExcluded) || (!model.isExcluded(assocName))) {
                this.basicTypes.forEach((bType)=>{
                  if (!this.typesVector[bType][model.name.toLowerCase()]) {
                    this.typesVector[bType][model.name.toLowerCase()] = [];
                  }
                  this.typesVector[bType][model.name.toLowerCase()].push({name: assocName, basic: false, json:false, target: targetName});
                });
              //}
              edges.push({
                from: model.name.toLowerCase(),
                to: targetName,
                label: assocName,
                multiple: fromMultiple
              });
            });
          }  
          for (let attr of this.jsonTypes) {
            const targetName = attr.type.model.name.toLowerCase()
            logger.trace(`Adding edge from ${model.name.toLowerCase()} to JSON  ${targetName} with name ${attr.field}`);
            //if ((!model.isExcluded) || (!model.isExcluded(attr.field))) {
              this.basicTypes.forEach((bType)=>{
                if (!this.typesVector[bType][model.name.toLowerCase()]) {
                  this.typesVector[bType][model.name.toLowerCase()] = [];
                }
                this.typesVector[bType][model.name.toLowerCase()].push({name: attr.field, basic: false, json: true, target: targetName });
              });
            //}
            edges.push({
              from: model.name.toLowerCase(),
              to: targetName,
              label: attr.field,
              multiple: attr.type.isArray
            });
          }
    });

    return { nodes: Object.values(nodes), edges };

}

buildGraph(models) {
    this.graph = new Graph({ multi: true });
    const { nodes, edges } = this.buildGraphData(models);
    Object.keys(nodes).forEach(nodeId => {
        this.graph.addNode(nodes[nodeId].id, nodes[nodeId]);
    });
    edges.forEach(edge => {
        this.graph.addEdge(edge.from, edge.to, { label: edge.label, multiple: edge.multiple });

    });
}

 getFields(fType) {
    if (!this.graph) {
      this.buildGraph(models);
    }
   let result = [];
   try {
    this.graph.forEachInboundEdge(fType, (e, attrs, source)=>{
      result.push({source, attr: attrs.label});
    })
  } catch (e) {
    logger.error(e.message);
    return result;
  }
  return result;
 }
   
getSubmodels(fType) {
  if (!this.graph) {
    this.buildGraph(models);
  }
 let result = [];
 try {
  this.graph.forEachOutboundEdge(fType, (e, attrs, source, target)=>{
    if (!this.basicTypes.includes(target)) {
      result.push({target, attr: attrs.label});
    }
  })
} catch (e) {
  logger.error(e.message);
  return result;
}
return result;
}  


bfs(startNode, visitFn = console.log) {
  if (!this.graph) {
    this.buildGraph(models);
  }
  // Queue for BFS, starting from the startNode.
  const queue = [startNode];
  // A Set to keep track of visited nodes.
  const visited = new Set([startNode]);

  while (queue.length > 0) {
    // Remove the first element from the queue.
    const current = queue.shift();
    // Call the provided visit function (or log by default).
    visitFn(current);

    // Iterate over all outbound neighbors (following directed edges).
    this.graph.forEachOutboundNeighbor(current, (neighbor) => {
      if (neighbor && !this.basicTypes.includes(neighbor)) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    });
  }
}

}

module.exports = new ModelHelper();