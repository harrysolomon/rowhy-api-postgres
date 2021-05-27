import { pool } from '../../../models/pool';
import { timeSaverOutput } from '../../../utils/timeSaver/output'
import {lineChart } from '../../../utils/outputSchemas/lineChart'

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

  export const calculatorInputs = async (req, res) => {
    try {
      const client_id = req.params.clientId;
      const calculator_type_id = req.params.calculatorTypeId
      const report_id = req.params.reportId
      const query = `
        select 
        r.name as report_name, 
        tst.name as time_saver_name, 
        p.name as product_name,
        concat(tst.current_time_spent || ' ' || ck.plural || ' per ' || ck2.singular) as current_time_spent,
        w.name as employee_name
        from time_saver_task tst
        join calculator c 
        on tst.calculator_id = c.id
        join report r 
        on c.report_id = r.id
        join time_saver_product tsp 
        on tsp.id = tst.time_saver_product_id
        join workers w 
        on w.id = time_saver_worker_id
        join product p 
        on p.id = tsp.product_id
        join cadence_key ck 
        on ck.id = tst.current_time_spent_period
        join cadence_key ck2
        on ck2.id = tst.cadence
        where c.calculator_type_id = ${calculator_type_id}
        and r.id = ${report_id}
        and tsp.calculator_type_id = ${calculator_type_id}
        and r.client_id = ${client_id}
      `;
      const data = await pool.query(query);
      res.status(200).json( data.rows );
    } catch (err) {
      res.status(200).json({ messages: err.stack });
    }
  };

  export const calculatorData = async (req, res) => {
    try {
      if(req.query.forecast_period===''){
        req.query.forecast_period=1
      }
      const data = await pool.query(timeSaverOutput(req.query,req.params));
      if (req.params.chartType === 'trend') {
        res.status(200).json( lineChart(data.rows) );
      } else {
        res.status(200).json( data.rows );
      }   
    } catch (err) {
      res.status(500).json({ messages: err.stack });
    }
  };