import { pool } from '../../../models/pool';
import format from 'pg-format'
import { timeSaverOutput } from '../../../utils/timeSaver/output'
import {lineChart } from '../../../utils/outputSchemas/lineChart'

export const calculatorList = async (req, res) => {
    try {
      const client_id = req.params.clientId;
      const calculator_type_id = req.params.calculatorTypeId
      const query = `
        select distinct
        ca.id,
        ca.name, 
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
      res.status(500).json({ messages: err.stack });
    }
  };

  export const calculatorInputs = async (req, res) => {
    try {
      const client_id = req.params.clientId;
      const calculator_type_id = req.params.calculatorTypeId
      const calculator_id = req.params.calculatorId
      const query = `
        select 
        c.name as report_name, 
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
        and c.id = ${calculator_id}
        and tsp.calculator_type_id = ${calculator_type_id}
        and r.client_id = ${client_id}
        and tst.deleted_at is null
        and c.deleted_at is null
        and r.deleted_at is null
      `;
      const data = await pool.query(query);
      res.status(200).json( data.rows );
    } catch (err) {
      res.status(500).json({ messages: err.stack });
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

  export const addTimeSaverCalculator = async (req, res) => {
    try {
        await pool.query('BEGIN')

        const client_id = req.params.clientId;
        const calculator_type_id = req.params.calculatorTypeId
        const report_body = req.body.report;
        const report_return_columns = 'id, name, created_at';
        const report_values = `'${report_body.name}', '${report_body.description}', '${report_body.notes}', ${report_body.created_by}`;
  
        const report = `
        insert into report(name,description,notes,created_by,client_id,created_at,updated_at)
        values (${report_values},${client_id},now(),now())
            RETURNING ${report_return_columns}
        `;
        const report_output = await pool.query(report);
        
        const calculator_body = req.body.calculator;
        const calculator_return_columns = 'id, name, created_at';
        const calculator_values = `'${calculator_body.name}', '${calculator_body.description}', '${calculator_body.notes}', ${report_body.created_by}`;
  
        const calculator = `
        insert into calculator(report_id,name,description,notes,created_by,calculator_type_id,created_at,updated_at)
        values ($1,${calculator_values},${calculator_type_id}, now(),now())
            RETURNING ${calculator_return_columns}
        `;

        const returned_report_details = [report_output.rows[0].id]
        const calculator_output = await pool.query(calculator,returned_report_details) 

        const task_array = []
        req.body.tasks.map((task) => {
          let new_task = []
          new_task.push(calculator_output.rows[0].id, task.name, task.description, report_body.created_by, task.cadence, task.current_time_spent, task.current_time_spent_period, task.time_saver_product_id, task.time_saver_worker_id, 'now()', 'now()')
          console.log("the new task is", new_task)
          task_array.push(new_task)
        })

        console.log("the task array is", task_array)

        const tasks = format(`
        insert into time_saver_task(calculator_id,name, description, created_by, cadence, current_time_spent, current_time_spent_period, time_saver_product_id, time_saver_worker_id,created_at,updated_at) 
        values %L RETURNING id`, task_array);

        console.log("the task insert statement is", tasks)

        //const returned_calculator_details = [calculator_output.rows[0].id]
        const tasks_output = await pool.query(tasks)
  
        res.status(200).json({
          report: report_output.rows,
          calculator:  calculator_output.rows,
          tasks: tasks_output.rows
        });
        await pool.query('COMMIT')
        
    } catch (err) {
        res.status(400).json({ messages: err.stack });
        await pool.query('ROLLBACK')
    } 
  };


  export const editTimeSaverCalculator = async (req, res) => {
    try {
        await pool.query('BEGIN')

        const soft_delete_old_tasks = `
        update time_saver_task
        set deleted_at = now()
        where calculator_id = ${req.params.calculatorId}
        `
        const delete_tasks_first = await pool.query(soft_delete_old_tasks)

        const calculator = `
        update calculator
        set name = '${req.body.calculator.name}'
        where id = ${req.params.calculatorId}
        `

        console.log(calculator)
        const update_calculator = await pool.query(calculator);   

        const task_array = []
        req.body.tasks.map((task) => {
          let new_task = []
          new_task.push(req.params.calculatorId, task.name, task.description, req.body.report.created_by, task.cadence, task.current_time_spent, task.current_time_spent_period, task.time_saver_product_id, task.time_saver_worker_id, 'now()', 'now()')
          console.log("the new task is", new_task)
          task_array.push(new_task)
        })

        const tasks = format(`
        insert into time_saver_task(calculator_id,name, description, created_by, cadence, current_time_spent, current_time_spent_period, time_saver_product_id, time_saver_worker_id,created_at,updated_at) 
        values %L RETURNING id`, task_array);

        //const returned_calculator_details = [calculator_output.rows[0].id]
        const new_tasks = await pool.query(tasks)
  
        res.status(200).json({
          calculator: update_calculator.rows,
          old_tasks: delete_tasks_first.rows,
          new_tasks: new_tasks.rows
        });
        await pool.query('COMMIT')
        
    } catch (err) {
        res.status(400).json({ messages: err.stack });
        await pool.query('ROLLBACK')
    } 
  };