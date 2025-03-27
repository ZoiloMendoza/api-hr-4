const {parameter} = models
const { Op } = require('sequelize');
const NodeCache = require("node-cache");
const myCache = new NodeCache();

const getParameter = async (companyId, name) => {
  let parameter = myCache.get(`${name}_${companyId}`);
  if (parameter === undefined) {
    parameter = await parameter.findOne({ where: { name: name, companyId: companyId } });
    if (parameter) {
      myCache.set(`${name}_${companyId}`, parameter);
    } else {
        return null;
    }
  }
  return parameter.value;
};

const getParameters = async (companyId, params) => {
    const parameters = await parameter.findAll({
        where: {
            name: {
                [Op.in]: params
            },
            companyId: companyId
        }
    });
    parameters.forEach(p => myCache.set(p.name, p));
    return parameters;
}

const addParameter = async (companyId, name, value) => {
    logger.info(`Adding parameter ${name}`);
    try {
        const parameter = await parameter.create({ name, value, companyId });
        myCache.set(`${name}_${companyId}`, parameter);
        return parameter.value;
    } catch (error) {
        logger.error(`Error adding parameter ${name}: ${error}`);
        return null;
    }
}

const updateParameter = async (companyId, name, value) => {
    try {
        const updatedRows = await parameter.update({ value }, { where: { name, companyId } });
        if (updatedRows === 0) {
            return null;
        }
        this.invalidateCache(companyId, name);
    } catch (error) {
        return null;
    }
}

const invalidateCache = (companyId, name) => {
    myCache.del(`${name}_${companyId}`);
}

module.exports = { name: 'parameters', getParameter, addParameter, invalidateCache };