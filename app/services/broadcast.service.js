const db = require("../models");
const { QueryTypes } = require("sequelize");

const getCentersByOrgIdforBroadcast = async (org_id) => {
    return await db.sequelize.query(
    `select org_name,senior_center_id as id,name from jennydb1.v_broadcast_users 
     where org_id = ${org_id} and active = true and welcome_sent = true group by org_name, senior_center_id,name`,
    {
      type: QueryTypes.SELECT,
    }
  );
}

const getCentersByOrgIdforWelcome = async (org_id) => {
    return await db.sequelize.query(
    `select org_name, senior_center_id as id,name from jennydb1.v_broadcast_users 
     where org_id = ${org_id} and welcome_sent = false group by org_name, senior_center_id,name`,
    {
      type: QueryTypes.SELECT,
    }
  );
}

module.exports = {
  getCentersByOrgIdforBroadcast,
  getCentersByOrgIdforWelcome
};
