import { pool } from '../../../models/pool';

export const calculatorList = async (req, res) => {
    try {
      const client_id = req.params.clientId;
      const calculator_type_id = req.params.calculatorTypeId
      const query = `
        select distinct
        r.id,
        r.name, 
        concat(u.first_name || ' ' || u.last_name) as username,
        c.name as client_name,
        r.created_at,
        r.updated_at
        from report r 
        join client c 
        on r.client_id = c.id
        join users u 
        on r.created_by = u.id
        join calculator ca
        on ca.report_id = r.id
        where r.deleted_at is null
        and ca.deleted_at is null
        and ca.calculator_type_id = ${calculator_type_id}
        and c.id = ${client_id}
      `;
      const data = await pool.query(query);
      res.status(200).json( data.rows );
    } catch (err) {
      res.status(200).json({ messages: err.stack });
    }
  };