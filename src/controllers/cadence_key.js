import { pool } from '../models/pool';

export const cadenceKey = async (req, res) => {
    try {
      const query = `
      select id, name, adj, plural, abbr, singular
      from cadence_key
      `;
      const data = await pool.query(query);
      res.status(200).json( data.rows );
    } catch (err) {
      res.status(200).json({ messages: err.stack });
    }
  };