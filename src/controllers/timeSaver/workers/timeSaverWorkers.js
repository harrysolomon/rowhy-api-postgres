import { pool } from '../../../models/pool';

export const workerList = async (req, res) => {
    try {
      const client_id = req.params.clientId;
      const query = `
        select w.id, w.name, w.cost, w.department, w.period, w.deleted_at, w.created_at, w.updated_at
        from workers w 
        join worker_type wt 
        on w.worker_type_id = wt.id
        where wt.client_id = ${client_id}
        and w.deleted_at is null
        and wt.deleted_at is null
      `;
      const data = await pool.query(query);
      res.status(200).json( data.rows );
    } catch (err) {
      res.status(200).json({ messages: err.stack });
    }
};

export const addWorker = async (req, res) => {
    try {
        await pool.query('BEGIN')
        
        const { name, department, worker_type_id, period, cost, created_by } = req.body;
        const columns = 'name';
        const worker_values = `'${name}', '${department}', ${worker_type_id}, ${period}, ${cost}, ${created_by}`;
  
        const worker = `
        insert into workers(name, department, worker_type_id, period, cost, created_by, created_at, updated_at)
        values (${worker_values},now(),now())
            RETURNING id, ${columns}
        `;
        const worker_output = await pool.query(worker);
  
        res.status(200).json( worker_output.rows );
        await pool.query('COMMIT')
        
    } catch (err) {
        res.status(200).json({ messages: err.stack });
        await pool.query('ROLLBACK')
    } 
};