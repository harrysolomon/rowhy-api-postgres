import { pool } from '../models/pool';


export const messagesPage = async (req, res) => {
  try {
    const columns = 'name, message';
    const table = 'messages';
    const query = `
        SELECT ${columns} 
        FROM ${table}
    `;
    const data = await pool.query(query);
    res.status(200).json({ messages: data.rows });
  } catch (err) {
    res.status(200).json({ messages: err.stack });
  }
};

export const addMessage = async (req, res) => {
    try {
        await pool.query('BEGIN')
        
        const { name, message } = req.body;
        const columns = 'name, message';
        const table = 'messages'
        const values = `'${name}', '${message}'`;

        const query = `
            INSERT INTO ${table}(${columns})
            VALUES (${values})
            RETURNING id, ${columns}
        `;
        const data = await pool.query(query);
        
        const mapping = 'INSERT INTO message__products(message_id) VALUES ($1) RETURNING id, message_id'
        const mapped_records = [data.rows[0].id]

       
        
        const mapped = await pool.query(mapping,mapped_records)
        console.log(mapped)
        res.status(200).json({ 
            messages: data.rows,
            mapping: mapped.rows
         });
        await pool.query('COMMIT')
        
    } catch (err) {
        res.status(200).json({ messages: err.stack });
        await pool.query('ROLLBACK')
    } 
  };